// src/components/common/LoadingSpinner.jsx
import React from "react";

const LoadingSpinner = ({ size = "medium" }) => {
  const sizes = {
    small: "w-6 h-6",
    medium: "w-12 h-12",
    large: "w-16 h-16",
  };

  return (
    <div
      className={`animate-spin rounded-full border-t-2 border-b-2 border-[#57595B] ${sizes[size]}`}
    ></div>
  );
};

export default LoadingSpinner;
