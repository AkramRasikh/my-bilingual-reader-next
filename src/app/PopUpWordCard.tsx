import React from 'react';

export default function PopUpWordCard({ word }: { word: any }) {
  return (
    <div className='border rounded-lg p-4 shadow-sm max-w-sm space-y-2'>
      <div>
        <strong>Base Form:</strong> {word.baseForm}
      </div>
      <div>
        <strong>Surface Form:</strong> {word.surfaceForm}
      </div>
      <div>
        <strong>Definition:</strong> {word.definition}
      </div>
      {word.phonetic && (
        <div>
          <strong>Transliteration:</strong> {word.phonetic}
        </div>
      )}
    </div>
  );
}
