import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { COMMON_STYLES } from '../../constants';

const PasswordInput = ({
  label = 'Password',
  placeholder = '*********',
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  style = {},
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Form.Group className="mb-3">
      {label && (
        <Form.Label>
          {label}
          {required && <span className="text-danger">*</span>}
        </Form.Label>
      )}
      <div style={{ position: 'relative' }}>
        <Form.Control
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          isInvalid={!!error}
          disabled={disabled}
          style={{ ...COMMON_STYLES.INPUT, paddingRight: '45px', ...style }}
          {...props}
        />
        <Button
          className="text-secondary border-0"
          style={{
            background: 'transparent',
            boxShadow: 'none',
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            padding: '0',
            width: 'auto',
            height: 'auto'
          }}
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </Button>
      </div>
      {error && <div className="text-danger mt-1">{error}</div>}
    </Form.Group>
  );
};

export default PasswordInput;