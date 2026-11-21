/**
 * File: ScheduleEditorPage.tsx
 * Purpose: Shows the layout for creating, copying, or updating a schedule.
 *
 * !!! This is an earlier preview page. Its records are not connected yet.
 * Current Coordinator pages also use RoleDataPage.tsx and CoordinatorPlanningPage.tsx.
 * Check CoordinatorDashboard.tsx before connecting or replacing this preview.
 * [SD]
 *
 * !!! TODO:
 * - Load program, semester, and available schedule choices from Django.
 * - Keep the selected schedule and outcome/PI choices in form state.
 * - Copy a chosen schedule into a new draft without changing the original.
 * - Check required values and save the schedule through Django.
 * - Check CoordinatorPlanningPage.tsx before adding duplicate schedule-saving code.
 * - Show loading, empty results, and clear success or error messages where needed.
 * - Django: Check Coordinator permission before returning or changing records.
 * [SD]
 */

import { Button } from "../../../Button"
import { EmptyPanel } from "../../../components/FacultyPanels"

// Names of the choices shown in the schedule form.
const scheduleFields = ["Program", "Semester", "Schedule to copy (optional)"]

export function ScheduleEditorPage() {
    return (
        <div className="space-y-6">

            {/* !!! TODO: Load allowed programs, semesters, and schedules to copy. [SD] */}
            <fieldset disabled className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-3">
                <legend className="sr-only">Schedule settings</legend>

                {scheduleFields.map((label) => (
                    <label key={label} className="block text-sm font-medium">
                        {label}
                        <select className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2">
                            <option>No options loaded</option>
                        </select>
                    </label>
                ))}
            </fieldset>

            {/* !!! TODO: Show the outcomes and PIs chosen for this schedule. [SD] */}
            <EmptyPanel
                title="Scheduled outcomes and performance indicators"
                columns={["Student outcome", "Performance indicator", "Scheduled for assessment"]}
                message="No scheduled outcomes loaded."
            />

            {/* !!! TODO: Check required choices and connect Save schedule to Django. [SD] */}
            <Button disabled className="opacity-60">Save schedule</Button>
        </div>
    )
}
