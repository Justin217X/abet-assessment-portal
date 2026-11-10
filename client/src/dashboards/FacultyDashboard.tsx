/**
 * FacultyDashboard.tsx
 * Shows the Faculty overview and connects its sidebar to the Faculty pages. [SD]
 */

import { useState } from "react"
import { Button } from "../Button"
import { DashboardLayout } from "../components/DashboardLayout"
import {FacultyAssessmentsPanel, FacultyPeerReviewsPanel,} from "../components/FacultyPanels"
import { MyAssessmentsPage } from "../pages/previews/faculty/MyAssessmentsPage"
import { FacultyPeerReviewsPage } from "../pages/previews/faculty/FacultyPeerReviewsPage"
import { FacultyArchivePage } from "../pages/previews/faculty/FacultyArchivePage"

type FacultyDashboardProps = {
    onBackToSignIn: () => void
}

const facultyMenu = [
    { id: "dashboard", label: "Dashboard", title: "Faculty dashboard" },
    { id: "assessments", label: "My assessments", title: "My assessments" },
    { id: "reviews", label: "Peer reviews", title: "Peer reviews" },
    { id: "archive", label: "Report archive", title: "Report archive" },
] as const

type FacultyPage = (typeof facultyMenu)[number]["id"]

// Keep the status labels visible while counts are unavailable. [SD]
const assessmentStatuses = [
    "To start",
    "Drafts",
    "Revision drafts",
    "Submitted for review",
]

export function FacultyDashboard({ onBackToSignIn }: FacultyDashboardProps) {
    // Start on the overview and remember which menu item is open. [SD]
    const [activePage, setActivePage] = useState<FacultyPage>("dashboard")
    const title =
        facultyMenu.find(({ id }) => id === activePage)?.title ?? "Faculty dashboard"

    const navigation = (
        <>
        {facultyMenu.map(({ id, label }) => (
            <Button
                key={id}
                variant="secondary"
                aria-current={activePage === id ? "page" : undefined}
                className="text-left aria-[current=page]:bg-blue-50 aria-[current=page]:font-semibold"
                onClick={() => setActivePage(id)}
            >
            {label}
            </Button>
        ))}

        {/* Return to sign-in when leaving the Faculty demo. [SD] */}
        <Button
            variant="secondary"
            className="mt-4 text-left"
            onClick={onBackToSignIn}
            >
            Sign out
        </Button>
        </>
    )

  return (
    <DashboardLayout role="Faculty" title={title} navigation={navigation}>
        {/* TODO: Remove the preview banner when the dashboard uses live data. [SD] */}
        <p className="mb-4 text-sm text-slate-600">UI preview · No records loaded</p>
        
        {/* Keep the semester selector and summary on the overview. [SD] */}
        {activePage === "dashboard" && (
            <>
            {/* TODO: Load available semesters and filter the overview by the selected semester. [SD] */}
            <label htmlFor="faculty-semester" className="block text-sm font-medium">
                Semester
            </label>
            <select
                id="faculty-semester"
                disabled
                className="mt-1 rounded-md border border-slate-400 bg-white px-3 py-2"
            >
                <option>Semesters not loaded</option>
            </select>
            
            <section className="mt-6" aria-labelledby="assessment-summary">
                <h2 id="assessment-summary" className="mb-3 text-lg font-semibold">
                    Assessment summary
                </h2>
                
                {/* TODO: Show counts for the signed-in faculty member and selected semester. [SD] */}
                <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {assessmentStatuses.map((label) => (
                        <div
                            key={label}
                            className="rounded-lg border border-slate-200 bg-white p-4"
                            >
                                <dt className="text-sm text-slate-600">{label}</dt>
                                <dd className="mt-1 text-2xl font-bold">
                                    <span aria-hidden="true">—</span>
                                    <span className="sr-only">Count unavailable</span>
                                    </dd>
                        </div>
                    ))}
                    </dl>
            </section>
            
            {/* TODO: Load assigned assessments and peer reviews, then connect each row's action. [SD] */}
            <div className="mt-6 space-y-6">
                <FacultyAssessmentsPanel />
                <FacultyPeerReviewsPanel />
            </div>
            </>
            )}
            
            {/* Show the selected page inside the same dashboard layout. [SD] */}
            {activePage === "assessments" && <MyAssessmentsPage />}
            {activePage === "reviews" && <FacultyPeerReviewsPage />}
            {activePage === "archive" && <FacultyArchivePage />}
    </DashboardLayout>
  )
}