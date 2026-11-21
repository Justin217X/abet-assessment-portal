/**
 * File: ApplicationErrorsPage.tsx
 * Purpose: Shows the error-list preview and opens the error-details preview.
 *
 * !!! No saved errors are loaded. The filters are disabled. [SD]
 * !!! TODO:
 * - Load recorded errors from Django.
 * - Add search state and enable the date and operation filters.
 * - Replace EmptyPanel with rows showing the loaded errors.
 * - Add a View error button to each row.
 * - Pass the selected error ID to ApplicationErrorDetailsPage.
 * - Remove the separate Open error details preview button.
 * - Show loading, empty-list, and request-error messages.
 * - Django: Check Administrator access and remove private information
 *   before returning error records.
 * [SD]
 */

import { useState } from "react"
import { Button } from "../../../Button"
import { EmptyPanel } from "../../../components/FacultyPanels"
import { ApplicationErrorDetailsPage } from "./ApplicationErrorDetailsPage"

// Use the same Tailwind styles for both filter fields.
const fieldClass = "mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2"

export function ApplicationErrorsPage() {

    // Switch between the error list and details preview.
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
            {/* !!! TODO: Enable these filters after error records are connected. [SD] */}
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

            {/* !!! TODO: Replace this preview button with a View error button on each row. [SD] */}
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
