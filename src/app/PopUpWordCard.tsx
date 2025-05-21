import React from 'react';

export default function PopUpWordCard({ word, onClose }: { word: any }) {
  return (
    <div className='border rounded-lg p-4 shadow-sm max-w-sm space-y-2 flex gap-1.5'>
      <p>
        {word.baseForm}, {word.surfaceForm}, {word.definition}, {word.phonetic},{' '}
        {word?.transliteration}
      </p>
      <button onClick={onClose}>❌</button>
    </div>
  );
}
