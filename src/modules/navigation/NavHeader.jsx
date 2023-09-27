import logo from '../../assets/icons/record-vinyl-solid.svg';
import home from '../../assets/icons/house-solid.svg';
import search from '../../assets/icons/magnifying-glass-solid.svg';

const NavHeader = ({navbarWidth}) => {
  const isWidthLessThan = navbarWidth < 150;

  return (
    <header className="nav-header">
      <ul className="nav-list">
        <li className="nav-list-item">
          <a href="" className="a-brand nav-link">
            <img src={logo} alt="Groovin." className="nav-svg" />
            {!isWidthLessThan && <span className="nav-text">Groovin.</span>}
          </a>
        </li>
        <li className="nav-list-item">
          <a href="" className="nav-link">
            <img src={home} alt="Home" className="nav-svg" />
            {!isWidthLessThan && <span className="nav-text">Home</span>}
          </a>
        </li>
        <li className="nav-list-item">
          <a href="" className="nav-link">
            <img src={search} alt="Search" className="nav-svg" />
            {!isWidthLessThan && <span className="nav-text">Search</span>}
          </a>
        </li>
      </ul>
    </header>
  );
};

export default NavHeader;
