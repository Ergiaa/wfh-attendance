import { useQuery } from '@tanstack/react-query';
import { ImageOff } from 'lucide-react';

import { attendanceKeys, fetchPhoto } from '../api/attendance';
import { cn } from '../lib/cn';
import { useObjectUrl } from '../lib/use-object-url';

export interface AuthImageProps {
  /** An API URL that requires the bearer token, e.g. an attendance `photoUrl`. */
  src: string;
  alt: string;
  className?: string;
  /** For thumbnails: `cover` crops to fill, `contain` shows the whole image. */
  fit?: 'cover' | 'contain';
}

// <img src> can't send an Authorization header, so the image is fetched as a blob and shown via
// an object URL. Photos never change, so each one is fetched once and shared across the page.
export function AuthImage({ src, alt, className, fit = 'cover' }: AuthImageProps) {
  const photo = useQuery({
    queryKey: attendanceKeys.photo(src),
    queryFn: ({ signal }) => fetchPhoto(src, signal),
    staleTime: Infinity,
    gcTime: 5 * 60_000,
  });
  const url = useObjectUrl(photo.data);

  if (photo.isError) {
    return (
      <div
        role="img"
        aria-label={`${alt} (unavailable)`}
        className={cn('grid place-items-center bg-surface-muted text-fg-muted', className)}
      >
        <ImageOff aria-hidden className="size-1/3 max-h-8 max-w-8" />
      </div>
    );
  }

  if (!url) {
    return (
      <div
        role="img"
        aria-label={`${alt} (loading)`}
        className={cn('animate-pulse bg-surface-muted', className)}
      />
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      className={cn(fit === 'cover' ? 'object-cover' : 'object-contain', className)}
    />
  );
}
