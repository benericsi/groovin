import logo from '../../assets/icons/record-vinyl-solid.svg';
import home from '../../assets/icons/house-solid.svg';
import search from '../../assets/icons/magnifying-glass-solid.svg';

import {NavLink} from 'react-router-dom';

const NavHeader = ({navbarWidth}) => {
  const isWidthLessThan = navbarWidth < 150;

  return (
    <header className="nav-header">
      <ul className="nav-list">
        <li className="nav-list-item">
          <NavLink to="/home" className="a-brand nav-link" activeClassName="active">
            <img src={logo} alt="Groovin." className="nav-svg" />
            {!isWidthLessThan && <span className="nav-text">Groovin.</span>}
          </NavLink>
        </li>
        <li className="nav-list-item">
          <NavLink to="/home" className="nav-link" activeClassName="active">
            <img src={home} alt="Home" className="nav-svg" />
            {!isWidthLessThan && <span className="nav-text">Home</span>}
          </NavLink>
        </li>
        <li className="nav-list-item">
          <NavLink to="/search" className="nav-link" activeClassName="active">
            <img src={search} alt="Search" className="nav-svg" />
            {!isWidthLessThan && <span className="nav-text">Search</span>}
          </NavLink>
        </li>
      </ul>
    </header>
  );
};

export default NavHeader;
