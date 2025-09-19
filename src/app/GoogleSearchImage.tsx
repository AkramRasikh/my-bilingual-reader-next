const GoogleSearchImage = ({ query = '散見' }) => {
  const openGoogleImages = () => {
    const url = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(
      query,
    )}`;
    window.open(url, 'GoogleImages', 'width=800,height=600');
  };

  return (
    <div>
      <input
        type='text'
        value={query}
        // onChange={(e) => setQuery(e.target.value)}
        placeholder='Search images...'
      />
      <button onClick={openGoogleImages}>Search Images</button>
    </div>
  );
};

export default GoogleSearchImage;
