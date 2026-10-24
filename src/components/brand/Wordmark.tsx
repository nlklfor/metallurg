import { useReducedMotion } from "motion/react";
import { EncryptedText } from "@/components/ui/encrypted-text";
import { cn } from "@/lib/utils";

// The METALLURG™ wordmark, set in the owner's original TheNeue Black.
// TheNeue is reserved for the wordmark (and brand marks built from it) —
// never use it for headings or body text.

const WORDMARK = "METALLURG™";
// Charset from the motion spec: A–Z 0–9 # $ % & ▓ ░
const SCRAMBLE_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&▓░";

interface WordmarkProps {
  className?: string;
  /** Scramble-reveal on first view (the ENCRYPTED_TEXT signature). */
  animated?: boolean;
  /** Colour of the unresolved glyphs while scrambling. */
  encryptedClassName?: string;
}

export default function Wordmark({
  className,
  animated = true,
  encryptedClassName = "text-dim",
}: WordmarkProps) {
  const reduceMotion = useReducedMotion();
  return (
    <span className={cn("font-wordmark font-black tracking-[-0.02em] leading-none", className)}>
      {animated && !reduceMotion ? (
        <EncryptedText
          text={WORDMARK}
          charset={SCRAMBLE_CHARSET}
          revealDelayMs={60}
          flipDelayMs={30}
          encryptedClassName={encryptedClassName}
        />
      ) : (
        WORDMARK
      )}
    </span>
  );
}
