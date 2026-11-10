/**
 * EvaluatorDashboard.tsx
 * Opens the read-only Evaluator report, Self-Study, and improvement views. [SD]
 */

import { useState } from "react"
import { Button } from "../Button"
import { DashboardLayout } from "../components/DashboardLayout"
import { EmptyPanel } from "../components/FacultyPanels"
import { EvaluatorReportDetailsPage } from "../pages/previews/evaluator/EvaluatorReportDetailsPage"
import { ImprovementActionsPage } from "../pages/previews/evaluator/ImprovementActionsPage"
import { SelfStudyMaterialsPage } from "../pages/previews/evaluator/SelfStudyMaterialsPage"

type EvaluatorDashboardProps = {
    onBackToSignIn: () => void
}

const evaluatorMenu = [
    { id: "reports", label: "Reports" },
    { id: "self-study", label: "Self-Study Materials" },
    { id: "improvement", label: "Improvement Actions" },
] as const

type EvaluatorPage = (typeof evaluatorMenu)[number]["id"] | "report-details"

const pageTitles: Record<EvaluatorPage, string> = {
    reports: "Authorized reports",
    "report-details": "Report details",
    "self-study": "Self-Study Materials",
    improvement: "Improvement Actions",
}

const reportFilters = ["Program", "Semester", "Student outcome"]

export function EvaluatorDashboard({ onBackToSignIn }: EvaluatorDashboardProps) {
    const [activePage, setActivePage] = useState<EvaluatorPage>("reports")
    const activeMenuItem = activePage === "report-details" ? "reports" : activePage

    const navigation = (
        <>
            {evaluatorMenu.map(({ id, label }) => (
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
            role="ABET Evaluator"
            title={pageTitles[activePage]}
            navigation={navigation}
            >
            <p className="mb-4 text-sm text-slate-600">Read-only preview · No records loaded</p>
        
            {activePage === "reports" && (
                <div className="space-y-4">
                
                    {/* TODO: Load filters and search results from reports released to the evaluator. [SD] */}
                    <fieldset disabled className="flex flex-wrap items-end gap-4">
                        <legend className="sr-only">Report filters</legend>
                    
                        {reportFilters.map((label) => (
                            <label key={label} className="block text-sm font-medium">
                                {label}
                                <select className="mt-1 block rounded-md border border-slate-400 bg-white px-3 py-2">
                                    <option>No options loaded</option>
                                </select>
                            </label>
                        ))}
                    
                        <Button variant="secondary" className="opacity-60">
                           Clear filters
                        </Button>
                    </fieldset>
                
                    {/* TODO: Replace this preview button with Open report on each authorized row. [SD] */}
                    <Button variant="secondary" onClick={() => setActivePage("report-details")}>
                        Open report details preview
                    </Button>
                
                    <EmptyPanel
                        title="Available assessment reports"
                        columns={["Report / Course", "Semester", "Version", "Submitted", "Action"]}
                        message="No assessment reports loaded."
                        showSearch
                        searchLabel="Search available reports"
                    />
                </div>
            )}  
        
            {activePage === "report-details" && (
                <div className="space-y-4">
                    <Button variant="secondary" onClick={() => setActivePage("reports")}>
                        Back to reports
                    </Button>
                    <EvaluatorReportDetailsPage />
                </div>
            )}
        
            {activePage === "self-study" && <SelfStudyMaterialsPage />}
            {activePage === "improvement" && <ImprovementActionsPage />}
        </DashboardLayout>
    )
}