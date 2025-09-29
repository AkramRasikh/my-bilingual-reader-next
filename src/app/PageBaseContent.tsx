import BreadcrumbComponent from './BreadCrumbHeader';
import LandingScreen from './LandingScreen';

const PageBaseContent = () => (
  <div className='p-4 bg-amber-50 h-lvh'>
    <BreadcrumbComponent />
    <LandingScreen />
  </div>
);

export default PageBaseContent;
