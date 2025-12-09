import Groq from 'groq-sdk';

export type LlmContext = {
  intent: string;
  userMessage: string;
  data?: any; // structured data from DB / knowledge search
};

const groqApiKey = process.env.GROQ_API_KEY;

if (!groqApiKey) {
  console.warn('GROQ_API_KEY is not set. LLM responses will not be available.');
}

const groq = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null;

export async function callGroqLLM(
  ctx: LlmContext
): Promise<{ answer: string; sources?: any[] }> {
  const { intent, userMessage, data } = ctx;

  // Prioritize knowledge base content
  const hasKnowledge = data?.knowledge && Array.isArray(data.knowledge) && data.knowledge.length > 0;
  const hasStaff = data?.staff && Array.isArray(data.staff) && data.staff.length > 0;
  const hasFees = data?.fees && Array.isArray(data.fees) && data.fees.length > 0;
  const hasRoom = data?.room;

  // Format knowledge base entries for better understanding
  let knowledgeSection = '';
  if (hasKnowledge) {
    knowledgeSection = `
📚 KNOWLEDGE BASE CONTENT (Admin-provided information - USE THIS AS PRIMARY SOURCE):
${data.knowledge.map((k: any, idx: number) => `
Entry ${idx + 1}:
- Title: ${k.name || 'Untitled'}
- Type: ${k.type || 'General'}
- Source: ${k.source || 'Admin'}
- Content: ${k.text || ''}
`).join('\n')}
`;
  }

  // Format other data
  let staffSection = '';
  if (hasStaff) {
    staffSection = `
👥 STAFF INFORMATION:
${JSON.stringify(data.staff, null, 2)}
`;
  }

  let feesSection = '';
  if (hasFees) {
    feesSection = `
💰 FEE INFORMATION:
${JSON.stringify(data.fees, null, 2)}
`;
  }

  let roomSection = '';
  if (hasRoom) {
    roomSection = `
📍 ROOM/LOCATION INFORMATION:
${JSON.stringify(data.room, null, 2)}
`;
  }

  // Detect if this is a simple greeting
  const isGreeting = intent === 'GREETING';
  const hasData = hasKnowledge || hasStaff || hasFees || hasRoom;

  const systemPrompt = `
You are a friendly and helpful campus assistant chatbot for Providence College of Engineering (PCE).
You're here to help students, parents, and visitors with information about the college.

🎯 IMPORTANT RULES:

${isGreeting ? `
**FOR GREETINGS (like "hi", "hello", "hey"):**
- Respond naturally and conversationally, like a real person would
- Keep it SHORT and FRIENDLY - just 1-2 sentences
- Don't overwhelm with information - just greet them back
- Examples of good responses:
  * "Hi there! How can I help you today?"
  * "Hello! What would you like to know about PCE?"
  * "Hey! I'm here to help with any questions about the college. What can I help you with?"
- DO NOT list features, capabilities, or information unless asked
- Just be warm and welcoming, then wait for their actual question
` : `
**FOR ACTUAL QUESTIONS:**

1. KNOWLEDGE BASE PRIORITY:
   - If KNOWLEDGE BASE CONTENT is provided, it contains information directly added by administrators
   - ALWAYS prioritize and use knowledge base content as your PRIMARY source
   - Knowledge base content is the most accurate and up-to-date information
   - When knowledge base content answers the question, use it EXACTLY and explain it clearly

2. RESPONSE STYLE:
   - Be conversational and human-like - talk like a friendly person, not a robot
   - Use natural language, contractions (I'm, you're, don't), and casual expressions when appropriate
   - Provide clear, structured information when needed
   - Use bullet points or numbered lists ONLY when listing multiple items
   - Be specific with details (names, amounts, locations, etc.) when relevant
   - Don't over-explain - give just enough information to answer the question

3. DATA USAGE:
   - Use staff information to list relevant staff members naturally
   - Use fee information to provide specific amounts and categories
   - Use room information to give clear directions
   - Only include data that's actually relevant to the question

4. CLARITY AND UNDERSTANDING:
   - Write in simple, easy-to-understand language
   - Avoid jargon unless necessary, and explain it if used
   - Break down complex information into digestible parts
   - Use examples when helpful
   - Format numbers, dates, and important details clearly

5. DEPARTMENT ABBREVIATIONS:
   - CSE = Computer Science and Engineering
   - ME = Mechanical Engineering
   - EE = Electrical Engineering
   - ECE = Electronics and Communication Engineering

6. WHEN INFORMATION IS MISSING:
   - If you have partial information, provide what you CAN tell them
   - Be honest about what you don't know
   - Suggest contacting the administration office for complete details
   - Provide contact information if available in the knowledge base

7. TONE AND PERSONALITY:
   - Be warm, friendly, and approachable - like talking to a helpful friend
   - Show genuine interest in helping
   - Be patient and clear
   - Use natural, conversational language
   - Vary your responses - don't sound repetitive or robotic
   - Match the user's energy level (if they're casual, be casual; if formal, be professional)

8. FORMATTING (IMPORTANT):
   - Use double line breaks (\n\n) to separate paragraphs for better readability
   - Use single line breaks (\n) within paragraphs only when necessary
   - When listing items, use bullet points with "- " or "* " at the start of each line
   - Keep paragraphs short (2-4 sentences max) for easy reading
   - Add spacing between different topics or sections
   - Format numbers, dates, and important details clearly
   - Example format:
     "Here's the information you need:

     The library hours are:
     - Monday to Friday: 8 AM to 8 PM
     - Saturday: 9 AM to 5 PM
     - Sunday: Closed

     For more details, you can contact the library office."
`}

Current intent detected: ${intent}
${hasData ? 'Data is available to answer the question.' : 'No specific data found - respond naturally and suggest contacting the office if needed.'}

Remember: Be HUMAN, be FRIENDLY, be HELPFUL - but don't overwhelm with information unless asked!
  `.trim();

  const userPrompt = isGreeting ? `
User just said: "${userMessage}"

This is a simple greeting. Respond naturally and briefly - just greet them back and ask how you can help. 
Keep it short (1-2 sentences max). Don't provide any information unless they ask for it.
  `.trim() : `
User's Question:
"${userMessage}"

${knowledgeSection}

${staffSection}

${feesSection}

${roomSection}

${!hasKnowledge && !hasStaff && !hasFees && !hasRoom ? 'No specific data found in database. Respond naturally and suggest contacting the office for specific details.' : ''}

INSTRUCTIONS:
- Answer the user's question naturally and conversationally
- If knowledge base content is available, use it as your primary source
- Be human-like and friendly - talk like a real person would
- Don't be overly formal or robotic
- Only provide the information that's relevant to their question
- Keep it clear and easy to understand
  `.trim();

  if (!groq) {
    return {
      answer:
        'LLM is not configured. Please set GROQ_API_KEY on the server to enable responses.',
      sources: Array.isArray(data?.sources) ? data.sources : [],
    };
  }

  const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

  try {
    const completion = await groq.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    const answer =
      completion.choices?.[0]?.message?.content ??
      "Sorry, I couldn't generate a response.";

    return {
      answer,
      sources: Array.isArray(data?.sources) ? data.sources : [],
    };
  } catch (error: any) {
    console.error('Groq LLM error:', error);
    const friendly =
      error?.error?.message ||
      error?.message ||
      'I am having trouble connecting to the service right now. Please try again later or contact the administration office.';
    return {
      answer: friendly,
      sources: Array.isArray(data?.sources) ? data.sources : [],
    };
  }
}

