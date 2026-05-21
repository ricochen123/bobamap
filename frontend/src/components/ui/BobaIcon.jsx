/** Inline boba cup icon (matches public/boba-icon.svg) — avoids emoji font tofu. */
export default function BobaIcon({ className = "h-8 w-8", ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden
      {...props}
    >
      <circle cx="32" cy="32" r="30" fill="#f2d5c9" />
      <path d="M22 18h20l-2 28H24L22 18z" fill="#c96b4f" />
      <circle cx="28" cy="12" r="3" fill="#4a3728" />
      <circle cx="36" cy="10" r="2.5" fill="#4a3728" />
      <circle cx="32" cy="8" r="2" fill="#4a3728" />
      <ellipse cx="32" cy="38" rx="10" ry="6" fill="#9b8ab5" opacity="0.6" />
    </svg>
  );
}
