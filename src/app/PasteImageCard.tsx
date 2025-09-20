import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function PasteImageCard({ id, addImage }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData.items;

    for (let item of items) {
      if (item.type.startsWith('image/')) {
        const blob = item.getAsFile();
        if (blob) {
          setImageBlob(blob); // store the actual blob
          setImageSrc(URL.createObjectURL(blob)); // preview
        }
      }
    }
  };

  const saveImage = async () => {
    if (!imageBlob) return;

    // Optional: wrap blob in File to add a filename
    const file = new File([imageBlob], `${id}.png`, {
      type: imageBlob.type,
    });

    const formData = new FormData();
    formData.append('image', file);
    addImage(formData);
  };

  const removeImage = () => {
    setImageSrc(null);
  };

  return (
    <Card
      className='border-dashed border-2 border-gray-300 cursor-pointer p-2'
      onPaste={handlePaste}
    >
      <CardContent className='text-center'>
        {!imageSrc ? (
          <p className='text-gray-500'>
            Focus here and press{' '}
            <kbd className='px-1 py-0.5 border rounded bg-gray-100'>
              Ctrl + V
            </kbd>{' '}
            to paste an image
          </p>
        ) : (
          <div className='flex flex-col items-center gap-4'>
            <img
              src={imageSrc}
              alt='Pasted'
              className='max-h-64 border rounded-md'
            />
            <div className='flex gap-1.5'>
              <Button onClick={saveImage}>Save Image</Button>
              <Button variant='destructive' onClick={removeImage}>
                Remove Image
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
