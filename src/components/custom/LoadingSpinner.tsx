import { LucideLoader2 } from 'lucide-react';

const LoadingSpinner = ({ big = false }) => {
  if (big) {
    return (
      <div className='absolute top-1/3 left-1/2 animate-spin text-red-400 '>
        <LucideLoader2 size={100} />
      </div>
    );
  }
  return (
    <div className='h-5 w-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin' />
  );
};

export default LoadingSpinner;
