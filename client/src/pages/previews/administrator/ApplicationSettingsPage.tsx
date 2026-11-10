/**
 * ApplicationSettingsPage.tsx
 * Shows permitted settings and the layout for updating an editable value. [SD]
 */

import { Button } from "../../../Button"
import { EmptyPanel } from "../../../components/FacultyPanels"

export function ApplicationSettingsPage() {
    return (
        <div className="space-y-6">
            {/* TODO: Load permitted settings and display only non-secret values. [SD] */}
            <EmptyPanel
                title="Portal settings"
                columns={["Setting", "Purpose", "Current value", "Action"]}
                message="No application settings loaded."
            />
            
            <section className="rounded-lg border border-slate-200 bg-white p-4">
                <h2 className="text-lg font-semibold">Edit selected setting</h2>
                <p className="mt-2 text-sm text-slate-600">No editable setting selected.</p>
                
                {/* TODO: Use the input appropriate for the selected setting and validate changes before saving. [SD] */}
                <fieldset disabled className="mt-4 space-y-4">
                    <legend className="sr-only">Setting value</legend>
                    <label className="block text-sm font-medium">
                        New value
                        <input
                            type="text"
                            className="mt-1 block w-full max-w-sm rounded-md border border-slate-300 bg-white px-3 py-2"
                        />
                    </label>
                    
                    <Button className="opacity-60">Save setting</Button>
                </fieldset>
            </section>
        </div>
    )
}