import Image from 'next/image';

const WordCardImage = ({ src, baseForm }) => (
  <Image
    height={150}
    width={250}
    src={src}
    alt={baseForm}
    className='m-auto pb-1 rounded'
  />
);

export default WordCardImage;
