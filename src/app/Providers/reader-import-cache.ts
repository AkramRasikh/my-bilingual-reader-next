import type {ContentStateTypes} from '../reducers/content-reducer';

export function mergeReaderImport(existing: ContentStateTypes[], incoming: ContentStateTypes): ContentStateTypes[] {
  // Imports only create content. A replay must preserve any later local reviews.
  if (existing.some(item => item.id === incoming.id)) return existing;
  return [...existing, {...incoming, contentIndex: existing.length}];
}
export function normalizeReaderImport(value: unknown): ContentStateTypes {
  const item = value as Record<string, unknown>;
  if (!item || typeof item.id !== 'string' || typeof item.title !== 'string' || !Array.isArray(item.content)) {
    throw new Error('Invalid imported content');
  }
  return {...item, snippets: Array.isArray(item.snippets) ? item.snippets : Object.values(item.snippets || {}),
    contentIndex: 0} as unknown as ContentStateTypes;
}
