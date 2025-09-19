import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function ImageSearch() {
  const [query, setQuery] = useState('');
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const searchImages = async () => {
    if (!query) return;
    setLoading(true);

    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          query,
        )}&client_id=${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}`,
      );
      const data = await res.json();
      setImages(data.results || []);
    } catch (err) {
      console.error('Error fetching images:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='w-full max-w-2xl mx-auto space-y-4'>
      {/* Search bar */}
      <div className='flex gap-2'>
        <Input
          placeholder='Search Unsplash...'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button onClick={searchImages} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </div>

      {/* Image results */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
        {images.map((img) => (
          <Card key={img.id} className='overflow-hidden'>
            <CardContent className='p-0'>
              <img
                src={img.urls.regular}
                alt={img.alt_description || 'Unsplash image'}
                className='w-full h-48 object-cover'
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
