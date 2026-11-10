/**
 * CoordinatorDashboard.tsx
 * Shows the Coordinator overview and opens the Coordinator pages. [SD]
 */

import { useState } from "react"
import { Button } from "../Button"
import { DashboardLayout } from "../components/DashboardLayout"
import { EmptyPanel } from "../components/FacultyPanels"
import { AssessmentProgressPage } from "../pages/previews/coordinator/AssessmentProgressPage"
import { AssignTaskPage } from "../pages/previews/coordinator/AssignTaskPage"
import { CoordinatorArchivePage } from "../pages/previews/coordinator/CoordinatorArchivePage"
import { CoordinatorPeerReviewsPage } from "../pages/previews/coordinator/CoordinatorPeerReviewsPage"
import { CoverageGapsPage } from "../pages/previews/coordinator/CoverageGapsPage"
import { OutcomesAndIndicatorsPage } from "../pages/previews/coordinator/OutcomesAndIndicatorsPage"
import { ScheduleEditorPage } from "../pages/previews/coordinator/ScheduleEditorPage"
import { SchedulesAndTasksPage } from "../pages/previews/coordinator/SchedulesAndTasksPage"

type CoordinatorDashboardProps = {
    onBackToSignIn: () => void
    onOpenFacultyWorkspace: () => void
}

const coordinatorPages = {
    overview: { title: "Coordinator dashboard", Component: null },
    schedules: { title: "Schedules & tasks", Component: SchedulesAndTasksPage },
    progress: { title: "Assessment progress", Component: AssessmentProgressPage },
    reviews: { title: "Peer reviews", Component: CoordinatorPeerReviewsPage },
    outcomes: { title: "Outcomes & PIs", Component: OutcomesAndIndicatorsPage },
    archive: { title: "Report archive", Component: CoordinatorArchivePage },
    scheduleEditor: { title: "Manage schedule", Component: ScheduleEditorPage },
    assignTask: { title: "Assign assessment", Component: AssignTaskPage },
    coverage: { title: "Assessment coverage", Component: CoverageGapsPage },
}

const menuItems = [
    { id: "overview", label: "Overview" },
    { id: "schedules", label: "Schedules & tasks" },
    { id: "progress", label: "Assessment progress" },
    { id: "reviews", label: "Peer reviews" },
    { id: "outcomes", label: "Outcomes & PIs" },
    { id: "archive", label: "Report archive" },
] as const

const summaryLabels = [
    "Assigned tasks",
    "Current drafts",
    "Tasks with submissions",
    "Completed peer reviews",
]

export function CoordinatorDashboard({
    onBackToSignIn,
    onOpenFacultyWorkspace,
}: CoordinatorDashboardProps) {
    // Keep the selected page inside the Coordinator layout. [SD]
    const [activePage, setActivePage] = useState<keyof typeof coordinatorPages>("overview")
    const { title, Component } = coordinatorPages[activePage]

    const navigation = (
        <>
            {menuItems.map(({ id, label }) => (
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
            
            <Button
                variant="secondary"
                className="mt-4 text-left"
                onClick={onOpenFacultyWorkspace}
                >
                Faculty workspace
            </Button>
            
            <Button variant="secondary" className="text-left" onClick={onBackToSignIn}>
                Sign out
            </Button>
        </>
    )
    
    if (Component) {
        return (
            <DashboardLayout role="Coordinator" title={title} navigation={navigation}>
                <Component />
            </DashboardLayout>
        )
    }
    
    return (
        <DashboardLayout role="Coordinator" title={title} navigation={navigation}>
            {/* TODO: Replace the preview banner when the dashboard uses live data. [SD] */}
            <p className="mb-4 text-sm text-slate-600">UI preview · No records loaded</p>
            
            <div className="flex flex-wrap items-end justify-between gap-4">
                {/* TODO: Load permitted programs and available semesters, then use the selections to filter the dashboard. [SD] */}
                <div className="flex flex-wrap gap-4">
                    <label className="block text-sm font-medium">
                        Program
                        <select
                            disabled
                            className="mt-1 block rounded-md border border-slate-400 bg-white px-3 py-2"
                        >
                            <option>Programs not loaded</option>
                        </select>
                    </label>
                    
                    <label className="block text-sm font-medium">
                        Semester
                        <select
                            disabled
                            className="mt-1 block rounded-md border border-slate-400 bg-white px-3 py-2"
                        >
                            <option>Semesters not loaded</option>
                        </select>
                    </label>
                </div>
                
                <div className="flex flex-wrap gap-2">
                    
                    <Button variant="secondary" onClick={() => setActivePage("scheduleEditor")}>
                        Manage schedule
                    </Button>
                    
                    <Button onClick={() => setActivePage("assignTask")}>
                        Assign assessment
                    </Button>
                </div>
            </div>
            
            {/* TODO: Show counts for the selected program and semester. [SD] */}
            <dl className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {summaryLabels.map((label) => (
                    <div key={label} className="rounded-lg border border-slate-200 bg-white p-4">
                        <dt className="text-sm text-slate-600">{label}</dt>
                        <dd className="mt-1 text-2xl font-bold">
                            <span aria-hidden="true">—</span>
                            <span className="sr-only">Count unavailable</span>
                        </dd>
                    </div>
                ))}
            </dl>
            
            <div className="mt-6 space-y-6">
                {/* TODO: Show assessment task rows and connect search and row actions. [SD] */}
                <EmptyPanel
                    title="Assessment progress"
                    columns={[
                    "Task / Course / PI",
                    "Faculty",
                    "Due date",
                    "Preparation",
                    "Submitted version",
                    "Peer review",
                    "Action",
                ]}
                message="No assessment tasks loaded."
                showSearch
                searchLabel="Search tasks or faculty"
                />
                
                <div>
                    <div className="mb-2 flex justify-end">
                        <Button variant="secondary" onClick={() => setActivePage("coverage")}>
                            View coverage
                        </Button>
                    </div>
                    
                    {/* TODO: Show scheduled PIs without submissions, distinguishing drafts from missing reports. [SD] */}
                    
                    <EmptyPanel
                        title="Scheduled PIs without submitted records"
                        columns={["Performance indicator", "Course", "Current record"]}
                        message="No coverage records loaded."
                    />
                </div>
            </div>
        </DashboardLayout>
    )
}