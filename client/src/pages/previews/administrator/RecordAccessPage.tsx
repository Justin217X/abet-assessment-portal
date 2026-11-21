/**
 * File: RecordAccessPage.tsx
 * Purpose: Shows which reports and documents a selected user can access.
 *
 * !!! Access records are not loaded, and editing is disabled. [SD]
 * !!! TODO:
 * - Receive the selected user's ID from the page opening this view.
 * - Load that user's report and document access from Django.
 * - Replace EmptyPanel with the loaded records.
 * - Connect Edit record access to a form for allowed access changes.
 * - Show access expiration dates where they apply.
 * - Save changes through Django and show success or error messages.
 * - Django: Check permission before showing or changing access.
 * [SD]
 *
 * !!! Role assignments and access to individual records are separate. [SD]
 * !!! Django must check access again when a user opens or downloads a file. [SD]
 */

import { Button } from "../../../Button"
import { EmptyPanel } from "../../../components/FacultyPanels"

export function RecordAccessPage() {
    return (
        <div className="space-y-4">
            <p className="text-sm text-slate-600">
                Record access is managed separately from role assignments.
            </p>

            {/* !!! TODO: Load the selected user's report and document access from Django. [SD]*/}
            <EmptyPanel
                title="Record access"
                columns={["Authorized material", "Program", "Access"]}
                message="No record access details loaded."
            />

            {/* !!! TODO: Connect this button to an access-editing form and checked server saving. [SD] */}
            <Button disabled className="opacity-60">
                Edit record access
            </Button>
        </div>
    )
}
