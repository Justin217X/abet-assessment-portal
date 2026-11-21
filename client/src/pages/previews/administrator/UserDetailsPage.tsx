/**
 * File: UserDetailsPage.tsx
 * Purpose: Shows a selected user's roles, permissions, and record-access preview.
 *
 * !!! No user is loaded. Role and permission changes are disabled. [SD]
 * !!! TODO:
 * - Receive the selected user's ID from the user list.
 * - Load the user's name, roles, and permissions from Django.
 * - Connect Assign role and Remove selected role to checked server saving.
 * - Replace EmptyPanel with the user's actual permissions.
 * - Connect Edit function permissions to the agreed permission rules.
 * - Pass the selected user's ID to RecordAccessPage.
 * - Show loading, success, and error messages.
 * - Django: Check Administrator permission before returning or changing records.
 * [SD]
 *
 * !!! Role changes must use portal rules, not assumed SSO roles. [SD]
 * !!! Opening the record-access preview does not change access. [SD]
 */

import { useState } from "react"
import { Button } from "../../../Button"
import { EmptyPanel } from "../../../components/FacultyPanels"
import { RecordAccessPage } from "./RecordAccessPage"

export function UserDetailsPage() {

    // Switch between user details and the record-access preview.
    const [showRecordAccess, setShowRecordAccess] = useState(false)

    if (showRecordAccess) {
        return (
            <div className="space-y-4">
                <Button variant="secondary" onClick={() => setShowRecordAccess(false)}>
                    Back to user details
                </Button>
                <RecordAccessPage />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <section className="rounded-lg border border-slate-200 bg-white p-4">
                <h2 className="text-lg font-semibold">Selected user</h2>

                {/* !!! TODO: Load the selected user's name and roles from Django. [SD] */}
                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                        <dt className="text-sm font-semibold">User</dt>
                        <dd className="text-sm text-slate-600">No user loaded</dd>
                    </div>

                    <div>
                        <dt className="text-sm font-semibold">Assigned roles</dt>
                        <dd className="text-sm text-slate-600">No roles loaded</dd>
                    </div>
                </dl>

                {/* !!! TODO: Connect role changes after server permission checks are ready. [SD] */}
                <div className="mt-4 flex flex-wrap gap-2">

                    <Button variant="secondary" disabled className="opacity-60">
                        Assign role
                    </Button>

                    <Button variant="secondary" disabled className="opacity-60">
                        Remove selected role
                    </Button>
                </div>
            </section>

            {/* !!! TODO: Load the permissions this user actually has. [SD] */}
            <EmptyPanel
                title="Effective permissions"
                columns={["Portal function", "Access"]}
                message="No effective permissions loaded."
            />

            <div className="flex flex-wrap gap-2">

                <Button variant="secondary" disabled className="opacity-60">
                    Edit function permissions
                </Button>

                <Button variant="secondary" onClick={() => setShowRecordAccess(true)}>
                    Open record access preview
                </Button>
            </div>
        </div>
    )
}
