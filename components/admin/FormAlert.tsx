import { AlertIcon, CheckIcon } from "./Icons";

/** Error / success banner shown at the top of an admin form. */
export function FormAlert({
  error,
  success,
}: {
  error?: string | null;
  success?: string | null;
}) {
  if (error) {
    return (
      <div
        role="alert"
        className="mb-4 flex items-start gap-2 rounded-xl border border-error/30 bg-error-soft px-3 py-2.5 text-sm text-error"
      >
        <AlertIcon width={18} height={18} className="mt-0.5 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  if (success) {
    return (
      <div
        role="status"
        className="mb-4 flex items-start gap-2 rounded-xl border border-success/30 bg-success-soft px-3 py-2.5 text-sm text-success"
      >
        <CheckIcon width={18} height={18} className="mt-0.5 shrink-0" />
        <span>{success}</span>
      </div>
    );
  }

  return null;
}
