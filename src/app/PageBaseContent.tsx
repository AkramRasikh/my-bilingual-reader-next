import { HomeContainer } from './HomeContainer';
import BreadcrumbComponent from './BreadCrumbHeader';

const PageBaseContent = () => {
  return (
    <div className='p-4 bg-amber-50 h-lvh'>
      <BreadcrumbComponent />
      <HomeContainer />
    </div>
  );
};

export default PageBaseContent;
