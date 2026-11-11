/**
 * AssignReviewerPage.tsx
 * Shows the form for assigning a reviewer to a specific submitted version. [SD]
 */

import { Button } from "../../../Button"

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
            
            {/* TODO: Load eligible reviewers and save the assignment against this submitted version. [SD] */}
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