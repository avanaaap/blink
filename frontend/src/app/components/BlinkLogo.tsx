export function BlinkLogo({ size = 80, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Sun ray lines radiating outward */}
      <line x1="50" y1="5" x2="50" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="73" y1="11" x2="68" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="89" y1="27" x2="82" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="95" y1="50" x2="85" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="89" y1="73" x2="82" y2="68" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="73" y1="89" x2="68" y2="82" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="50" y1="95" x2="50" y2="85" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="27" y1="89" x2="32" y2="82" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="11" y1="73" x2="18" y2="68" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="5" y1="50" x2="15" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="11" y1="27" x2="18" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="27" y1="11" x2="32" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

      {/* Eye outline (almond shape) */}
      <ellipse cx="50" cy="50" rx="30" ry="20" stroke="currentColor" strokeWidth="2.5" fill="none" />

      {/* Heart in the center */}
      <path
        d="M50 55 C50 55, 45 48, 40 48 C35 48, 35 53, 35 53 C35 58, 50 65, 50 65 C50 65, 65 58, 65 53 C65 53, 65 48, 60 48 C55 48, 50 55, 50 55Z"
        fill="#D4A574"
        stroke="none"
      />
    </svg>
  );
}
