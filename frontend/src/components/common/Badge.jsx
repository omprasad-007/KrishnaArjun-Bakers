import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const variantStyles = {
    default: 'bg-[#f0eded] text-[#54433a] border border-[#dac2b6]/50',
    primary: 'bg-[#ffdbc9] text-[#6c2f00] font-semibold',
    secondary: 'bg-[#fea619]/20 text-[#855300] font-semibold',
    success: 'bg-[#dcfce7] text-[#166534] border border-[#86efac]',
    warning: 'bg-[#fef3c7] text-[#92400e] border border-[#fde68a]',
    danger: 'bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5]',
    soldout: 'bg-[#e4e2e1] text-[#54433a] border border-[#dac2b6] line-through font-bold',
    brand: 'bg-[#6c2f00] text-white font-medium shadow-warm-sm',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 rounded-full',
    md: 'text-xs px-2.5 py-1 rounded-full',
    lg: 'text-sm px-3 py-1.5 rounded-full',
  };

  return (
    <span className={`inline-flex items-center gap-1 font-medium ${variantStyles[variant] || variantStyles.default} ${sizeStyles[size] || sizeStyles.md} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
