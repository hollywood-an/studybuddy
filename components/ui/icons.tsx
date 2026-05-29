// Inline SVG icons (no icon library). Each takes an optional className and
// inherits color via currentColor, so they tint with text-* utilities.
type IconProps = { className?: string };

function Stroke({
  className,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function DocumentIcon({ className }: IconProps) {
  return (
    <Stroke className={className}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M8 13h8M8 17h8M8 9h2" />
    </Stroke>
  );
}

export function UploadIcon({ className }: IconProps) {
  return (
    <Stroke className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M17 8l-5-5-5 5" />
      <path d="M12 3v12" />
    </Stroke>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <Stroke className={className}>
      <path d="M20 6 9 17l-5-5" />
    </Stroke>
  );
}

export function XIcon({ className }: IconProps) {
  return (
    <Stroke className={className}>
      <path d="M18 6 6 18" />
      <path d="M6 6l12 12" />
    </Stroke>
  );
}

export function ArrowLeftIcon({ className }: IconProps) {
  return (
    <Stroke className={className}>
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </Stroke>
  );
}

export function SpinnerIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <Stroke className={className}>
      <path d="M9 18l6-6-6-6" />
    </Stroke>
  );
}

export function BookOpenIcon({ className }: IconProps) {
  return (
    <Stroke className={className}>
      <path d="M12 7v14" />
      <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
    </Stroke>
  );
}

export function CardsIcon({ className }: IconProps) {
  return (
    <Stroke className={className}>
      <rect x="3" y="7" width="13" height="14" rx="2" />
      <path d="M8 4h11a2 2 0 0 1 2 2v11" />
    </Stroke>
  );
}

// Filled four-point sparkle — used for the tutor's "reasoning" callout.
export function SparkleIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2.5l2.1 6.2a3 3 0 0 0 1.9 1.9l6.2 2.1-6.2 2.1a3 3 0 0 0-1.9 1.9L12 22.8l-2.1-6.1a3 3 0 0 0-1.9-1.9L1.8 12.7l6.2-2.1a3 3 0 0 0 1.9-1.9z" />
    </svg>
  );
}
