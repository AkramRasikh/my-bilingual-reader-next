type PageContainerProps = React.HTMLAttributes<HTMLDivElement>;

const PageContainer: React.FC<PageContainerProps> = ({ children }) => (
  <div className='p-4'>{children}</div>
);

export default PageContainer;
