import React from 'react';

export const HandUnderline: React.FC = () => {
  return (
    <svg
      className="underline-svg"
      viewBox="0 0 200 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <path
        d="M2 8.5C38 3 85 4.5 130 5C158 5.3 182 7 198 9.5"
        stroke="#E5381F"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 9.5C52 6 110 6 188 10"
        stroke="#E5381F"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity="0.6"
      />
    </svg>
  );
};
