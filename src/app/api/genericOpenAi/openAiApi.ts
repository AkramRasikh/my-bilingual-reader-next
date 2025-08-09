import OpenAI from 'openai';

const apiKey = process.env.NEXT_PUBLIC_OPEN_AI;

const openai = new OpenAI({
  apiKey,
});

interface OpenAIAPITypes {
  systemPrompt: string;
  userPrompt: string;
}

export default async function OpenAiApi({
  systemPrompt,
  userPrompt,
}: OpenAIAPITypes) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-5-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 1700,
  });

  const raw = completion.choices[0].message?.content?.trim() ?? '';

  return raw;
}
