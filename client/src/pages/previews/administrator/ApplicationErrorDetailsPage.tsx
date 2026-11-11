/**
 * ApplicationErrorDetailsPage.tsx
 * Shows diagnostic information for a selected application error. [SD]
 */

export function ApplicationErrorDetailsPage() {
    return (
        <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-lg font-semibold">Application error details</h2>
            
            {/* TODO: Load authorized diagnostic details with sensitive values removed. [SD] */}
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                    <dt className="text-sm font-semibold">Recorded time</dt>
                    <dd className="text-sm text-slate-600">Not loaded</dd>
                </div>
                
                <div>
                    <dt className="text-sm font-semibold">Affected operation</dt>
                    <dd className="text-sm text-slate-600">Not loaded</dd>
                </div>
            </dl>
            
            <h3 className="mt-6 text-sm font-semibold">Diagnostic description</h3>
            <p className="mt-1 text-sm text-slate-600">No diagnostic details loaded.</p>
        </section>
    )
}