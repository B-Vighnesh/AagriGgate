import React from 'react';

const VARIANT_MAP = {
  primary: 'ui-btn--primary',
  accent: 'ui-btn--accent',
  outline: 'ui-btn--outline',
  danger: 'ui-btn--danger',
  ghost: 'ui-btn--ghost',
};

const SIZE_MAP = {
  sm: 'ui-btn--sm',
  md: '',
  lg: 'ui-btn--lg',
};

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  const variantClass = VARIANT_MAP[variant] || VARIANT_MAP.primary;
  const sizeClass = SIZE_MAP[size] || '';
  const finalDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={`ui-btn ${variantClass} ${sizeClass} ${className}`.trim()}
      disabled={finalDisabled}
      {...props}
    >
      {loading && <span className="ui-spinner" aria-hidden="true" />}
      {children}
    </button>
  );
}
