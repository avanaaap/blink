interface BlinkLogoProps {
  size?: number;
}

export default function BlinkLogo({ size = 80 }: BlinkLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Sun rays */}
      <line x1="60" y1="8" x2="60" y2="24" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="60" y1="96" x2="60" y2="112" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="16" y1="60" x2="32" y2="60" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="88" y1="60" x2="104" y2="60" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
      {/* Diagonal rays */}
      <line x1="28" y1="28" x2="39" y2="39" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="81" y1="81" x2="92" y2="92" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="92" y1="28" x2="81" y2="39" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="39" y1="81" x2="28" y2="92" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
      {/* Eye shape */}
      <path
        d="M20 60C20 60 38 38 60 38C82 38 100 60 100 60C100 60 82 82 60 82C38 82 20 60 20 60Z"
        stroke="#1A1A1A"
        strokeWidth="2.5"
        fill="none"
        strokeLinejoin="round"
      />
      {/* Heart in center */}
      <path
        d="M60 72C60 72 46 62 46 54C46 50 49 47 53 47C56 47 58.5 49 60 51.5C61.5 49 64 47 67 47C71 47 74 50 74 54C74 62 60 72 60 72Z"
        fill="#C4956A"
      />
    </svg>
  );
}
