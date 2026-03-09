import React from 'react';
import { Form } from 'react-bootstrap';
import { COMMON_STYLES } from '../../constants';

const FormInput = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  style = {},
  ...props
}) => {
  return (
    <Form.Group className="mb-3">
      {label && (
        <Form.Label>
          {label}
          {required && <span className="text-danger">*</span>}
        </Form.Label>
      )}
      <Form.Control
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        isInvalid={!!error}
        disabled={disabled}
        style={{ ...COMMON_STYLES.INPUT, ...style }}
        {...props}
      />
      {error && <div className="text-danger mt-1">{error}</div>}
    </Form.Group>
  );
};

export default FormInput;