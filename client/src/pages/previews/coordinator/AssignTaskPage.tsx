/**
 * AssignTaskPage.tsx
 * Shows the form for assigning an assessment task to a faculty member. [SD]
 */

import { Button } from "../../../Button"

const assignmentFields = [
    "Assessment schedule",
    "Course",
    "Faculty member",
    "Student outcome",
    "Performance indicator",
]

const fieldClass = "mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2"

export function AssignTaskPage() {
    return (
        <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-lg font-semibold">Assessment assignment details</h2>
            <p className="mt-2 text-sm text-slate-600">No schedule or faculty records loaded.</p>
            
            {/* TODO: Load options from the selected schedule and save the assignment after validation. [SD] */}
            <fieldset disabled className="mt-4 space-y-4">
                <legend className="sr-only">Assessment assignment</legend>
                
                <div className="grid gap-4 sm:grid-cols-2">
                    {assignmentFields.map((label) => (
                        <label key={label} className="block text-sm font-medium">
                            {label}
                            <select className={fieldClass}>
                                <option>No options loaded</option>
                            </select>
                        </label>
                    ))}
                    
                    <label className="block text-sm font-medium">
                        Due date
                        <input type="date" className={fieldClass} />
                    </label>
                </div>
                
                <label className="block text-sm font-medium">
                    Task instructions
                    <textarea rows={3} className={fieldClass} />
                </label>
                
                <label className="block text-sm font-medium">
                    Required evidence
                    <textarea rows={3} className={fieldClass} />
                </label>
                
                <Button className="opacity-60">Assign assessment</Button>
            </fieldset>
        </section>
    ) 
}