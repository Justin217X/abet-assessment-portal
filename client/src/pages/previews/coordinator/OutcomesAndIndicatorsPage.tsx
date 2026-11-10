/**
 * OutcomesAndIndicatorsPage.tsx
 * Shows approved student outcomes, performance indicators, and their links. [SD]
 */

import { EmptyPanel } from "../../../components/FacultyPanels"

export function OutcomesAndIndicatorsPage() {
    return (
        <div className="space-y-6">
            {/* TODO: Load approved records for the selected program and link authorized row actions. [SD] */}
            <EmptyPanel
                title="Student outcomes"
                columns={["Outcome", "Description", "Version", "Action"]}
                message="No student outcomes loaded."
            />
            
            <EmptyPanel
                title="Performance indicators"
                columns={["Performance indicator", "Description", "Linked outcome", "Version", "Action"]}
                message="No performance indicators loaded."
            />
        </div>
    )
}