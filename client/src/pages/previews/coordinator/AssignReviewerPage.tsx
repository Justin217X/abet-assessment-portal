/**
 * File: AssignReviewerPage.tsx
 * Purpose: Shows the form for assigning a reviewer to a specific submitted version.
 *
 * !!! This is an earlier preview page. Its records are not connected yet.
 * Current Coordinator pages also use RoleDataPage.tsx and CoordinatorPlanningPage.tsx.
 * Check CoordinatorDashboard.tsx before connecting or replacing this preview.
 * [SD]
 *
 * !!! TODO:
 * - Receive the selected report ID and submitted version from the page opening this view.
 * - Load available reviewers from Django using the agreed reviewer rules.
 * - Add form values for the reviewer and instructions.
 * - Save the reviewer assignment against that exact report version in Django.
 * - Enable the form only when loading, checks, and saving work.
 * - Show loading, empty results, and clear success or error messages where needed.
 * - Django: Check Coordinator permission before returning or changing records.
 * [SD]
 */

import { Button } from "../../../Button"

// Use the same Tailwind styles for the form fields.
const fieldClass = "mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2"

export function AssignReviewerPage() {
    return (
        <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-lg font-semibold">Assign reviewer</h2>

            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                    <dt className="text-sm font-semibold">Assessment report</dt>
                    <dd className="text-sm text-slate-600">No report loaded</dd>
                </div>

                <div>
                    <dt className="text-sm font-semibold">Submitted version</dt>
                    <dd className="text-sm text-slate-600">No version loaded</dd>
                </div>
            </dl>

            {/* !!! TODO: Load allowed reviewers and save the choice for this report version. [SD] */}
            <fieldset disabled className="mt-4 space-y-4">
                <legend className="sr-only">Reviewer assignment</legend>

                <label className="block text-sm font-medium">
                    Faculty reviewer
                    <select className={fieldClass}>
                        <option>No reviewers loaded</option>
                    </select>
                </label>

                <label className="block text-sm font-medium">
                    Review instructions
                    <textarea rows={4} className={fieldClass} />
                </label>

                <Button className="opacity-60">Assign reviewer</Button>
            </fieldset>
        </section>
    )
}
