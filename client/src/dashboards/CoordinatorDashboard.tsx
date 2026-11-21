/**
 * File: CoordinatorDashboard.tsx
 * Purpose: Shows the Coordinator menu and its selected page.
 *
 * !!! TODO:
 * - App.tsx and Django: Check the signed-in user's Coordinator access.
 * - App.tsx: Make Sign out end the real portal session.
 * - CoordinatorPlanningPage.tsx: Connect schedules and work assignments
 *   to production APIs with permission checks.
 * - RoleDataPage.tsx: Connect real records and the pending actions.
 * - App.tsx and Django: Check Faculty access before opening Faculty workspace.
 * - Remove the PDF samples menu option from production navigation.
 *   Keep historical examples separately for demonstrations.
 * [SD]
 */

import { useState } from "react"
import { DashboardLayout } from "../components/DashboardLayout"
import { PortalIcon } from "../components/PortalIcon"
import { AssignTaskPage } from "../pages/previews/coordinator/AssignTaskPage"
import { ScheduleEditorPage } from "../pages/previews/coordinator/ScheduleEditorPage"
import { RoleDataPage } from "../components/RoleDataPage"

type Props = { onBackToSignIn: () => void; onOpenFacultyWorkspace: () => void }
const menu = [
    { id: "activity", label: "Activity", icon: "clock" },
    { id: "overview", label: "Overview", icon: "layout-dashboard" },
    { id: "schedules", label: "Schedules & tasks", icon: "calendar-days" },
    { id: "progress", label: "Assessment progress", icon: "chart-no-axes-column" },
    { id: "reviews", label: "Peer reviews", icon: "users" },
    { id: "outcomes", label: "Outcomes & PIs", icon: "clipboard-list" },
    { id: "archive", label: "Report archive", icon: "archive" },
    { id: "improvement", label: "Improvement actions", icon: "clipboard-list" },
    { id: "documents", label: "Supporting documents", icon: "file-text" },
    { id: "sample-reports", label: "PDF samples", icon: "file-text" },
    { id: "coverage", label: "Coverage gaps", icon: "circle-exclamation-point" },
    { id: "scheduleEditor", label: "Create schedule", icon: "calendar-days" },
    { id: "assignTask", label: "Assign work", icon: "clipboard-list" },
] as const

// Allow only page IDs listed in the menu.
type Page = (typeof menu)[number]["id"]
export function CoordinatorDashboard({ onBackToSignIn, onOpenFacultyWorkspace }: Props) {

    // Remember the open page. Start with Overview.
    const [activePage, setActivePage] = useState<Page>("overview")

    // Create the menu buttons and the Faculty workspace shortcut.
    const navigation = <>
        {menu.map((item) => <button type="button" key={item.id} aria-current={activePage === item.id ? "page" : undefined} onClick={() => setActivePage(item.id)}><PortalIcon name={item.icon} />{item.label}</button>)}
        <button type="button" onClick={onOpenFacultyWorkspace}><PortalIcon name="graduation-cap" />Faculty workspace</button>
    </>
    return <DashboardLayout role="Coordinator" title={menu.find((item) => item.id === activePage)!.label} navigation={navigation} onSignOut={onBackToSignIn}>

        {/* Create schedule and Assign work open CoordinatorPlanningPage. All other menu options open RoleDataPage. */}
        {activePage === "scheduleEditor" || activePage === "assignTask" ? activePage === "scheduleEditor" ? <ScheduleEditorPage /> : <AssignTaskPage /> : <RoleDataPage key={activePage} role="Coordinator" view={activePage} />}
    </DashboardLayout>
}
