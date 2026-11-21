/**
 * File: AdministratorDashboard.tsx
 * Purpose: Shows the Administrator menu and its selected page.
 *
 * !!! TODO:
 * - App.tsx: Allow access only after sign-in and an Administrator role check.
 * - App.tsx: Make onBackToSignIn end the real session before returning to sign-in.
 * - RoleDataPage.tsx: Replace fictional users, activity, settings, and errors
 *   with records returned by Django.
 * - Django: Check Administrator permissions before returning or changing records.
 * [SD]
 */

import { useState } from "react"
import { DashboardLayout } from "../components/DashboardLayout"
import { PortalIcon } from "../components/PortalIcon"
import { RoleDataPage } from "../components/RoleDataPage"

type Props = { onBackToSignIn: () => void }

// Change this list to add, remove, or rename Administrator menu options.
const menu = [
    { id: "overview", label: "Overview", icon: "layout-dashboard" },
    { id: "activity", label: "Activity", icon: "clock" },
    { id: "users", label: "Users & access", icon: "users" },
    { id: "settings", label: "Application settings", icon: "clipboard-list" },
    { id: "errors", label: "Application errors", icon: "circle-exclamation-point" },
] as const

type Page = (typeof menu)[number]["id"]
export function AdministratorDashboard({ onBackToSignIn }: Props) {

    // Remember which menu page is open. Start with Overview.
    const [activePage, setActivePage] = useState<Page>("overview")

    // Create a button for each menu option.
    const navigation = <>
        {menu.map((item) => <button type="button" key={item.id} aria-current={activePage === item.id ? "page" : undefined} onClick={() => setActivePage(item.id)}><PortalIcon name={item.icon} />{item.label}</button>)}

    </>
    return <DashboardLayout role="System Administrator" title={menu.find((item) => item.id === activePage)!.label} navigation={navigation} onSignOut={onBackToSignIn}>

        {/* The selected page's records and actions are handled in RoleDataPage.tsx. */}
        <RoleDataPage key={activePage} role="System Administrator" view={activePage} />
    </DashboardLayout>
}
