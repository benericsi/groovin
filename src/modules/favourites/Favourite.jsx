const Favourite = ({track, index}) => {
  return (
    <div className="favourite">
      <img src={track.image} alt={track.name} />
      <h3>{track.name}</h3>
      <p>{track.artist}</p>
    </div>
  );
};

export default Favourite;
