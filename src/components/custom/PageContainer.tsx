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
      setTimeout(() => setToastMessageState(''), 500);
    }
  }, [toastMessageState]);

  return (
    <div className='p-4 bg-amber-50 h-lvh'>
      <Toaster position='top-center' />
      {children}
    </div>
  );
};

export default PageContainer;
