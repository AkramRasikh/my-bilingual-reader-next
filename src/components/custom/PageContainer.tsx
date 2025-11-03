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
    <div className='p-4 bg-amber-50 h-lvh'>
      <Toaster position='top-center' duration={1000} />
      {children}
    </div>
  );
};

export default PageContainer;
