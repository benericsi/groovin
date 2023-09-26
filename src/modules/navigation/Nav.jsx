import '../../assets/css/nav.css';

import React, {useState} from 'react';
import NavHeader from './NavHeader';

const MIN_WIDTH = 72;
const JUMP_AT = 200;
const MAX_WIDTH = 700;

const Nav = () => {
  const [isResizing, setIsResizing] = useState(false);
  const [navbarWidth, setNavbarWidth] = useState(300);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    e.preventDefault();

    if (e.clientX >= MIN_WIDTH && e.clientX <= MAX_WIDTH) {
      if (e.clientX <= JUMP_AT) {
        setNavbarWidth(MIN_WIDTH);
      } else {
        setNavbarWidth(e.clientX);
      }
    }
  };

  const handleMouseUp = (e) => {
    e.preventDefault();
    setIsResizing(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const resetNavbarWidth = (e) => {
    e.preventDefault();
    setNavbarWidth(300);
  };

  return (
    <nav className={`nav-container ${isResizing ? ' resizing' : ''}`} style={{width: `${navbarWidth}px`}}>
      <div className="resize-handle" onMouseDown={handleMouseDown} onDoubleClick={resetNavbarWidth} />
      <NavHeader navbarWidth={navbarWidth} />
    </nav>
  );
};

export default Nav;
