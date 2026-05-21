import { useState } from "react";

export default function LazyImage({ src, alt, className = "" }) {
  const [loaded, setLoaded] = useState(false);

  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-boba-100 dark:bg-gray-800 ${className}`}>
        <span className="text-4xl">🧋</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700" />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
