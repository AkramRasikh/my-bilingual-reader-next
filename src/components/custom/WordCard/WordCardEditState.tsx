import { useState } from 'react';
import { Check, X, Loader2 } from 'lucide-react';

interface WordCardEditStateProps {
  label: string;
  value: string;
  onSave: (newValue: string) => Promise<void>;
}

const WordCardEditState = ({
  label,
  value,
  onSave,
}: WordCardEditStateProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(draftValue);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setDraftValue(value);
    setIsEditing(false);
  };

  return (
    <div className='relative w-full'>
      {/* LOADING OVERLAY */}
      {isSaving && (
        <div className='absolute inset-0 flex items-center justify-center bg-black/30 rounded-md z-10'>
          <Loader2 className='animate-spin text-white' size={20} />
        </div>
      )}

      <div
        className={`flex items-start gap-2 p-1 rounded-md w-full ${
          isSaving ? 'opacity-50 pointer-events-none' : ''
        }`}
      >
        {/* LABEL — CLICK TO EDIT */}
        <button
          onClick={() => setIsEditing(true)}
          className='text-sm font-semibold whitespace-nowrap text-left cursor-pointer hover:opacity-70 transition my-auto'
        >
          {label}:
        </button>

        {/* VIEW MODE */}
        {!isEditing && (
          <span className='text-sm font-medium flex-1 text-left'>{value}</span>
        )}

        {/* EDIT MODE */}
        {isEditing && (
          <div className='flex-1 flex items-center gap-2'>
            <textarea
              className='border rounded px-2 py-1 text-sm w-full'
              value={draftValue}
              onChange={(e) => setDraftValue(e.target.value)}
              autoFocus
            />
            <button
              onClick={handleSave}
              className='p-1 text-green-600 hover:text-green-800'
            >
              <Check size={18} />
            </button>
            <button
              onClick={handleCancel}
              className='p-1 text-red-600 hover:text-red-800'
            >
              <X size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WordCardEditState;
