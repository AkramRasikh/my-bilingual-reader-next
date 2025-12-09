import { ContentTranscriptTypes, ContentTypes } from '../types/content-types';

export interface ContentStateTypes extends ContentTypes {
  contentIndex: number;
  generalTopicName: string;
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
      fields: { reviewData: ContentTranscriptTypes['reviewData'] };
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
      fields:
        | ContentStateTypes['nextReview']
        | ContentStateTypes['reviewHistory']
        | ContentStateTypes['snippets'];
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
    };

export function contentReducer(
  state: ContentStateTypes[],
  action: ContentAction,
): ContentStateTypes[] {
  switch (action.type) {
    case 'initContent':
      return action.content;

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
          generalTopicName: newContentData.title,
          contentIndex: newContentIndex,
        },
      ];
    }

    default:
      return state;
  }
}
