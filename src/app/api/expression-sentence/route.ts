import { readFileSync } from 'node:fs';
import path from 'node:path';
import OpenAI from 'openai';
import expressiveFunctionsFile from '@/app/expressions/data/expressive_functions.json';
import linguisticConstructionsFile from '@/app/expressions/data/linguistic_constructions.json';

type NamedChoice = {
  name?: string;
  subcategory?: string | null;
  option?: string | null;
};

type WordChoice = {
  surfaceForm?: string;
  baseForm?: string;
  definition?: string;
};

type PairPrevious = {
  targetLang?: string;
  baseLang?: string;
  expressive?: NamedChoice | null;
  linguistic?: NamedChoice | null;
};

type ExpressionSentenceRequest = {
  language?: string;
  expressive?: NamedChoice | null;
  linguistic?: NamedChoice | null;
  word?: WordChoice | null;
  inspiration?: boolean;
  multi?: boolean;
  words?: WordChoice[] | null;
  pair?: boolean;
  swapped?: 'expressive' | 'linguistic';
  previous?: PairPrevious | null;
  combine?: boolean;
  linguistics?: NamedChoice[] | null;
};

type FunctionLabel = {
  name: string;
  detail: string | null;
};

const expressiveCatalog = expressiveFunctionsFile.expressive_functions
  .map(
    (item) =>
      `${item.name}: ${item.subcategories.map((child) => child.name).join('; ')}`,
  )
  .join('\n');

const linguisticCatalog = [
  ...linguisticConstructionsFile.dimensions,
  ...linguisticConstructionsFile.separate_expression_dimensions,
]
  .map(
    (item) =>
      `${item.name}: ${item.options.map((child) => child.name).join('; ')}`,
  )
  .join('\n');

const isText = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const deepSeekKey = () => {
  if (process.env.DEEPSEEK_KEY) return process.env.DEEPSEEK_KEY;

  try {
    const envPath = path.resolve(
      process.cwd(),
      '../firebase-google-translate/functions/.env',
    );
    const line = readFileSync(envPath, 'utf8')
      .split('\n')
      .find((item) => item.startsWith('DEEPSEEK_KEY='));
    const value = line?.slice('DEEPSEEK_KEY='.length).trim();
    return value?.replace(/^["']|["']$/g, '');
  } catch {
    return undefined;
  }
};

const choiceLine = (label: string, choice: NamedChoice | null | undefined) => {
  const name = choice?.name?.trim();
  if (!name) return `${label}: none`;
  const detail = choice.subcategory?.trim() || choice.option?.trim();
  return detail ? `${label}: ${name} / ${detail}` : `${label}: ${name}`;
};

const needsTransliteration = (language: string) =>
  language === 'chinese' || language === 'japanese' || language === 'arabic';

const transliterationRule = (language: string) => {
  if (language === 'chinese') {
    return 'transliteration is Hanyu pinyin of the complete targetLang sentence, with tone marks, grouped by word.';
  }
  if (language === 'japanese') {
    return 'transliteration is standard Hepburn romanization of the complete targetLang sentence, including macrons for long vowels. It must match that sentence.';
  }
  if (language === 'arabic') {
    return 'transliteration is a standard academic romanization of the complete targetLang sentence, with ʿ for ayn and vowels marked. It must match that sentence.';
  }
  return '';
};

const wordSummary = (word: WordChoice, index?: number) => {
  const prefix = typeof index === 'number' ? `${index + 1}. ` : '';
  return `${prefix}surface form ${JSON.stringify(word.surfaceForm || '')}, base form ${JSON.stringify(word.baseForm || '')}, meaning ${JSON.stringify(word.definition || 'no definition')}`;
};

const buildMultiPrompt = (language: string, words: WordChoice[]) => {
  const withTransliteration = needsTransliteration(language);
  const inspiration = words
    .map((word, index) => wordSummary(word, index))
    .join('\n');

  return `Create one natural sentence in ${language} for a language learner.
The point is to practise one expressive function and one linguistic construction. You choose both from the lists below and copy those names exactly.
The words are inspiration, not a list you must use. Use whichever ones help, including none of them. A surface form may already be conjugated. Change its form, particles, or conjugation so it fits. Do not copy a surface form exactly when another form is more natural.
Apart from any inspired word you keep, use the most common everyday words. Choose a less common word only when the culture, or an inspired word, would make a plain word sound wrong.

Inspiration words:
${inspiration}

Expressive functions. Pick one name, and a subcategory when one fits:
${expressiveCatalog}

Linguistic constructions. Pick one name, and an option when one fits:
${linguisticCatalog}
${withTransliteration ? transliterationRule(language) : ''}

Return JSON with exactly these fields:
{
  "targetLang": "the sentence in ${language}",${
    withTransliteration
      ? '\n  "transliteration": "the reading of targetLang",'
      : ''
  }
  "baseLang": "a natural English translation",
  "notes": "a short explanation of how the chosen expressive function and linguistic construction appear in the sentence",
  "expressive": { "name": "category name from the list", "subcategory": "subcategory name, or empty" },
  "linguistic": { "name": "construction name from the list", "option": "option name, or empty" },
  "usedWord": "surface form copied exactly from the inspiration list for the word you drew on, or empty if you used none"
}`;
};

const readLabel = (
  value: unknown,
  detailKey: 'subcategory' | 'option',
): FunctionLabel | null => {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  if (!isText(record.name)) return null;
  return {
    name: record.name.trim(),
    detail: isText(record[detailKey]) ? record[detailKey].trim() : null,
  };
};

const usableWords = (words: WordChoice[] | null | undefined) =>
  (words ?? []).filter(
    (word) => word?.surfaceForm?.trim() || word?.baseForm?.trim(),
  );

const buildPrompt = (body: ExpressionSentenceRequest) => {
  const word = body.word;
  const language = body.language ?? '';
  const inspirationWords = usableWords(body.words);
  const hasWord = Boolean(word?.surfaceForm?.trim() || word?.baseForm?.trim());
  const wordLine = body.inspiration
    ? `Inspiration words. These are optional. Use one only when it serves the expressive function and the sentence stays clear. If a word would force an odd or unclear sentence, skip it. Using none of them is a good result.
${
  inspirationWords.length > 0
    ? inspirationWords.map((item, index) => wordSummary(item, index)).join('\n')
    : 'none'
}`
    : hasWord
      ? `Optional word: surface form ${JSON.stringify(word?.surfaceForm || '')}, base form ${JSON.stringify(word?.baseForm || '')}, meaning ${JSON.stringify(word?.definition || 'no definition')}.
Use this word only when it fits the expressive function and linguistic construction without making the sentence awkward or unclear. If it does not fit, leave it out. The surface form may already be conjugated. When you do use it, change its form, particles, or conjugation so it fits. Do not copy the surface form exactly when another form is more natural.`
      : 'Optional word: none';
  const withTransliteration = needsTransliteration(language);

  return `Create one clear, natural sentence in ${language} for a language learner.
The expressive function and the linguistic construction are the most important part. Clarity comes next.
Do not bend the sentence so that a word can appear in it. A simple sentence that practises the function is better than an awkward sentence that includes a word.
${
  body.inspiration
    ? 'The words below are inspiration only, especially when they do not fit the function.'
    : 'A selected word is optional. Keep it only when it fits naturally.'
}
Apart from a word you choose to keep, use the most common everyday words. Choose a less common word only when the culture, or a kept word itself, would make a plain word sound wrong.

${choiceLine('Expressive function', body.expressive)}
${
  namedLinguistics(body).length > 1
    ? `${namedLinguistics(body)
        .map((item) => choiceLine('Linguistic construction', item))
        .join(
          '\n',
        )}\nSeveral linguistic constructions are listed. Use them together in one coherent sentence. An expressive function is optional. If one construction cannot join without making the sentence unclear, leave it out.`
    : choiceLine('Linguistic construction', body.linguistic)
}
${wordLine}
${withTransliteration ? transliterationRule(language) : ''}

Return JSON with exactly these fields:
{
  "targetLang": "the sentence in ${language}",${
    withTransliteration
      ? '\n  "transliteration": "the reading of targetLang",'
      : ''
  }
  "baseLang": "a natural English translation",
  "notes": "a short explanation of how the expressive function and grammatical choices appear in the sentence"
}`;
};

const namedLinguistics = (body: ExpressionSentenceRequest) =>
  (body.linguistics ?? []).filter((item) => item?.name?.trim());

const buildCombinePrompt = (body: ExpressionSentenceRequest) => {
  const language = body.language ?? '';
  const linguistics = namedLinguistics(body);
  const inspirationWords = usableWords(body.words);
  const withTransliteration = needsTransliteration(language);
  const expressiveName = body.expressive?.name?.trim();

  return `Write one coherent sentence in ${language} for a language learner.
Several linguistic constructions are required together. They must feel like one natural moment, not a list of grammar features stapled on.
Use every construction that can share that moment. If one cannot join without making the sentence unclear or unnatural, leave that one out rather than forcing it.
One sentence is the goal. Use a second sentence only when the constructions cannot share a single clear sentence, and keep both sentences about the same situation.
An expressive function is not required.
${
  expressiveName
    ? `${choiceLine('Optional expressive function', body.expressive)}\nUse it only when it fits the linguistic combination.`
    : 'Expressive function: none. Do not add one for its own sake.'
}

Linguistic constructions to combine:
${linguistics.map((item) => `- ${choiceLine('Construction', item)}`).join('\n')}

Inspiration words. These are optional. Coherence matters more than using them. Use one only when it belongs in this combination. Skip every word that would make the sentence less clear.
${
  inspirationWords.length > 0
    ? inspirationWords.map((item, index) => wordSummary(item, index)).join('\n')
    : 'none'
}
Apart from a word you choose to keep, use the most common everyday words.
${withTransliteration ? transliterationRule(language) : ''}

Return JSON with exactly these fields:
{
  "targetLang": "the sentence in ${language}",${
    withTransliteration
      ? '\n  "transliteration": "the reading of targetLang",'
      : ''
  }
  "baseLang": "a natural English translation",
  "notes": "how the linguistic constructions fit together, which one was left out if any, and whether an inspiration word was kept"
}`;
};

const buildPairPrompt = (body: ExpressionSentenceRequest) => {
  const language = body.language ?? '';
  const changed =
    body.swapped === 'linguistic'
      ? 'linguistic construction'
      : 'expressive function';
  const kept =
    body.swapped === 'linguistic'
      ? 'expressive function'
      : 'linguistic construction';
  const previous = body.previous;
  const withTransliteration = needsTransliteration(language);

  return `Write one minimal-pair sentence in ${language} for a language learner.
Start from the original sentence. Keep the same situation and participants, and keep as much of the wording as still fits.
Change only the ${changed}. The ${kept} stays the same.
Do not introduce a new topic. No words are provided, and none should be added just to decorate the sentence.
Use common everyday words, and keep words from the original sentence when they still fit the new recipe.

Original sentence: ${JSON.stringify(previous?.targetLang ?? '')}
Original English: ${JSON.stringify(previous?.baseLang ?? '')}
${choiceLine('Original expressive function', previous?.expressive)}
${choiceLine('Original linguistic construction', previous?.linguistic)}

${choiceLine('New expressive function', body.expressive)}
${choiceLine('New linguistic construction', body.linguistic)}
The changed slot is the ${changed}.
${withTransliteration ? transliterationRule(language) : ''}

Return JSON with exactly these fields:
{
  "targetLang": "the paired sentence in ${language}",${
    withTransliteration
      ? '\n  "transliteration": "the reading of targetLang",'
      : ''
  }
  "baseLang": "a natural English translation",
  "notes": "how the sentence stays related to the original, and how the one changed recipe slot appears"
}`;
};

export async function POST(req: Request) {
  const body = (await req.json()) as ExpressionSentenceRequest;
  const language = body.language?.trim();
  const inspirationWords = usableWords(body.words);
  const isInspiration = body.inspiration === true;
  const isMulti = body.multi === true;
  const linguisticChoices = namedLinguistics(body);
  const isCombine = body.combine === true;
  const isPair = body.pair === true;
  const pairReady =
    isText(body.previous?.targetLang) &&
    ((body.swapped === 'expressive' &&
      Boolean(body.expressive?.name?.trim())) ||
      (body.swapped === 'linguistic' &&
        Boolean(body.linguistic?.name?.trim())));
  const hasRecipe = Boolean(
    body.expressive?.name?.trim() ||
    body.linguistic?.name?.trim() ||
    body.word?.surfaceForm?.trim() ||
    body.word?.baseForm?.trim(),
  );

  if (
    !language ||
    (isCombine
      ? linguisticChoices.length < 2
      : isPair
        ? !pairReady
        : isMulti
          ? inspirationWords.length === 0
          : !hasRecipe)
  ) {
    return Response.json(
      {
        error: isCombine
          ? 'Choose at least two linguistic constructions.'
          : isPair
            ? 'A previous sentence and the recipe slot to change are required.'
            : isMulti
              ? 'Choose a language and show at least one due word.'
              : 'Choose a language and at least one function or word.',
      },
      { status: 400 },
    );
  }

  const apiKey = deepSeekKey();
  if (!apiKey) {
    return Response.json(
      { error: 'DEEPSEEK_KEY is not set.' },
      { status: 500 },
    );
  }

  try {
    const client = new OpenAI({
      apiKey,
      baseURL: 'https://api.deepseek.com/v1',
    });
    const completion = await client.chat.completions.create({
      model: 'deepseek-v4-flash',
      messages: [
        {
          role: 'system',
          content: isCombine
            ? `You write one coherent ${language} learner sentence that combines several linguistic constructions. An expressive function is optional. Inspiration words must not be forced. Clarity comes first. Return a JSON object.`
            : isPair
              ? `You write one minimal-pair ${language} learner sentence. Change only the requested recipe slot and keep the original situation close. Do not use a word list. Return a JSON object.`
              : isInspiration
                ? `You write one clear ${language} learner sentence. Practise the given expressive function and linguistic construction. Inspiration words are optional and must not be forced into the sentence. Return a JSON object.`
                : isMulti
                  ? `You write one natural ${language} learner sentence. The supplied words are only inspiration. Choose the expressive function and linguistic construction. Return a JSON object.`
                  : `You write one clear ${language} learner sentence from a short recipe. Do not force a word into an awkward sentence. Return a JSON object.`,
        },
        {
          role: 'user',
          content: isCombine
            ? buildCombinePrompt({ ...body, language })
            : isPair
              ? buildPairPrompt({ ...body, language })
              : isMulti && !isInspiration
                ? buildMultiPrompt(language, inspirationWords)
                : buildPrompt({ ...body, language }),
        },
      ],
      response_format: { type: 'json_object' },
    });
    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('The model returned an empty sentence.');
    }

    const parsed = JSON.parse(
      content
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim(),
    ) as {
      targetLang?: unknown;
      baseLang?: unknown;
      notes?: unknown;
      transliteration?: unknown;
      expressive?: unknown;
      linguistic?: unknown;
      usedWord?: unknown;
    };
    const expressiveLabel = readLabel(parsed.expressive, 'subcategory');
    const linguisticLabel = readLabel(parsed.linguistic, 'option');

    if (
      !isText(parsed.targetLang) ||
      !isText(parsed.baseLang) ||
      !isText(parsed.notes) ||
      (needsTransliteration(language) && !isText(parsed.transliteration)) ||
      (isMulti && (!expressiveLabel || !linguisticLabel))
    ) {
      throw new Error(
        'The model response was missing targetLang, baseLang, notes, transliteration, or function labels.',
      );
    }

    return Response.json({
      targetLang: parsed.targetLang.trim(),
      baseLang: parsed.baseLang.trim(),
      notes: parsed.notes.trim(),
      ...(isText(parsed.transliteration)
        ? { transliteration: parsed.transliteration.trim() }
        : {}),
      ...(expressiveLabel ? { expressive: expressiveLabel } : {}),
      ...(linguisticLabel ? { linguistic: linguisticLabel } : {}),
      ...(isText(parsed.usedWord) ? { usedWord: parsed.usedWord.trim() } : {}),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Could not create a sentence.';
    return Response.json({ error: message }, { status: 500 });
  }
}
