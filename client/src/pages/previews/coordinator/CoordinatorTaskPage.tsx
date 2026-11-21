/**
 * File: CoordinatorTaskPage.tsx
 * Purpose: Shows the assigned task, its instructions, and its current progress.
 *
 * !!! This is an earlier preview page. Its records are not connected yet.
 * Current Coordinator pages also use RoleDataPage.tsx and CoordinatorPlanningPage.tsx.
 * Check CoordinatorDashboard.tsx before connecting or replacing this preview.
 * [SD]
 *
 * !!! TODO:
 * - Receive the selected task ID from AssessmentProgressPage.
 * - Load its faculty, due date, outcome, PI, instructions, and evidence requirements.
 * - Show preparation, submitted version, and peer review as separate values.
 * - Replace Not loaded messages with the saved task details.
 * - Show loading, empty results, and clear success or error messages where needed.
 * - Django: Check Coordinator permission before returning or changing records.
 * [SD]
 */

// Names of the details shown for a selected task.
const taskFields = [
    "Assessment task",
    "Program",
    "Semester",
    "Course",
    "Assigned faculty",
    "Due date",
    "Student outcomes",
    "Performance indicators",
    "Preparation status",
    "Submitted version",
    "Peer review status",
]

export function CoordinatorTaskPage() {
    return (
        <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-lg font-semibold">Assessment task details</h2>

            {/* !!! TODO: Load the chosen task and its separate preparation, submission, and review status. [SD] */}
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                {taskFields.map((label) => (
                    <div key={label}>\
                    <dt className="text-sm font-semibold">{label}</dt>
                    <dd className="text-sm text-slate-600">Not loaded</dd>
                    </div>
                ))}
            </dl>

            <h3 className="mt-6 text-sm font-semibold">Task instructions</h3>
            <p className="mt-1 text-sm text-slate-600">No task instructions loaded.</p>

            <h3 className="mt-4 text-sm font-semibold">Required evidence</h3>
            <p className="mt-1 text-sm text-slate-600">No evidence requirements loaded.</p>
        </section>
    )
}
