import '../../assets/css/search.css';
import Input from '../../ui/Input';

const Search = () => {
  return (
    <div className="search-body">
      <section className="search-section">
        <div className="search-section-header">
          <h1>What are you looking for?</h1>
          <Input
            type="text"
            value=""
            label="Search for songs, artists, or more .."
            onChange={(value) => {
              console.log(value);
            }}
            className="input-field light"
          />
        </div>
      </section>
    </div>
  );
};

export default Search;
