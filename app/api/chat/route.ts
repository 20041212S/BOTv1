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
     const isSimpleGreeting = intent === 'GREETING';

    // Query database based on intent
    const data: any = {};
    let knowledge: any[] = [];
    
    // For simple greetings, skip all data fetching - just respond naturally
    if (!isSimpleGreeting) {
      // Always try to get relevant data based on intent
      if (intent === 'FEES_INFO') {
        data.fees = await getFeeInfo(message);
      }
      if (intent === 'STAFF_INFO') {
        data.staff = await getStaffInfo(message);
      }
      if (intent === 'DIRECTIONS') {
        data.room = await getRoomDirections(message);
      }
      if (intent === 'ADMISSION_INFO' || intent === 'GENERAL_INFO') {
        // For admission and general queries, also try to get staff/fees if relevant
        if (message.toLowerCase().includes('facult') || message.toLowerCase().includes('staff')) {
          data.staff = await getStaffInfo(message);
        }
        if (message.toLowerCase().includes('fee') || message.toLowerCase().includes('cost')) {
          data.fees = await getFeeInfo(message);
        }
      }

      // ALWAYS search knowledge base first - it's the primary learning source
      // Get more results for better context
      knowledge = await searchKnowledge(message, 15);
      
      // Prioritize knowledge base content
      if (knowledge.length > 0) {
        data.knowledge = knowledge;
        // If we have strong knowledge base matches, prioritize them
        // by placing them first in the data structure
        data.priority = 'knowledge_base';
      }
    }

    // Construct sources for UI (RAG-style) from knowledge base
    // Skip sources for simple greetings
    const sources = isSimpleGreeting ? [] : (
      data.knowledge?.map((k: any) => ({
        title: k.name || 'Knowledge Entry',
        source: k.source || 'Admin',
        type: k.type || 'General',
        snippet: k.text?.slice(0, 200) + (k.text?.length > 200 ? '...' : ''),
      })) || []
    );

    // Enhance data with metadata for better LLM understanding
    const enhancedData = {
      ...data,
      sources,
      metadata: {
        hasKnowledge: knowledge.length > 0,
        knowledgeCount: knowledge.length,
        hasStaff: data.staff && data.staff.length > 0,
        hasFees: data.fees && data.fees.length > 0,
        hasRoom: !!data.room,
        intent,
      },
    };

    // Call Groq LLM with enhanced context
    const llmResponse = await callGroqLLM({
      intent,
      userMessage: message,
      data: enhancedData,
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
   } catch (error: any) {
    console.error('Chat API error:', error);
    console.error('Error stack:', error?.stack);
    return NextResponse.json(
      { 
        error: error?.message || 'Internal server error',
        answer: "I'm sorry, I encountered an error processing your request. Please try again or contact support if the issue persists.",
        sources: []
      },
       { status: 500 }
    );
  }
}

