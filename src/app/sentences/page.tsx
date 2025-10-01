'use client';

import { useFetchData } from '../FetchDataProvider';

export default function SentencesPage() {
  const { data } = useFetchData();

  if (!data) return <p>Loading...</p>;

  return <div>Sentence Page</div>;
}
