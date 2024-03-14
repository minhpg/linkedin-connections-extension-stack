"use client";

import { ReactNode, useState } from "react";
import Image, { ImageProps } from "next/image";

interface AvatarFallbackProps extends Omit<ImageProps, "src"> {
  src: string | null;
  fallback: ReactNode;
}

export default function AvatarFallback({
  src,
  fallback,
  alt,
  ...props
}: AvatarFallbackProps) {
  const [hasError, setHasError] = useState(false);

  if (!src) return fallback;
  if (hasError) return fallback;

  return (
    <Image
      {...props}
      src={src}
      width={50}
      height={50}
      onError={() => !hasError && setHasError(true)}
      alt={alt}
    />
  );
}
