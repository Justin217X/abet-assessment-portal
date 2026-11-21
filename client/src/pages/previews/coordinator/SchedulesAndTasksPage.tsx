/**
 * File: SchedulesAndTasksPage.tsx
 * Purpose: Shows assessment schedules and assigned faculty tasks.
 *
 * !!! This is an earlier preview page. Its records are not connected yet.
 * Current Coordinator pages also use RoleDataPage.tsx and CoordinatorPlanningPage.tsx.
 * Check CoordinatorDashboard.tsx before connecting or replacing this preview.
 * [SD]
 *
 * !!! TODO:
 * - Load schedules and assigned tasks for the chosen program and semester from Django.
 * - Replace both EmptyPanel tables with the saved records.
 * - Connect schedule and task row actions to the correct selected record.
 * - Use the same saved records as CoordinatorPlanningPage.tsx.
 * - Show loading, empty results, and clear success or error messages where needed.
 * - Django: Check Coordinator permission before returning or changing records.
 * [SD]
 */

import { EmptyPanel } from "../../../components/FacultyPanels"

export function SchedulesAndTasksPage() {
    return (
        <div className="space-y-6">

            {/* !!! TODO: Load schedules and tasks for the selected program and semester. [SD] */}

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
