/**
 * File: EvaluatorDashboard.tsx
 * Purpose: Shows the Evaluator menu and its selected read-only page.
 *
 * !!! TODO:
 * - App.tsx and Django: Check the signed-in user's Evaluator access.
 * - App.tsx: Make Sign out end the real portal session.
 * - EvaluatorReportArchive.tsx: Show actual released reports and evidence.
 * - EvaluatorSupportingDocuments.tsx: Load released supporting documents.
 * - RoleDataPage.tsx: Load released improvement actions and follow-up results.
 * - Replace the three PendingEvaluatorAction buttons below with working
 *   preview, download, and follow-up evidence actions.
 * - Update the preview messages below when these connections work.
 * [SD]
 *
 * !!! Django must check file permissions. Hiding menu options is not enough. [SD]
 */

import { useState } from "react"
import { DashboardLayout } from "../components/DashboardLayout"
import { PortalIcon } from "../components/PortalIcon"
import { EvaluatorReportArchive } from "../components/EvaluatorReportArchive"
import { EvaluatorSupportingDocuments } from "../components/EvaluatorSupportingDocuments"
import { PendingEvaluatorAction } from "../components/PendingEvaluatorAction"
import { RoleDataPage } from "../components/RoleDataPage"

type Props = { onBackToSignIn: () => void }

// Add, remove, or rename Evaluator menu options here.
const menu = [
    { id: "reports", label: "Assessment reports & evidence", icon: "file-text" },
    { id: "documents", label: "Supporting documents", icon: "archive" },
    { id: "improvement", label: "Improvement actions", icon: "clipboard-list" },
] as const

// Allow only page IDs listed in the menu.
type Page = (typeof menu)[number]["id"]
export function EvaluatorDashboard({ onBackToSignIn }: Props) {

    // Remember the open page. Start with Assessment reports & evidence.
    const [activePage, setActivePage] = useState<Page>("reports")

    // Create a button for each menu option.
    const navigation = <>
        {menu.map((item) => <button type="button" key={item.id} aria-current={activePage === item.id ? "page" : undefined} onClick={() => setActivePage(item.id)}><PortalIcon name={item.icon} />{item.label}</button>)}

    </>
    return <DashboardLayout role="ABET Evaluator" title={menu.find((item) => item.id === activePage)!.label} navigation={navigation} onSignOut={onBackToSignIn}>
        <p className="mb-3 rounded-md bg-blue-50 px-3 py-2 text-sm">Evaluator review workspace · Read-only design preview. Live sign-in and document release permissions are pending.</p>

        {/* Open the report archive, supporting documents, or improvement actions. The improvement actions section below also contains pending buttons. */}
        {activePage === "reports" ? <EvaluatorReportArchive /> : activePage === "documents" ? <EvaluatorSupportingDocuments /> : <div className="space-y-3"><p className="text-sm">Review findings, improvement decisions, actions taken, and follow-up results. Actions Report generation and archived document links are pending.</p><div className="flex flex-wrap gap-2"><PendingEvaluatorAction label="Preview Actions Report" /><PendingEvaluatorAction label="Download Actions Report" /><PendingEvaluatorAction label="View follow-up evidence" /></div><RoleDataPage key={activePage} role="ABET Evaluator" view={activePage} /></div>}
    </DashboardLayout>
}
