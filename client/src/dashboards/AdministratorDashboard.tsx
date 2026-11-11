/**
 * AdministratorDashboard.tsx
 * Opens the Administrator views for users, settings, and errors. [SD]
 */

import { useState } from "react"
import { Button } from "../Button"
import { DashboardLayout } from "../components/DashboardLayout"
import { EmptyPanel } from "../components/FacultyPanels"
import { ApplicationErrorsPage } from "../pages/previews/administrator/ApplicationErrorsPage"
import { ApplicationSettingsPage } from "../pages/previews/administrator/ApplicationSettingsPage"
import { UserDetailsPage } from "../pages/previews/administrator/UserDetailsPage"

type AdministratorDashboardProps = {
    onBackToSignIn: () => void
}

const administratorMenu = [
    { id: "users", label: "Users & Access" },
    { id: "settings", label: "Application Settings" },
    { id: "errors", label: "Application Errors" },
] as const

type AdministratorPage = (typeof administratorMenu)[number]["id"] | "user-details"

const pageTitles: Record<AdministratorPage, string> = {
    users: "Users and access",
    "user-details": "User details",
    settings: "Application Settings",
    errors: "Application Errors",
}

export function AdministratorDashboard({ onBackToSignIn }: AdministratorDashboardProps) {
    const [activePage, setActivePage] = useState<AdministratorPage>("users")
    const activeMenuItem = activePage === "user-details" ? "users" : activePage

    const navigation = (
        <>
            {administratorMenu.map(({ id, label }) => (
                <Button                
                    key={id}
                    variant="secondary"
                    aria-current={activeMenuItem === id ? "page" : undefined}
                    className="text-left aria-[current=page]:bg-blue-50 aria-[current=page]:font-semibold"
                    onClick={() => setActivePage(id)}
                    >
                    {label}
                </Button>
            ))}
            
            <Button variant="secondary" className="mt-4 text-left" onClick={onBackToSignIn}>
                Sign out
            </Button>
        </>
    )
    
    return (
        <DashboardLayout
            role="System Administrator"
            title={pageTitles[activePage]}
            navigation={navigation}
            >
            <p className="mb-4 text-sm text-slate-600">UI preview · No records loaded</p>
                
               {activePage === "users" && (
                   <div className="space-y-4">
                        
                    {/* TODO: Enable search when the administrator can load permitted portal users. [SD] */}
                    <fieldset disabled className="flex flex-wrap items-end gap-2">
                        <legend className="sr-only">Portal user search</legend>
                            
                        <label className="block text-sm font-medium">
                            Find a portal user
                            <input
                                type="search"
                                placeholder="Name or role"
                                className="mt-1 block rounded-md border border-slate-300 bg-white px-3 py-2"
                            />
                        </label>
                            
                        <Button className="opacity-60">Search</Button>
                        <Button variant="secondary" className="opacity-60">Clear</Button>
                    </fieldset>
                        
                    {/* TODO: Move View access to each user row once records are available. [SD] */}
                    <Button variant="secondary" onClick={() => setActivePage("user-details")}>
                        Open user details preview
                    </Button>
                        
                    <EmptyPanel
                        title="Portal users"
                        columns={["User", "Assigned role", "Action"]}
                        message="No portal users loaded."
                    />
                </div>
            )}
                
            {activePage === "user-details" && (
                <div className="space-y-4">
                    <Button variant="secondary" onClick={() => setActivePage("users")}>
                        Back to users and access
                    </Button>
                    <UserDetailsPage />
                </div>
            )}
                
            {activePage === "settings" && <ApplicationSettingsPage />}
            {activePage === "errors" && <ApplicationErrorsPage />}
            
        </DashboardLayout>
    )
}