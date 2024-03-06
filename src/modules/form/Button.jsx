import '../../assets/css/button.css';

const Button = ({children, className, disabled, text, ...attributes}) => {
  const classN = className ? `btn ${className}` : 'btn';

  return (
    <button type="button" className={classN} {...attributes}>
      {children}
      {text && <span>{text}</span>}
    </button>
  );
};

export default Button;
