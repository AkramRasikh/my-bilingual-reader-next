const YoutubeIframe = ({ youtubeId }) => (
  <iframe
    width='560'
    height='315'
    src={`https://www.youtube.com/embed/${youtubeId}`}
    frameborder='0'
    allowfullscreen
  />
);

export default YoutubeIframe;
