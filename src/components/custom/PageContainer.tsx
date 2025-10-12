type PageContainerProps = React.HTMLAttributes<HTMLDivElement>;

const PageContainer: React.FC<PageContainerProps> = ({ children }) => (
  <div className='p-4 bg-amber-50 h-lvh'>{children}</div>
);

export default PageContainer;
