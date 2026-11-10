/**
 * RecordAccessPage.tsx
 * Shows the reports and materials the selected user can access. [SD]
 */

import { Button } from "../../../Button"
import { EmptyPanel } from "../../../components/FacultyPanels"

export function RecordAccessPage() {
    return (
        <div className="space-y-4">
            <p className="text-sm text-slate-600">
                Record access is managed separately from role assignments.
            </p>
            
            {/* TODO: Load authorized materials and access levels for the selected user. [SD] */}
            <EmptyPanel
                title="Record access"
                columns={["Authorized material", "Program", "Access"]}
                message="No record access details loaded."
            />
            
            {/* TODO: Enable editing for administrators with permission to change these grants. [SD] */}
            <Button disabled className="opacity-60">
                Edit record access
            </Button>
        </div>
    )
}