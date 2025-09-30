export const fadeAnimationStyle = 'fadeIn 0.5s ease-out forwards';

const AnimationFade = () => (
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

export default AnimationFade;
