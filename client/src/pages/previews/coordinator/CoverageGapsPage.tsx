/**
 * CoverageGapsPage.tsx
 * Shows scheduled outcomes and PIs that lack submitted assessment records. [SD]
 */

import { EmptyPanel } from "../../../components/FacultyPanels"

export function CoverageGapsPage() {
    return (
        <div className="space-y-4">
            <p className="text-sm text-slate-600">
                Drafts are tracked separately from submitted assessment records.
            </p>
            
            {/* TODO: Compare the selected schedule with submitted assessment records. [SD] */}
            <EmptyPanel
                title="Scheduled assessments needing submitted records"
                columns={["Student outcome", "Performance indicator", "Course", "Current record"]}
                message="No coverage records loaded."
            />
        </div>
    )
}