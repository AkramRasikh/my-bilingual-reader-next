import Image from 'next/image';
import GoogleSearchImage from '../GoogleSearchImage';
import PasteImageCard from '../PasteImageCard';

const WordCardImage = ({ id, openContentState, src, baseForm, addImage }) => {
  return openContentState && src ? (
    <Image
      height={150}
      width={250}
      src={src}
      alt={baseForm}
      className='m-auto pb-1 rounded'
    />
  ) : openContentState ? (
    <div className='flex gap-1.5'>
      <PasteImageCard id={id} addImage={addImage} />
      <div className='flex flex-row-reverse m-auto'>
        <GoogleSearchImage query={baseForm} />
      </div>
    </div>
  ) : null;
};

export default WordCardImage;
