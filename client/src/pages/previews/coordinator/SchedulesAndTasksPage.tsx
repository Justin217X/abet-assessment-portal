/**
 * SchedulesAndTasksPage.tsx
 * Shows assessment schedules and assigned faculty tasks. [SD]
 */

import { EmptyPanel } from "../../../components/FacultyPanels"

export function SchedulesAndTasksPage() {
    return (
        <div className="space-y-6">
            {/* TODO: Load schedules and tasks for the selected program and semester. [SD] */}
            
            <EmptyPanel
                title="Assessment schedules"
                columns={["Program", "Semester", "Scheduled outcomes", "Action"]}
                message="No assessment schedules loaded."
            />
            
            <EmptyPanel
                title="Assessment tasks"
                columns={["Task / Course / PI", "Assigned faculty", "Due date", "Status", "Action"]}
                message="No assessment tasks loaded."
            />
        </div>
    )
}