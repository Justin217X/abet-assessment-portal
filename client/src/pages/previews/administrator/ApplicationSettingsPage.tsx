/**
 * File: ApplicationSettingsPage.tsx
 * Purpose: Shows the settings list and a preview form for editing a setting.
 *
 * !!! Settings are not loaded, and saving is disabled. [SD]
 * !!! TODO:
 * - Load settings the Administrator is allowed to view from Django.
 * - Replace EmptyPanel with the loaded settings and an Edit button.
 * - Store which setting is selected and show its current value.
 * - Use the correct input for each setting, such as text, number, or checkbox.
 * - Send changes to Django and show success or error messages.
 * - Django: Check Administrator access and validate allowed changes.
 * [SD]
 *
 * !!! Do not display passwords, tokens, or other secret settings. [SD]
 * !!! This page should not allow editing every Django setting. [SD]
 */

import { Button } from "../../../Button"
import { EmptyPanel } from "../../../components/FacultyPanels"

export function ApplicationSettingsPage() {
    return (
        <div className="space-y-6">

            {/* !!! TODO: Load allowed settings from Django. Never return secret values. [SD] */}
            <EmptyPanel
                title="Portal settings"
                columns={["Setting", "Purpose", "Current value", "Action"]}
                message="No application settings loaded."
            />

            <section className="rounded-lg border border-slate-200 bg-white p-4">
                <h2 className="text-lg font-semibold">Edit selected setting</h2>
                <p className="mt-2 text-sm text-slate-600">No editable setting selected.</p>

                {/* !!! TODO: Show the selected setting's input and connect saving to Django. [SD] */}
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
