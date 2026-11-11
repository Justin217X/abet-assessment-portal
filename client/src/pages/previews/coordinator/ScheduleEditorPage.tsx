/**
 * ScheduleEditorPage.tsx
 * Shows the layout for creating, copying, or updating a schedule. [SD]
 */

import { Button } from "../../../Button"
import { EmptyPanel } from "../../../components/FacultyPanels"

const scheduleFields = ["Program", "Semester", "Schedule to copy (optional)"]

export function ScheduleEditorPage() {
    return (
        <div className="space-y-6">
            {/* TODO: Load permitted programs, semesters, and schedules available to copy. [SD] */}
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
            
            {/* TODO: Show the program's assessment rotation and the outcomes selected for this schedule. [SD] */}
            <EmptyPanel
                title="Scheduled outcomes and performance indicators"
                columns={["Student outcome", "Performance indicator", "Scheduled for assessment"]}
                message="No scheduled outcomes loaded."
            />
            
            {/* TODO: Validate and save the schedule when the required selections are available. [SD] */}
            <Button disabled className="opacity-60">Save schedule</Button>
        </div>
    )
}