import {
  ContentTranscriptTypes,
  ContentTypes,
  Snippet,
} from '../types/content-types';

export interface ContentStateTypes extends ContentTypes {
  contentIndex: number;
}

export type ContentAction =
  | {
      content: ContentStateTypes[];
      type: 'initContent';
    }
  | {
      type: 'updateSentence';
      contentIndex: ContentStateTypes['contentIndex'];
      sentenceId: ContentTranscriptTypes['id'];
      fields: Partial<ContentTranscriptTypes>;
    }
  | {
      fields: { reviewData: ContentTranscriptTypes['reviewData'] };
      sentenceIds: ContentTranscriptTypes['id'][];
      contentIndex: ContentStateTypes['contentIndex'];
      type: 'updateSentences';
    }
  | {
      sentenceId: ContentTranscriptTypes['id'];
      contentIndex: ContentStateTypes['contentIndex'];
      type: 'removeReview';
    }
  | {
      fields: Partial<
        Pick<ContentStateTypes, 'nextReview' | 'reviewHistory' | 'snippets'>
      >;
      contentIndex: ContentStateTypes['contentIndex'];
      type: 'updateMetaData';
    }
  | {
      id: ContentStateTypes['id'];
      type: 'deleteContent';
    }
  | {
      newContentData: ContentTypes;
      type: 'addContent';
    }
  | {
      type: 'saveSnippet';
      contentIndex: ContentStateTypes['contentIndex'];
      snippetData: Snippet;
      isUpdate?: boolean;
    }
  | {
      type: 'deleteSnippet';
      contentIndex: ContentStateTypes['contentIndex'];
      snippetId: Snippet['id'];
    };

export function contentReducer(
  state: ContentStateTypes[],
  action: ContentAction,
): ContentStateTypes[] {
  switch (action.type) {
    case 'initContent':
      return action.content || [];

    case 'updateSentence':
      return state.map((topic, idx) =>
        idx === action.contentIndex
          ? {
              ...topic,
              content: topic.content.map((s) =>
                s.id === action.sentenceId ? { ...s, ...action.fields } : s,
              ),
            }
          : topic,
      );
    case 'updateSentences':
      return state.map((topic, idx) =>
        idx === action.contentIndex
          ? {
              ...topic,
              content: topic.content.map((s) =>
                action.sentenceIds.includes(s.id)
                  ? { ...s, ...action.fields }
                  : s,
              ),
            }
          : topic,
      );

    case 'removeReview':
      return state.map((topic, idx) =>
        idx === action.contentIndex
          ? {
              ...topic,
              content: topic.content.map((s) =>
                s.id === action.sentenceId
                  ? // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    (({ reviewData, ...rest }) => rest)(s)
                  : s,
              ),
            }
          : topic,
      );

    case 'updateMetaData':
      return state.map((topic, idx) =>
        idx === action.contentIndex
          ? {
              ...topic,
              ...action.fields,
            }
          : topic,
      );

    case 'deleteContent': {
      // 1. Remove the topic with the matching id
      const filtered = state.filter((topic) => topic.id !== action.id);

      // 2. Reindex all remaining topics
      return filtered.map((topic, newIndex) => ({
        ...topic,
        contentIndex: newIndex,
      }));
    }

    case 'addContent': {
      // 1. Remove the topic with the matching id
      const newContentData = action.newContentData;
      const newContentIndex = state.length;
      return [
        ...state,
        {
          ...newContentData,
          contentIndex: newContentIndex,
        },
      ];
    }

    case 'saveSnippet':
      return state.map((topic, idx) => {
        if (idx !== action.contentIndex) return topic;

        // Overwrite existing snippet
        if (action.isUpdate) {
          return {
            ...topic,
            snippets: topic.snippets?.map((snippet) =>
              snippet.id === action.snippetData.id
                ? action.snippetData
                : snippet,
            ),
          };
        }

        // Add new snippet
        return {
          ...topic,
          snippets: topic.snippets
            ? [...topic.snippets, action.snippetData]
            : [action.snippetData],
        };
      });
    case 'deleteSnippet':
      return state.map((topic, idx) => {
        if (idx !== action.contentIndex) return topic;

        return {
          ...topic,
          snippets: topic.snippets?.filter(
            (snippet) => snippet.id !== action.snippetId,
          ),
        };
      });

    default:
      return state;
  }
}
