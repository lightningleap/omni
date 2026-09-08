'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

/**
 * Copies a tracking number to the clipboard.
 *
 * The confirmation replaces the label in place and reverts after two seconds,
 * and the button keeps its width through both states so nothing beside it
 * moves. `aria-live` announces the change, because a silent icon swap tells a
 * screen-reader user nothing about whether the copy worked.
 *
 * `navigator.clipboard` is unavailable on insecure origins and can be refused
 * by permission, so a failure leaves the label alone rather than claiming a
 * copy that did not happen.
 */
export default function CopyTrackingButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          /* Clipboard refused — say nothing rather than claim success. */
        }
      }}
      className="btn-commerce-secondary h-9 min-h-0 w-[104px] px-3 text-[12px]"
    >
      <span aria-live="polite" className="inline-flex items-center gap-2">
        {copied ? (
          <>
            <Check aria-hidden size={13} strokeWidth={2} /> Copied
          </>
        ) : (
          <>
            <Copy aria-hidden size={13} strokeWidth={2} /> Copy
          </>
        )}
      </span>
    </button>
  );
}
