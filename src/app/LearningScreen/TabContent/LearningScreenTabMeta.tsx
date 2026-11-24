'use client';

import { TabsContent } from '@/components/ui/tabs';
import LearningScreenMetaPanel from './LearningScreenMetaPanel';

const LearningScreenTabMeta = () => (
  <TabsContent
    value='meta'
    className='max-h-130 min-w-0 overflow-x-hidden overflow-y-auto p-1 min-[1367px]:max-h-150'
  >
    <LearningScreenMetaPanel />
  </TabsContent>
);

export default LearningScreenTabMeta;
