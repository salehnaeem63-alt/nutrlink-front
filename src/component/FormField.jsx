import './FormField.css';

/**
 * FormField
 *
 * Props:
 *   label       – string
 *   icon        – SVG JSX element (optional)
 *   id          – string (links label → input)
 *   ...rest     – forwarded to <input>  (type, name, value, onChange, placeholder, required, …)
 */
const FormField = ({ label, icon, id, rightIcon, onRightIconClick, ...inputProps }) => (
  <div className="form-field">
    {label && (
      <label className="form-field__label" htmlFor={id}>
        {label}
      </label>
    )}
    <div className="form-field__input-wrap">
      {icon && <span className="form-field__icon">{icon}</span>}
      <input
        id={id}
        className="form-field__input"
        {...inputProps}
      />
      {rightIcon && (
        <button
          type="button"
          className='form-field__icon-right'
          onClick={onRightIconClick}>
          {rightIcon}
        </button>
      )}
    </div>
  </div>
);

export default FormField;
