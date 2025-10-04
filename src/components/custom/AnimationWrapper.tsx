export const fadeAnimationStyle = 'fadeIn 0.5s ease-out forwards';

export const AnimationFade = () => (
  <style jsx>{`
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  `}</style>
);

type AnimationWrapperProps = {
  children: React.ReactNode;
  className?: string;
};

const AnimationWrapper: React.FC<AnimationWrapperProps> = ({
  children,
  className,
}) => (
  <div className={className} style={{ animation: fadeAnimationStyle }}>
    {children}
    <style jsx>{`
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
    `}</style>
  </div>
);

export default AnimationWrapper;
