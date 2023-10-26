import '../../assets/css/sidebar.css';

import React, {useState} from 'react';

const MIN_WIDTH = 5;
const JUMP_AT = 15;
const MAX_WIDTH = 25;

const SideBar = () => {
  const [isResizing, setIsResizing] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(JUMP_AT + 1);
  const [isSideOpen, setIsSideOpen] = useState(false);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    e.preventDefault();
    if (e.clientX / 16 > MIN_WIDTH && e.clientX / 16 <= MAX_WIDTH) {
      if (e.clientX / 16 < JUMP_AT) {
        setSidebarWidth(MIN_WIDTH);
        setIsSideOpen(false);
      } else {
        setSidebarWidth(e.clientX / 16);
        setIsSideOpen(true);
      }
    }
  };

  const handleMouseUp = (e) => {
    e.preventDefault();
    setIsResizing(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <aside className={`side-bar ${isSideOpen ? 'opened' : ''} ${isResizing ? 'resizing' : ''}`} style={{width: `${sidebarWidth}rem`}}>
      <div className="resize-handle" onMouseDown={handleMouseDown}></div>
    </aside>
  );
};

export default SideBar;
