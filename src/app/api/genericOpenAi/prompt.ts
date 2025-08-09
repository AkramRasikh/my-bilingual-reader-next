export const genericOpenAiSystemPrompt = `You are a bilingual tutor. You will be given Japanese words and asked to build a short sentence using them. Your job is to return a structured JSON object containing the Japanese sentence, its English translation, and helpful notes for learners.`;

export const getGenericOpenAiPrompt = (transcript: string[]) => `

    I found a video online from Richard Wolf an american economist. I want a condensed and **Japanese** version of his transcript below.

    ## Core requirement:
    1. The main meaning and ethos of the speech should remain the same
    2. It should have a chatty natural speaking style - much like his natural informal monologue style that he is known for
    3. This is from a youtube auto generated transcript so the accuracy of this transcript isn't perfect but the meaning is the main thing we are after
    4. Try to keep the response to be around 5 minutes long as a speech measurement
    5. Return a JSON array that will be an array of strings
    6. Make sure you are only passing **pure JSON** to JSON.parse()

    ## Transcript:
    ${JSON.stringify(transcript)}

    ## Final instruction
    > "Respond with valid JSON only — do not include any markdown formatting (no triple backticks or language tags)."

    `;
