/**
 * RubricPreviewPage.tsx
 * Lets faculty review the rubric before generating the Rubric Report PDF. [SD]
 */

import { Button } from "../../../Button"
import { EmptyPanel } from "../../../components/FacultyPanels"

export function RubricPreviewPage() {
    return (
        <div className="space-y-6">
            {/* TODO: Show the course and assignment selected during report preparation. [SD] */}
            <dl className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2">
                <div>
                    <dt className="text-sm font-semibold">Course</dt>
                    <dd className="text-sm text-slate-600">No course loaded</dd>
                </div>
                <div>
                    <dt className="text-sm font-semibold">Assignment</dt>
                    <dd className="text-sm text-slate-600">No assignment loaded</dd>
                </div>
            </dl>
            
            {/* TODO: Display the assignment's rubric ratings, points, and PI mappings. [SD] */}
            <EmptyPanel
                title="Rubric criteria"
                columns={[
                "Criterion",
                "Performance level",
                "Point value",
                "Performance indicator (PI)",
            ]}
            message="No rubric criteria loaded."
            />
            
            {/* TODO: Enable PDF generation after faculty confirm a valid, current preview. [SD] */}
            <div>
                <Button disabled className="cursor-not-allowed opacity-60">
                    Generate Rubric Report PDF
                </Button>
                
                <p className="mt-2 text-sm text-slate-600">
                    Load and confirm the rubric preview before generating the report.
                </p>
            </div>
        </div>
    )
}