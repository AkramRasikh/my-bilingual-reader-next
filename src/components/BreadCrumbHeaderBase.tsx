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
import Link from 'next/link';
import { JSX } from 'react';

interface BreadCrumbHeaderBase {
  onClick: () => void;
  href?: string;
  heading: string;
  subHeading?: string;
  navigationButtons?: () => JSX.Element[];
  progressHeaderComponent?: () => JSX.Element;
  withBasket?: boolean;
}

const BreadCrumbHeaderBase = ({
  onClick,
  href,
  heading,
  subHeading,
  navigationButtons,
  progressHeaderComponent,
  withBasket = true,
}: BreadCrumbHeaderBase) => (
  <div className='flex justify-between w-full'>
    <Breadcrumb className='my-auto mx-1'>
      <BreadcrumbList>
        <BreadcrumbItem>
          {href ? (
            <BreadcrumbLink asChild>
              <Link href={href} data-testid='breadcrumb-heading'>
                {heading}
              </Link>
            </BreadcrumbLink>
          ) : (
            <BreadcrumbLink
              onClick={onClick}
              className='cursor-pointer'
              data-testid='breadcrumb-heading'
            >
              {heading}
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {subHeading && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage
                className='font-medium text-gray-500'
                data-testid='breadcrumb-subheading'
              >
                {subHeading}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
    {progressHeaderComponent && (
      <div className='w-md my-auto'>{progressHeaderComponent()}</div>
    )}
    <div>
      {withBasket && <BasketDialogue />}
      {navigationButtons?.()}
    </div>
  </div>
);

export default BreadCrumbHeaderBase;
