import { Camera, ImageUp, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';

import { useObjectUrl } from '../lib/use-object-url';
import { Alert } from './ui/Alert';
import { Button } from './ui/Button';
import { Spinner } from './ui/Spinner';

// Matches the gateway's upload limits, so a bad file is rejected before it's sent.
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const JPEG_QUALITY = 0.85;

type CameraState =
  | { status: 'idle' }
  | { status: 'starting' }
  | { status: 'live' }
  | { status: 'error'; message: string };

export interface CameraCaptureProps {
  value: File | null;
  onChange: (photo: File | null) => void;
  disabled?: boolean;
}

export function CameraCapture({ value, onChange, disabled = false }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [camera, setCamera] = useState<CameraState>({ status: 'idle' });
  const [fileError, setFileError] = useState<string | null>(null);
  const previewUrl = useObjectUrl(value);

  // Browsers only expose the camera on HTTPS or localhost, e.g. not on a phone opening the dev
  // server by LAN IP. The file input (which on phones can open the camera itself) still works.
  const cameraSupported =
    typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  const startCamera = async () => {
    setFileError(null);
    setCamera({ status: 'starting' });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      setCamera({ status: 'live' });
    } catch (error) {
      setCamera({ status: 'error', message: cameraErrorMessage(error) });
    }
  };

  // The <video> only mounts once the state is live, so the stream is attached afterwards.
  useEffect(() => {
    if (camera.status === 'live' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [camera.status]);

  const capture = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) {
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCamera({ status: 'error', message: 'Could not capture a photo. Please try again.' });
          return;
        }
        stopCamera();
        setCamera({ status: 'idle' });
        onChange(new File([blob], `check-in-${Date.now()}.jpg`, { type: 'image/jpeg' }));
      },
      'image/jpeg',
      JPEG_QUALITY,
    );
  };

  const selectFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Reset so choosing the same file again still fires a change event.
    event.target.value = '';
    if (!file) {
      return;
    }
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError('Choose a JPEG, PNG or WebP image.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setFileError('The photo must be 5 MB or smaller.');
      return;
    }
    setFileError(null);
    stopCamera();
    setCamera({ status: 'idle' });
    onChange(file);
  };

  const retake = () => {
    onChange(null);
    if (cameraSupported) {
      void startCamera();
    }
  };

  const chooseFile = () => fileInputRef.current?.click();

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl border bg-surface-muted">
        {value && previewUrl ? (
          <img src={previewUrl} alt="Your check-in photo" className="size-full object-cover" />
        ) : camera.status === 'live' ? (
          // Mirrored so the preview behaves like a mirror; the captured photo itself isn't.
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            aria-label="Camera preview"
            className="size-full -scale-x-100 object-cover"
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-3 p-6 text-center text-fg-muted">
            {camera.status === 'starting' ? (
              <>
                <Spinner className="size-6" />
                <p className="text-sm">Waiting for camera permission…</p>
              </>
            ) : (
              <>
                <span className="grid size-12 place-items-center rounded-full bg-surface text-fg-muted">
                  <Camera aria-hidden className="size-6" />
                </span>
                <p className="max-w-xs text-sm">
                  Take a photo of yourself at your workspace as proof you're working from home.
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {camera.status === 'error' && <Alert tone="danger">{camera.message}</Alert>}
      {fileError && <Alert tone="danger">{fileError}</Alert>}

      <div className="flex flex-wrap gap-2">
        {value ? (
          <Button variant="secondary" onClick={retake} disabled={disabled}>
            <RotateCcw aria-hidden />
            Retake
          </Button>
        ) : camera.status === 'live' ? (
          <Button onClick={capture} disabled={disabled}>
            <Camera aria-hidden />
            Capture photo
          </Button>
        ) : (
          cameraSupported && (
            <Button
              onClick={() => void startCamera()}
              loading={camera.status === 'starting'}
              disabled={disabled}
            >
              <Camera aria-hidden />
              {camera.status === 'error' ? 'Try camera again' : 'Open camera'}
            </Button>
          )
        )}

        {!value && (
          <Button variant="secondary" onClick={chooseFile} disabled={disabled}>
            <ImageUp aria-hidden />
            Upload a photo
          </Button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          capture="user"
          hidden
          onChange={selectFile}
        />
      </div>
    </div>
  );
}

function cameraErrorMessage(error: unknown): string {
  const name = error instanceof DOMException ? error.name : '';
  if (name === 'NotAllowedError') {
    return 'Camera access was blocked. Allow it in your browser settings, or upload a photo instead.';
  }
  if (name === 'NotFoundError' || name === 'OverconstrainedError') {
    return 'No camera was found on this device. Upload a photo instead.';
  }
  if (name === 'NotReadableError') {
    return 'The camera is being used by another app. Close it and try again, or upload a photo.';
  }
  return 'The camera could not be started. Upload a photo instead.';
}
