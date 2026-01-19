import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const FloatingInput: React.FC<FloatingInputProps> = ({ label, value, onChange, type = "text", ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value !== undefined && value !== "";

  return (
    <div className="relative w-full pt-6">
      <label
        className={cn(
          "absolute left-0 transition-all duration-200 pointer-events-none uppercase tracking-widest font-bold",
          (isFocused || hasValue) 
            ? "top-0 text-[10px] text-gray-500" 
            : "top-7 text-2xl text-gray-600"
        )}
      >
        {label}
      </label>
      <input
        {...props}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="w-full bg-transparent border-t-0 border-x-0 border-b-2 border-gray-800 focus:border-gray-700 outline-none px-0 py-2 text-2xl transition-colors font-serif appearance-none rounded-none"
      />
    </div>
  );
};

export default FloatingInput;