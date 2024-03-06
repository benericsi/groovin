import '../assets/css/popup.css';

const PopUp = ({children, isPopUpActive, onClose}) => {
  if (!isPopUpActive) return null;

  return (
    <div className="popup-container">
      <div className="popup">
        <div className="popup-close" onClick={onClose}>
          &times;
        </div>
        {children}
      </div>
    </div>
  );
};

export default PopUp;
