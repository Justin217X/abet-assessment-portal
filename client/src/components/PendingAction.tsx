/**
 * File: PendingAction.tsx
 * Purpose: Shows a disabled button for a feature that is not connected yet.
 *
 * !!! TODO: replace each use as its feature is implemented. [SD]
 */

export function PendingAction({ label }: { label: string }) {
    return <button type="button" disabled title={`${label} is pending implementation`} className="cursor-not-allowed rounded-md border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500">{label} (pending)</button>
}
