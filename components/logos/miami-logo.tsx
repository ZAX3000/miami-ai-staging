'use client';

type Props = {
  className?: string;
  width?: number;
  height?: number;
  alt?: string;
  // keep for compatibility with existing callers (OG route, dialogs, etc.)
  // The <img> version doesn't use it, but including it avoids TS errors.
  color?: string;
};

export function MiamiLogo({
  className,
  width = 32,
  height = 32,
  alt = 'Miami AI',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  color, // intentionally unused (compat only)
}: Props) {
  return (
    <img
      src="/miami-bg.svg"      // file placed in /public
      width={width}
      height={height}
      className={className}
      alt={alt}
      loading="eager"
      decoding="async"
    />
  );
}
