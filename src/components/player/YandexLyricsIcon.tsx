interface YandexLyricsIconProps {
  size?: number;
  className?: string;
}

export default function YandexLyricsIcon({ size = 20, className = "" }: YandexLyricsIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3.5 7h7" />
      <path d="M7 7v10" />
      <path d="M13.5 8h7" />
      <path d="M13.5 12h7" />
      <path d="M13.5 16h7" />
    </svg>
  );
}
