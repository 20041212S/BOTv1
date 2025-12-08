import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { detectIntent, getStaffInfo, getFeeInfo, getRoomDirections } from '@/lib/chatHelpers';
import { searchKnowledge } from '@/lib/knowledge';
import { callGroqLLM } from '@/lib/groqLlmService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationId } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Detect intent
    const intent = detectIntent(message);

    // Query database based on intent
    const data: any = {};
    
    if (intent === 'FEES_INFO') {
      data.fees = await getFeeInfo(message);
    }
    if (intent === 'STAFF_INFO') {
      data.staff = await getStaffInfo(message);
    }
    if (intent === 'DIRECTIONS') {
      data.room = await getRoomDirections(message);
    }

    // Always search knowledge base for supplemental context
    const knowledge = await searchKnowledge(message, 5);
    if (knowledge.length) {
      data.knowledge = knowledge;
    }

    // Construct sources for UI (RAG-style)
    const sources =
      knowledge?.map((k: any) => ({
        title: k.name,
        source: k.source,
        snippet: k.text?.slice(0, 160) + (k.text?.length > 160 ? '...' : ''),
      })) || [];

    // Call Groq LLM
    const llmResponse = await callGroqLLM({
      intent,
      userMessage: message,
      data: { ...data, sources },
    });

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
      });
    }

    if (!conversation) {
      // Create new conversation with title from first message
      const title = message.length > 50 ? message.substring(0, 50) + '...' : message;
      conversation = await prisma.conversation.create({
        data: { title },
      });
    }

    // Save user message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        sender: 'user',
        content: message,
      },
    });

    // Save assistant response
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        sender: 'assistant',
        content: llmResponse.answer,
      },
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      answer: llmResponse.answer,
      sources: llmResponse.sources,
      conversationId: conversation.id,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

