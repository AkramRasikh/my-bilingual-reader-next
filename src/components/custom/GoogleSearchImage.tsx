import { Button } from '@/components/ui/button';
import { LucideSearch } from 'lucide-react';

const GoogleSearchImage = ({ query }) => {
  const openGoogleImages = () => {
    const url = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(
      query,
    )}`;
    window.open(url, 'GoogleImages', 'width=800,height=600');
  };

  return (
    <Button
      onClick={openGoogleImages}
      variant='ghost'
      className='border border-amber-500 h-7 w-7'
    >
      <LucideSearch />
    </Button>
  );
};

export default GoogleSearchImage;
