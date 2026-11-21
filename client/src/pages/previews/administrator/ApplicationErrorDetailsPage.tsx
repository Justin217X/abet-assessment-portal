/**
 * File: ApplicationErrorDetailsPage.tsx
 * Purpose: Shows details about a selected application error.
 *
 * !!! This page currently shows placeholders, not saved error details. [SD]
 * !!! TODO:
 * - Receive the selected error ID from the page opening this view.
 * - Load its recorded time, affected operation, and description from Django.
 * - Show loading, unavailable-record, and request-error messages.
 * - Django: Check Administrator access before returning error details.
 * - Django: Remove passwords, tokens, and private student information
 *   before sending error details to the browser.
 * [SD]
 */

export function ApplicationErrorDetailsPage() {
    return (
        <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-lg font-semibold">Application error details</h2>

            {/* !!! TODO: Load the selected error from Django after checking access. [SD] */}
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
