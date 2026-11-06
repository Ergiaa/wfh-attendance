import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';

import { cn } from '../../lib/cn';
import { useToastHost } from '../toast/toast-context';
import { Button } from './Button';

const SIZES = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' } as const;

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: keyof typeof SIZES;
  /** Set false while work is in flight so Esc, the backdrop and the close button are ignored. */
  dismissible?: boolean;
}

// Native <dialog> + showModal() provides the focus trap, Esc handling, inert background and
// top-layer stacking, so none of that is reimplemented here.
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  dismissible = true,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pressStartedOnBackdrop = useRef(false);
  const toastHostRef = useToastHost();
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const requestClose = () => {
    if (dismissible) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      // Keep `open` as the single source of truth: the browser must not close on Esc by itself.
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      // A click whose press began inside the panel (e.g. selecting text, then releasing over
      // the backdrop) must not close the dialog, so both ends have to land on the backdrop.
      onPointerDown={(event) => {
        pressStartedOnBackdrop.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (pressStartedOnBackdrop.current && event.target === event.currentTarget) {
          requestClose();
        }
      }}
      className={cn(
        'm-auto w-[calc(100%-2rem)] rounded-xl border bg-surface p-0 text-fg shadow-xl',
        'backdrop:bg-black/50 backdrop:backdrop-blur-[2px]',
        'transition duration-150 starting:open:scale-95 starting:open:opacity-0',
        SIZES[size],
      )}
    >
      {open && (
        <div className="flex max-h-[calc(100dvh-4rem)] flex-col">
          <header className="flex items-start justify-between gap-4 px-5 pt-5 pb-3">
            <div>
              <h2 id={titleId} className="text-base font-semibold">
                {title}
              </h2>
              {description && (
                <div id={descriptionId} className="mt-1 text-sm text-fg-muted">
                  {description}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Close"
              disabled={!dismissible}
              onClick={requestClose}
              className="-mt-1 -mr-2 px-2"
            >
              <X aria-hidden />
            </Button>
          </header>

          {children && <div className="overflow-y-auto px-5 py-2">{children}</div>}

          {footer && (
            <footer className="flex flex-col-reverse gap-2 px-5 pt-3 pb-5 sm:flex-row sm:justify-end">
              {footer}
            </footer>
          )}
        </div>
      )}
      {open && <div ref={toastHostRef} />}
    </dialog>
  );
}
