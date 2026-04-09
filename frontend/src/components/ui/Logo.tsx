interface LogoProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Logo({ className, style }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 800 800"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path
        d="M699.9999999703,158 C699.9999999703,158 700,458 700,458 C700,458 400,716 400,716 C400,716 400,416 400,416 C400,416 700,158 700,158 C511,76 311,76 100,158 C100,158 100,458 100,458 C100,458 400,716 400,716 C400,716 400,416 400,416 C400,416 100,158.00000000000006 100,158.00000000000006"
        fill="none"
        stroke="currentColor"
        strokeWidth="100"
        strokeLinejoin="round"
      />
    </svg>
  );
}
