'use client';
import BasketDialogue from '@/app/BasketDialogue';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const BreadCrumbHeaderBase = ({
  onClick,
  heading,
  subHeading,
  navigationButtons,
}) => (
  <div className='flex justify-between w-full'>
    <Breadcrumb className='my-auto mx-1'>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink onClick={onClick} className='cursor-pointer'>
            {heading}
          </BreadcrumbLink>
        </BreadcrumbItem>
        {subHeading && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{subHeading}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
    <div>
      <BasketDialogue />
      {navigationButtons()}
    </div>
  </div>
);

export default BreadCrumbHeaderBase;
