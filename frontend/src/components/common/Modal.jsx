import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, subtitle, children, maxWidth = 'max-w-lg' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className={`relative bg-white rounded-2xl shadow-warm-lg w-full ${maxWidth} overflow-hidden border border-[#dac2b6]/60 z-10 my-8 transform transition-all`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0eded] bg-[#fcf9f8]">
          <div>
            <h3 className="font-headline font-bold text-lg text-[#1b1c1c]">{title}</h3>
            {subtitle && <p className="text-xs text-[#54433a] mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-[#f0eded] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
