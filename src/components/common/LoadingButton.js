import React from 'react';
import { Button } from 'react-bootstrap';
import { ButtonLoading } from '../../helpers/loading/Loaders';
import { COMMON_STYLES } from '../../constants';

const LoadingButton = ({
  loading = false,
  children,
  variant = 'primary',
  className = '',
  style = {},
  ...props
}) => {
  return (
    <Button
      className={`${className}`}
      style={{ ...COMMON_STYLES.BUTTON, ...style }}
      disabled={loading}
      {...props}
    >
      {loading ? <ButtonLoading color="white" /> : children}
    </Button>
  );
};

export default LoadingButton;