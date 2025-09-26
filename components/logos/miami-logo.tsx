'use client';

type Props = {
  className?: string;
  width?: number;
  height?: number;
  alt?: string;
  // keep for compatibility with existing callers (OG route, dialogs, etc.)
  color?: string;
};

export function MiamiLogo({
  className,
  width = 32,
  height = 32,
  alt = 'Miami AI',
  color, // compat only; not used by <img>
}: Props) {
  void color; // touch it so no-unused-vars won't complain

  return (
    <img
      src="/miami-bg.svg" // ensure this exists in /public
      width={width}
      height={height}
      className={className}
      alt={alt}
      loading="eager"
      decoding="async"
    />
  );
}
