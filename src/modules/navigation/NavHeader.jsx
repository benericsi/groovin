import logo from '../../assets/icons/record-vinyl-solid.svg';
import home from '../../assets/icons/house-solid.svg';
import search from '../../assets/icons/magnifying-glass-solid.svg';

const NavHeader = ({navbarWidth}) => {
  const isWidthLessThan = navbarWidth < 150;

  return (
    <header className="nav-header">
      <ul>
        <li>
          <a href="">
            <img src={logo} alt="Groovin." />
            {!isWidthLessThan && <span>Groovin.</span>}
          </a>
        </li>
        <li>
          <a href="">
            <img src={home} alt="Home" />
            {!isWidthLessThan && <span>Home</span>}
          </a>
        </li>
        <li>
          <a href="">
            <img src={search} alt="Search" />
            {!isWidthLessThan && <span>Search</span>}
          </a>
        </li>
      </ul>
    </header>
  );
};

export default NavHeader;
