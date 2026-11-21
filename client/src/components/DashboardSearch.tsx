/**
 * File: DashboardSearch.tsx
 * Purpose: Provides a reusable search field for dashboard record lists.
 *
 * The page using this field controls the search text and filters its records.
 */

import { PortalIcon } from "./PortalIcon"

// Accept a label, search text, and a function to update that text.
type DashboardSearchProps = { label: string; value: string; onChange: (value: string) => void }
export function DashboardSearch({ label, value, onChange }: DashboardSearchProps) {
    return <label className="mx-3 my-2 flex min-w-0 items-center gap-2 rounded-md border border-[var(--faculty-border)] bg-[var(--faculty-surface)] px-2 py-1.5 text-sm">
        <PortalIcon name="search" />

        {/* Provide an accessible label for screen readers. */}
        <span className="sr-only">{label}</span>

        {/* Send typed text to the parent page so it can filter its records. */}
        <input type="search" placeholder={label} value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 bg-transparent outline-none" />
    </label>
}
