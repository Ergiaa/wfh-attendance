import { useEffect, useState } from 'react';

// Object URLs pin their blob in memory until revoked, so each one must be revoked with the effect
// that created it. Creating it during render instead (e.g. useMemo) breaks under StrictMode: the
// simulated unmount revokes the URL and the remount reuses the memoized, now-dead URL.
export function useObjectUrl(blob: Blob | null | undefined): string | undefined {
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    const objectUrl = blob ? URL.createObjectURL(blob) : undefined;
    // oxlint-disable-next-line react/set-state-in-effect -- the URL is an external resource tied to this effect's lifetime
    setUrl(objectUrl);
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [blob]);

  return url;
}
