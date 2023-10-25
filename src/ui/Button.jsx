import '../assets/css/button.css';

const Button = ({children, className, text, ...attributes}) => {
  const classN = className ? `btn-primary ${className}` : 'btn-primary';

  return (
    <button type="button" className={classN} {...attributes}>
      {children}
      {text && <span>{text}</span>}
    </button>
  );
};

export default Button;
