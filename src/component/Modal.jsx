import '../assets/css/modal.css';
import React, {useRef, useEffect} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import Button from '../modules/form/Button';
import {MdClose} from 'react-icons/md';

const Modal = ({children, isOpen, close, className}) => {
  const modalRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, close]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.section className="modal_wrapper" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} transition={{duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94]}}>
          <motion.div className={`modal ${className ? className : ''}`} ref={modalRef} initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} transition={{duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94]}}>
            <Button className="secondary close" onClick={close}>
              <MdClose />
            </Button>
            {children}
          </motion.div>
        </motion.section>
      )}
    </AnimatePresence>
  );
};

export default Modal;
