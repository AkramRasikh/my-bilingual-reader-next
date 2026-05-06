import { useEffect } from 'react';
import { toast, Toaster } from 'sonner';

const PageContainer = ({
  toastMessageState,
  setToastMessageState,
  children,
}) => {
  useEffect(() => {
    if (toastMessageState) {
      toast(toastMessageState);
      setToastMessageState('');
    }
  }, [toastMessageState]);

  return (
    <div className='p-4 bg-amber-50 min-h-lvh'>
      <Toaster
        position='top-center'
        duration={1000}
        toastOptions={{
          className: 'text-center break-words',
          style: {
            width: 'fit-content',
            minWidth: '0',
            maxWidth: 'calc(100vw - 2rem)',
            marginInline: 'auto',
          },
          classNames: {
            toast: '!w-fit !min-w-0 !max-w-[calc(100vw-2rem)] mx-auto',
          },
        }}
      />
      {children}
    </div>
  );
};

export default PageContainer;
