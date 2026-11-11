/**
 * UserDetailsPage.tsx
 * Shows the selected user's roles and effective permissions. [SD]
 */

import { useState } from "react"
import { Button } from "../../../Button"
import { EmptyPanel } from "../../../components/FacultyPanels"
import { RecordAccessPage } from "./RecordAccessPage"

export function UserDetailsPage() {
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
                
                {/* TODO: Load the selected user and their assigned roles. [SD] */}
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
                
                {/* TODO: Enable role changes when the administrator is authorized. [SD] */}
                <div className="mt-4 flex flex-wrap gap-2">
                    
                    <Button variant="secondary" disabled className="opacity-60">
                        Assign role
                    </Button>
                    
                    <Button variant="secondary" disabled className="opacity-60">
                        Remove selected role
                    </Button>
                </div>
            </section>
            
            {/* TODO: Load effective permissions and enable permitted edits. [SD] */}
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