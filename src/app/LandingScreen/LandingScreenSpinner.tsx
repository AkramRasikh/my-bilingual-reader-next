import { LucideLoader2 } from 'lucide-react';

const LandingScreenSpinner = () => (
  <div className='absolute top-1/3 left-1/2 animate-spin text-red-400 '>
    <LucideLoader2 size={100} />
  </div>
);

export default LandingScreenSpinner;
