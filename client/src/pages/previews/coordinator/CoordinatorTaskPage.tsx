/**
 * CoordinatorTaskPage.tsx
 * Shows the assigned task, its instructions, and its current progress. [SD]
 */

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
            
            {/* TODO: Load the selected task and show preparation, submission, and review separately. [SD] */}
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