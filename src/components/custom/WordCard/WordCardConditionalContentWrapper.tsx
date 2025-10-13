import Image from 'next/image';
import ConditionalWrapper from '../ConditionalWrapper';

const WordCardConditionalContentWrapper = ({
  setOpenContentState,
  openContentState,
  previewImage,
  src,
  baseForm,
  children,
}) => {
  return (
    <ConditionalWrapper
      condition={!openContentState && previewImage}
      wrapper={(children) => {
        return (
          <button onDoubleClick={() => setOpenContentState(true)}>
            {previewImage && (
              <div className='relative w-50 h-33 m-auto'>
                <Image
                  src={src}
                  alt={baseForm}
                  fill
                  className='object-contain'
                />
              </div>
            )}
            {children}
          </button>
        );
      }}
    >
      {children}
    </ConditionalWrapper>
  );
};

export default WordCardConditionalContentWrapper;
