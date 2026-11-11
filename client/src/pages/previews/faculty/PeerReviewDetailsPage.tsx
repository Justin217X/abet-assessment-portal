/**
 * PeerReviewDetailsPage.tsx
 * Shows the assigned report version, review instructions, and reviewer actions. [SD]
 */

import { Button } from "../../../Button"

const reviewFields = [  
    "Assessment report",
    "Submitted version",
    "Course",
    "Due date",
    "Review status",
]

export function PeerReviewDetailsPage() {
    return (
        <div className="space-y-6">
            {/* TODO: Load the assigned review and the submitted report version it covers. [SD] */}
            <section className="rounded-lg border border-slate-200 bg-white p-4">
                <h2 className="text-lg font-semibold">Peer review details</h2>
                
                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                    {reviewFields.map((label) => (
                        <div key={label}>
                            <dt className="text-sm font-semibold">{label}</dt>
                            <dd className="text-sm text-slate-600">Not loaded</dd>
                        </div>
                    ))}
                </dl>
                
                <h3 className="mt-6 text-sm font-semibold">Review instructions</h3>
                <p className="mt-1 text-sm text-slate-600">
                    No review instructions loaded.
                </p>
                
                {/* TODO: Link to the submitted report and its supporting evidence. [SD] */}
                <div className="mt-4 flex flex-wrap gap-2">
                    
                    <Button variant="secondary" disabled className="opacity-60">
                        View submitted report
                    </Button>
                    
                    <Button variant="secondary" disabled className="opacity-60">
                        View supporting evidence
                    </Button>
                </div>
            </section>
            
            <section className="rounded-lg border border-slate-200 bg-white p-4">
                <h2 className="text-lg font-semibold">Reviewer feedback</h2>
                
                {/* TODO: Save comments on the assigned report version and check
                completion requirements before marking the review complete. [SD] */}
                
                <label className="mt-4 block text-sm font-medium">
                    Review comments
                    
                    <textarea
                        disabled
                        rows={5}
                        placeholder="No review loaded"
                        className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2"
                    />
                </label>
                
                <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="secondary" disabled className="opacity-60">
                        Save comments
                    </Button>
                    
                    <Button disabled className="opacity-60">
                        Mark review complete
                    </Button>
                </div>
            </section>
        </div>
    )
}