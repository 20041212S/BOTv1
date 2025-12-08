import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { learnFromKnowledgeBase, ensureInitialized } from '@/lib/learningEngine';

// PUT - Update knowledge entry
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { source, type, name, text } = body;

    if (!source || !type || !name || !text) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const knowledge = await prisma.knowledge.update({
      where: { id },
      data: {
        source: source.trim(),
        type: type.trim(),
        name: name.trim(),
        text: text.trim(),
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorId: user.userId,
        action: 'KNOWLEDGE_UPDATE',
        entityType: 'Knowledge',
        entityId: knowledge.id,
        severity: 'INFO',
      },
    });

    // Ensure learning engine is ready, then learn from updated knowledge (async, don't wait)
    ensureInitialized().then(() => {
      learnFromKnowledgeBase().catch(err => {
        console.error('Error learning from updated knowledge:', err);
      });
    }).catch(() => {
      // If initialization fails, still try to learn
      learnFromKnowledgeBase().catch(err => {
        console.error('Error learning from updated knowledge:', err);
      });
    });

    return NextResponse.json(knowledge);
  } catch (error) {
    console.error('Knowledge PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete knowledge entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await prisma.knowledge.delete({
      where: { id },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorId: user.userId,
        action: 'KNOWLEDGE_DELETE',
        entityType: 'Knowledge',
        entityId: id,
        severity: 'INFO',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Knowledge DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

