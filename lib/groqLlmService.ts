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

  const systemPrompt = `
You are the official campus assistant chatbot for a college.
You must ALWAYS use the structured DATA provided below as the single source of truth.
Rules:
- If DATA includes staff / fees / rooms / knowledge, do not invent new values.
- If the data does not contain the requested info, say you are not sure and suggest contacting the college office.
- Keep answers clear and concise.
Current intent: ${intent}
  `.trim();

  const dataBlock = data ? JSON.stringify(data, null, 2) : 'No structured data provided.';

  const userPrompt = `
User question:
"${userMessage}"

DATA (from database / knowledge base):
${dataBlock}
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

