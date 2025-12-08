// LLM Service - OpenAI Integration
// Uses OpenAI API to generate natural language responses based on user queries and database data

import OpenAI from 'openai';

// Initialize OpenAI client
// Note: OPENAI_API_KEY must be set in environment variables
if (!process.env.OPENAI_API_KEY) {
  console.warn('Warning: OPENAI_API_KEY is not set. Chat functionality will use fallback responses.');
}

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

export interface LLMRequest {
  intent: string;
  userMessage: string;
  data?: any; // Data from database queries
}

export interface LLMResponse {
  answer: string;
  sources: Source[];
}

export interface Source {
  title: string;
  snippet: string;
  documentId?: string;
}

/**
 * Call OpenAI API to generate a natural language response
 * Uses structured data from the database to provide accurate answers
 */
export async function callLLM(request: LLMRequest): Promise<LLMResponse> {
  const { intent, userMessage, data } = request;

  // Build a system prompt so the model understands the app
  const systemPrompt = `
You are the official campus assistant chatbot for Providence College of Engineering.
You must always answer using the structured data provided in the "DATA" section below when it is available.
If the data does not contain the requested information, say you are not sure and suggest contacting the college office.

Rules:
- If "DATA" includes staff or fee information, treat it as the single source of truth.
- Never invent staff names, fees, or classroom codes.
- Keep answers clear and concise.
- Provide text-based directions only; do not generate maps.
- Be friendly and helpful in your responses.
- If asked about information not in the DATA section, politely explain that you don't have that information and suggest contacting the administration office.

You are currently handling an intent: ${intent}.
  `.trim();

  // Format the data for the prompt
  const dataString = data ? JSON.stringify(data, null, 2) : "No structured data provided.";

  const userPrompt = `
User question:
"${userMessage}"

DATA (from database/backend):
${dataString}
`.trim();

  // Check if OpenAI is configured
  if (!openai) {
    console.error('OpenAI API key is not configured');
    return getFallbackResponse(data);
  }

  try {
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const answer = completion.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate a response.";

    // Generate sources based on the data provided
    const sources: Source[] = [];

    if (data) {
      if (data.fees && data.fees.length > 0) {
        sources.push({
          title: 'Fee Structure 2024',
          snippet: `Fee information for ${data.fees[0]?.programName || 'the program'}`,
        });
      }
      if (data.staff && data.staff.length > 0) {
        sources.push({
          title: 'Faculty Directory',
          snippet: `Contact information for ${data.staff[0]?.name || 'faculty members'}`,
        });
      }
      if (data.room) {
        sources.push({
          title: 'Campus Map',
          snippet: `Location details for ${data.room.roomCode || 'the location'}`,
        });
      }
    }

    // Add default source if none exist
    if (sources.length === 0) {
      sources.push({
        title: 'Student Handbook 2024',
        snippet: 'General campus information and policies',
      });
    }

    return { answer, sources };
  } catch (error) {
    console.error('OpenAI API error:', error);
    return getFallbackResponse(data);
  }
}

/**
 * Fallback response generator when OpenAI API is unavailable
 */
function getFallbackResponse(data?: any): LLMResponse {
  let fallbackAnswer = "I'm having trouble connecting to the service right now. ";
  
  if (data) {
    if (data.fees && data.fees.length > 0) {
      const fee = data.fees[0];
      fallbackAnswer += `Based on available data, the ${fee.programName} program has fee information. Please contact the administration for details.`;
    } else if (data.staff && data.staff.length > 0) {
      const staff = data.staff[0];
      fallbackAnswer += `${staff.name} is ${staff.designation} in the ${staff.department} department.`;
      if (staff.email) {
        fallbackAnswer += ` Contact: ${staff.email}`;
      }
    } else if (data.room) {
      fallbackAnswer += `${data.room.roomCode} is located in ${data.room.buildingName} on ${data.room.floor}.`;
      if (data.room.textDirections) {
        fallbackAnswer += ` ${data.room.textDirections}`;
      }
    } else {
      fallbackAnswer += "Please contact the administration office for assistance.";
    }
  } else {
    fallbackAnswer += "Please try again later or contact the administration office.";
  }

  return {
    answer: fallbackAnswer,
    sources: [{
      title: 'Campus Assistant',
      snippet: 'General information',
    }],
  };
}
