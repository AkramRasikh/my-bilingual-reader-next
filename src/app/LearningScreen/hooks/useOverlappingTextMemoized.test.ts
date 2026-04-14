import { describe, it } from '@jest/globals';

const overlappingSnippetDataMemoised = [
  {
      "id": "8c93ed40-21b5-4ec7-b85a-8f404b71b297",
      "start": 19,
      "end": 24,
      "percentageOverlap": 60,
      "targetLang": "que ça change on n pas des féministes on est des fléministes nous on fait semblant",
      "startPoint": 25.23,
      "sentenceSeconds": [],
      "overlappedSeconds": []
  }
]

const  loopedTranscriptMemoized= [
  {
      "baseLang": "for things to change, we're not feminists, we're feminists, we're just pretending",
      "id": "8c93ed40-21b5-4ec7-b85a-8f404b71b297",
      "meaning": "That it changes, we are not feminists, we are fléminists, we pretend.",
      "sentenceStructure": "que (that) + ça (it) + change (changes) + on (we/one) + n (not) + pas (not) + des (some) + féministes (feminists) + on (we) + est (are) + des (some) + fléministes (feminists (playful term using 'flé')) + nous (we) + on (we) + fait (pretend) + semblant (pretend)",
      "targetLang": "que ça change on n pas des féministes on est des fléministes nous on fait semblant",
      "time": 19,
      "vocab": [
          {
              "meaning": "that",
              "surfaceForm": "que"
          },
          {
              "meaning": "it",
              "surfaceForm": "ça"
          },
          {
              "meaning": "changes",
              "surfaceForm": "change"
          },
          {
              "meaning": "we/one",
              "surfaceForm": "on"
          },
          {
              "meaning": "not",
              "surfaceForm": "n"
          },
          {
              "meaning": "not",
              "surfaceForm": "pas"
          },
          {
              "meaning": "some",
              "surfaceForm": "des"
          },
          {
              "meaning": "feminists",
              "surfaceForm": "féministes"
          },
          {
              "meaning": "we",
              "surfaceForm": "on"
          },
          {
              "meaning": "are",
              "surfaceForm": "est"
          },
          {
              "meaning": "some",
              "surfaceForm": "des"
          },
          {
              "meaning": "feminists (playful term using 'flé')",
              "surfaceForm": "fléministes"
          },
          {
              "meaning": "we",
              "surfaceForm": "nous"
          },
          {
              "meaning": "we",
              "surfaceForm": "on"
          },
          {
              "meaning": "pretend",
              "surfaceForm": "fait"
          },
          {
              "meaning": "pretend",
              "surfaceForm": "semblant"
          }
      ],
      "isDue": false,
      "targetLangformatted": [
          {
              "text": "que ça change on n pas des féministes on est des fléministes nous ",
              "savedWords": []
          },
          {
              "text": "on fait semblant",
              "savedWords": [
                  "b22989b6-99f7-4f20-b9d0-f7c4c93c8498"
              ]
          }
      ],
      "wordsFromSentence": [
          {
              "baseForm": "faire semblant",
              "contexts": [
                  "62331d06-a28f-4c82-b917-87d9f807e7b2"
              ],
              "definition": "to pretend",
              "id": "b22989b6-99f7-4f20-b9d0-f7c4c93c8498",
              "notes": "The expression \"faire semblant\" means \"to pretend.\" It is often used to indicate that someone is not being genuine or is performing a façade. The phrase can convey a sense of irony, especially in contexts where actions do not align with stated beliefs.",
              "phonetic": "fɛʁ sɑ̃.blɑ̃",
              "reviewData": {
                  "difficulty": 4.81749551,
                  "due": "2026-04-25T04:00:00.000Z",
                  "ease": 2.5,
                  "elapsed_days": 5,
                  "interval": 0,
                  "lapses": 0,
                  "last_review": "2026-04-14T06:31:15.213Z",
                  "reps": 5,
                  "scheduled_days": 11,
                  "stability": 59.96501422,
                  "state": 2
              },
              "surfaceForm": "on fait semblant",
              "transliteration": "faire semblant",
              "originalContext": "waly-dia-les-sujets-de-division",
              "isDue": false,
              "time": 15
          }
      ],
      "helperReviewSentence": false,
      "index": 2,
      "prevSentence": 15,
      "thisSentence": 19,
      "isUpForReview": false,
      "nextSentence": 24
  },
  {
      "baseLang": "to be like Ding, but it's not possible, but do you realize, in 2024 we're at this point",
      "id": "bafaffd7-1b93-420d-81bd-3eb49fd77ad5",
      "meaning": "It's like being some crazy people, but it's not possible. But do you realize that in 2024, we are at this point?",
      "reviewData": {
          "difficulty": 7.19367338,
          "due": "2026-04-23T04:00:00.000Z",
          "ease": 2.5,
          "elapsed_days": 5,
          "interval": 0,
          "lapses": 0,
          "last_review": "2026-04-14T07:17:11.863Z",
          "reps": 7,
          "scheduled_days": 9,
          "stability": 34.40572172,
          "state": 2
      },
      "sentenceStructure": "d'être (to be) + comme (like) + des (some) + Ding (a slang term for a crazy person or thing) + mais (but) + c'est (it is) + pas (not) + possible (possible) + mais (but) + tu (you) + te (yourself) + rends (realize) + compte (account) + en (in) + 2024 (2024) + on (we) + en (in) + est (are) + là (there)",
      "targetLang": "d'être comme des Ding mais c'est pas possible mais tu te rends compte en 2024 on en est là",
      "time": 24,
      "vocab": [
          {
              "meaning": "to be",
              "surfaceForm": "d'être"
          },
          {
              "meaning": "like",
              "surfaceForm": "comme"
          },
          {
              "meaning": "some",
              "surfaceForm": "des"
          },
          {
              "meaning": "a slang term for a crazy person or thing",
              "surfaceForm": "Ding"
          },
          {
              "meaning": "but",
              "surfaceForm": "mais"
          },
          {
              "meaning": "it is",
              "surfaceForm": "c'est"
          },
          {
              "meaning": "not",
              "surfaceForm": "pas"
          },
          {
              "meaning": "possible",
              "surfaceForm": "possible"
          },
          {
              "meaning": "but",
              "surfaceForm": "mais"
          },
          {
              "meaning": "you",
              "surfaceForm": "tu"
          },
          {
              "meaning": "yourself",
              "surfaceForm": "te"
          },
          {
              "meaning": "realize",
              "surfaceForm": "rends"
          },
          {
              "meaning": "account",
              "surfaceForm": "compte"
          },
          {
              "meaning": "in",
              "surfaceForm": "en"
          },
          {
              "meaning": "2024",
              "surfaceForm": "2024"
          },
          {
              "meaning": "we",
              "surfaceForm": "on"
          },
          {
              "meaning": "in",
              "surfaceForm": "en"
          },
          {
              "meaning": "are",
              "surfaceForm": "est"
          },
          {
              "meaning": "there",
              "surfaceForm": "là"
          }
      ],
      "isDue": false,
      "targetLangformatted": [
          {
              "text": "d'être comme des Ding mais c'est pas possible mais ",
              "savedWords": []
          },
          {
              "text": "tu te rends compte",
              "savedWords": [
                  "e8ef62d5-73f2-41d5-a114-7d93fce01c84"
              ]
          },
          {
              "text": " en 2024 on en est là",
              "savedWords": []
          }
      ],
      "wordsFromSentence": [
          {
              "baseForm": "se rendre compte",
              "contexts": [
                  "bafaffd7-1b93-420d-81bd-3eb49fd77ad5"
              ],
              "definition": "you realize",
              "id": "e8ef62d5-73f2-41d5-a114-7d93fce01c84",
              "notes": "The expression \"se rendre compte\" means \"to realize\" or \"to become aware of\". It's a reflexive verb, indicating that the subject is performing the action on itself. In context, it is used to express disbelief or surprise at a situation.",
              "phonetic": "sə ʁɑ̃dʁ kɔ̃t",
              "reviewData": {
                  "difficulty": 6.19709918,
                  "due": "2026-04-22T04:00:00.000Z",
                  "ease": 2.5,
                  "elapsed_days": 5,
                  "interval": 0,
                  "lapses": 0,
                  "last_review": "2026-04-14T07:16:27.445Z",
                  "reps": 6,
                  "scheduled_days": 8,
                  "stability": 44.86999958,
                  "state": 2
              },
              "surfaceForm": "tu te rends compte",
              "transliteration": "se rendre compte",
              "originalContext": "waly-dia-les-sujets-de-division",
              "isDue": false,
              "time": 24
          }
      ],
      "helperReviewSentence": false,
      "index": 3,
      "prevSentence": 19,
      "thisSentence": 24,
      "isUpForReview": true,
      "nextSentence": 31
  }
]

const isTrimmed = false;

describe('getOverlappingText', () => {
  it.todo(
    'add tests for overlap filtering, concatenation behavior, and suggested focus text',
  );
});
