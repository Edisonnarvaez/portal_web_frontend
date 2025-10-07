import React, { useState } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  showPasswordToggle?: boolean;
}

const Input: React.FC<InputProps> = ({ label, type, showPasswordToggle, id, ...props }) => {
  const [show, setShow] = useState(false);
  const isPassword = type === "password" && showPasswordToggle;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-100">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          {...props}
          type={isPassword ? (show ? "text" : "password") : type}
          className="w-full border rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
            onClick={() => setShow((v) => !v)}
          >
            {show ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.236.938-4.675M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-.274.822-.642 1.6-1.09 2.326M15.54 15.54A9.956 9.956 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.236.938-4.675" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default Input;