/**
 * ApplicationErrorsPage.tsx
 * Shows the application error list and opens the error details preview. [SD]
 */

import { useState } from "react"
import { Button } from "../../../Button"
import { EmptyPanel } from "../../../components/FacultyPanels"
import { ApplicationErrorDetailsPage } from "./ApplicationErrorDetailsPage"

const fieldClass = "mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2"

export function ApplicationErrorsPage() {
    const [showErrorDetails, setShowErrorDetails] = useState(false)
    
    if (showErrorDetails) {
        return (
            <div className="space-y-4">
                <Button variant="secondary" onClick={() => setShowErrorDetails(false)}>
                    Back to application errors
                </Button>
                <ApplicationErrorDetailsPage />
            </div>
        )
    }
    
    return (
        <div className="space-y-4">
            {/* TODO: Filter recorded errors by date and affected operation. [SD] */}
            <fieldset disabled className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2">
                <legend className="sr-only">Application error filters</legend>
                <label className="block text-sm font-medium">
                    Date
                    <input type="date" className={fieldClass} />
                </label>
                
                <label className="block text-sm font-medium">
                    Affected operation
                    <input type="search" className={fieldClass} />
                </label>
            </fieldset>
            
            {/* TODO: Move View error to each authorized error row once records are loaded. [SD] */}
            <Button variant="secondary" onClick={() => setShowErrorDetails(true)}>
                Open error details preview
            </Button>
            
            <EmptyPanel
                title="Recorded errors"
                columns={["Recorded time", "Affected operation", "Action"]}
                message="No application errors loaded."
            />
        </div>
    )
}