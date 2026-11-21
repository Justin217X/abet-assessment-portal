/**
 * File: FacultyDashboard.tsx
 * Purpose: Shows Faculty courses, tasks, deadlines, reports, and activity.
 *
 * Developer notes:
 * - Change menu options in facultyMenu below.
 * - Change Faculty layout styles in ../styles/FacultyDashboard.css.
 * - Change shared dashboard styles in ../styles/DashboardStyles.css.
 * - Change university names and images in ../config/branding.ts.
 *
 * !!! TODO:
 * - App.tsx and Django: Check Faculty access and make Sign out end the real session.
 * - api/portalData.ts and Django: Replace demo requests with live saved records.
 * - helpers/facultyDashboardData.ts: Replace the demo profile with the signed-in user.
 * - Replace the fall-2026 starting semester below with an available current semester.
 * - RecentActivity.tsx: Show activity saved by Django for the signed-in user.
 * - Connect recent-report downloads below to saved PDFs with server access checks.
 * - AssessmentWorkflowPage.tsx: Connect roster refresh, server drafts, final PDFs,
 *   submission, and archiving. Keep those changes in the reporting page.
 * - Update demo labels and error messages after live data is connected.
 * [SD]
 */

import { useEffect, useState } from "react"
import type { CSSProperties } from "react"
import { AssessmentProgress } from "../components/StatusProgress"
import { RecentActivity } from "../components/RecentActivity"
import { DashboardSearch } from "../components/DashboardSearch"
import { PortalIcon } from "../components/PortalIcon"
import { CampusBanner } from "../components/CampusBanner"
import { FacultyRosterPage } from "../pages/previews/faculty/FacultyRosterPage"
import { MyAssessmentsPage } from "../pages/previews/faculty/MyAssessmentsPage"
import { FacultyPeerReviewsPage } from "../pages/previews/faculty/FacultyPeerReviewsPage"
import { FacultyArchivePage } from "../pages/previews/faculty/FacultyArchivePage"
import { branding } from "../config/branding"
import { buildFacultyDashboardData } from "../helpers/facultyDashboardData"
import { loadPortalData } from "../api/portalData"
import type { PortalData } from "../api/portalData"
import "../styles/DashboardStyles.css"
import "../styles/FacultyDashboard.css"

type FacultyDashboardProps = { onBackToSignIn: () => void }

// Add, remove, or rename Faculty menu options here.
const facultyMenu = [
    { id: "dashboard", icon: "layout-dashboard", label: "Dashboard" },
    { id: "assessments", icon: "clipboard-list", label: "My assessments" },
    { id: "roster", icon: "users", label: "View roster" },
    { id: "report", icon: "file-text", label: "Final Instrument Report" },
    { id: "reviews", icon: "users", label: "Peer reviews" },
    { id: "archive", icon: "archive", label: "Report archive" },
] as const

type FacultyPage = (typeof facultyMenu)[number]["id"]

export function FacultyDashboard({ onBackToSignIn }: FacultyDashboardProps) {

    // Remember the open page, loaded records, semester, and selected assessment.
    const [activePage, setActivePage] = useState<FacultyPage>("dashboard")
    const [data, setData] = useState<PortalData | null>(null)
    const [loadError, setLoadError] = useState("")
    const [semesterId, setSemesterId] = useState("fall-2026")

    // Load shared demo records from Django. Cancel the request when leaving this page.
    useEffect(() => {
        const controller = new AbortController()
        loadPortalData(controller.signal).then(setData).catch((reason: unknown) => {
            if (!controller.signal.aborted) setLoadError(reason instanceof Error ? reason.message : "Could not load fictional records.")
        })
        return () => controller.abort()
    }, [])

    // Prepare dashboard lists for the chosen semester. These records still use the demo profile.
    const { sampleCourses, sampleTasks, sampleAssessments, sampleReports, samplePeerReviews, sampleFaculty } = buildFacultyDashboardData(data, semesterId)

    // Keep separate search text for courses, tasks, and recent reports.
    const [courseSearch, setCourseSearch] = useState("")
    const [taskSearch, setTaskSearch] = useState("")
    const [reportSearch, setReportSearch] = useState("")
    const matches = (text: string, query: string) => text.toLowerCase().includes(query.trim().toLowerCase())
    const visibleTasks = sampleTasks.filter((task) => matches(`${task.title} ${task.course} ${task.status} ${task.due}`, taskSearch))
    const visibleReports = sampleReports.filter((report) => matches(`${report.title} ${report.course} ${report.archived}`, reportSearch))

    // Tasks arrive sorted by due date. Show unfinished work as upcoming deadlines.
    const visibleDeadlines = sampleTasks

    // Put unfinished peer reviews before completed reviews.
    const visibleReviews = [...samplePeerReviews].sort((a, b) => Number(a.status === "completed") - Number(b.status === "completed"))
    const visibleCourses = sampleCourses.filter((course) =>
        `${course.code} ${course.title}`
            .toLowerCase()
            .includes(courseSearch.toLowerCase()),
    )

    const pageTitle = facultyMenu.find(({ id }) => id === activePage)?.label

    return (
        <div
            className="faculty-portal faculty-responsive"
            style={
                {
                    "--portal-pattern": `url("${branding.graphicPattern.imageUrl}")`,
                } as CSSProperties
            }
        >
            <a className="faculty-skip-link" href="#faculty-content">
                Skip to content
            </a>
            <header className="faculty-header">
                <a
                    href="#faculty-content"
                    className="faculty-brand"
                    onClick={() => setActivePage("dashboard")}
                >
                    <PortalIcon
                        name="graduation-cap"
                        className="faculty-brand-icon"
                    />
                    {branding.portalName}
                </a>
                <div className="faculty-header-actions">
                    <span>Faculty workspace</span>
                    <span
                        className="faculty-header-avatar"
                        aria-label={`Demo profile: ${sampleFaculty.name}`}
                    >
                        {sampleFaculty.initials}
                    </span>

                    {/* !!! App.tsx must end the real session; this callback currently opens sign-in only. [SD] */}
                    <button type="button" onClick={onBackToSignIn}>
                        <PortalIcon name="log-out" /> Sign out
                    </button>
                </div>
            </header>
            <CampusBanner
                title="Faculty Assessment Portal"
                subtitle={sampleFaculty.semester}
            />
            <main
                id="faculty-content"
                className="faculty-content faculty-content-full"
                tabIndex={-1}
            >
                <div className="faculty-toolbar">
                    <nav aria-label="Faculty navigation">
                        {facultyMenu.map(({ id, label, icon }) => (
                            <button
                                key={id}
                                type="button"
                                aria-current={
                                    activePage === id ? "page" : undefined
                                }
                                onClick={() => setActivePage(id)}
                                disabled={id === "report"}
                                className="disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <PortalIcon name={icon} />
                                {label}{id === "report" ? " (pending)" : ""}
                            </button>
                        ))}
                    </nav>
                    <span className="faculty-demo-label">
                        Design preview · Generative AI mock data
                    </span>
                </div>
                {loadError && <p role="alert" className="mb-3 rounded-lg bg-red-50 p-3">{loadError}</p>}
                {!data && !loadError && <p role="status" className="mb-3">Loading fictional records from Django…</p>}
                {activePage === "dashboard" && data && <label className="mb-3 flex flex-wrap items-center gap-2 text-sm">Semester<select className="rounded-md border border-slate-300 bg-white px-3 py-1.5" value={semesterId} onChange={(event) => setSemesterId(event.target.value)}>{data.semesters.map((semester) => <option key={semester.id} value={semester.id}>{semester.label}</option>)}</select><span>{sampleCourses.length} courses · {sampleAssessments.length} assessments</span></label>}
                {activePage === "dashboard" && (
                    <div className="faculty-columns">
                        <aside
                            className="faculty-column"
                            aria-label="Workspace summary"
                        >
                            <section className="faculty-card faculty-welcome">
                                <span className="faculty-avatar">
                                    <PortalIcon name="user-round" />
                                </span>
                                <div>
                                    <h2>Welcome, {sampleFaculty.name}</h2>
                                    <p>Faculty</p>
                                    <p>{sampleFaculty.semester}</p>
                                </div>
                            </section>
                            <section className="faculty-card">
                                <h2>
                                    <PortalIcon name="chart-no-axes-column" />{" "}
                                    Semester progress
                                </h2>
                                <div className="faculty-card-body">
                                    <AssessmentProgress statuses={sampleAssessments.map((row) => row.status)} label={sampleFaculty.semester || "Semester progress"} />
                                </div>
                            </section>
                            <RecentActivity role="faculty" data={data} />
                        </aside>
                        <div className="faculty-column faculty-main-column">
                            <section className="faculty-card">
                                <div className="faculty-card-heading">
                                    <h2>
                                        <PortalIcon name="graduation-cap" />{" "}
                                        Your courses
                                    </h2>
                                    <button
                                        type="button"
                                        className="faculty-text-link"
                                        onClick={() =>
                                            setActivePage("assessments")
                                        }
                                    >
                                        View assessments{" "}
                                        <PortalIcon name="chevron-right" />
                                    </button>
                                </div>
                                <label className="mx-[18px] mt-4 flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
                                    <PortalIcon name="search" />
                                    <span className="sr-only">
                                        Search courses
                                    </span>
                                    <input
                                        type="search"
                                        placeholder="Search your courses"
                                        value={courseSearch}
                                        onChange={(e) =>
                                            setCourseSearch(e.target.value)
                                        }
                                        className="min-w-0 flex-1 bg-transparent outline-none"
                                    />
                                </label>
                                {!visibleCourses.length && (
                                    <p role="status" className="p-4 text-sm">
                                        No courses match your search.
                                    </p>
                                )}
                                <div className="faculty-course-grid" role="region" aria-label="Course records" tabIndex={0}>
                                    {visibleCourses.map((course) => (
                                        <article
                                            key={course.code}
                                            className="faculty-course"
                                        >
                                            <p className="faculty-course-code">
                                                <PortalIcon name="graduation-cap" />{" "}
                                                {course.code}
                                            </p>
                                            <div>
                                                <h3>{course.title}</h3>
                                                <p>
                                                    <PortalIcon
                                                        name={course.icon}
                                                    />{" "}
                                                    {course.status}
                                                </p>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </section>
                            <section className="faculty-card">
                                <h2>
                                    <PortalIcon name="bell" /> Needs your
                                    attention
                                </h2>
                                <DashboardSearch label="Search tasks" value={taskSearch} onChange={setTaskSearch} />
                                <div className="faculty-task-list faculty-record-scroll" role="region" aria-label="Tasks needing attention" tabIndex={0}>
                                    {!visibleTasks.length && <p role="status" className="py-3 text-sm">No tasks match your search.</p>}
                                    {visibleTasks.map((task) => (
                                        <article
                                            key={task.id}
                                            className="faculty-task"
                                        >
                                            <div className="faculty-task-details">
                                                <div className="faculty-task-heading">
                                                    <h3>
                                                        <PortalIcon name="file-text" />{" "}
                                                        {task.title}
                                                    </h3>
                                                    <span
                                                        className={
                                                            task.ready
                                                                ? "faculty-status faculty-status-ready"
                                                                : "faculty-status faculty-status-attention"
                                                        }
                                                    >
                                                        <PortalIcon
                                                            name={
                                                                task.ready
                                                                    ? "circle-check"
                                                                    : "circle-exclamation-point"
                                                            }
                                                        />{" "}
                                                        {task.status}
                                                    </span>
                                                </div>
                                                <p className="faculty-muted">
                                                    {task.course}
                                                </p>
                                                <p>{task.description}</p>
                                            </div>
                                            <div className="faculty-task-action">
                                                <p>
                                                    <PortalIcon name="calendar-days" />{" "}
                                                    Due{" "}
                                                    <time dateTime={task.date}>
                                                        {task.due}
                                                    </time>
                                                </p>

                                                {/* Report review is connected in a separate change. */}
                                                <button
                                                    type="button"
                                                    className="faculty-action"
                                                    disabled
                                                    title="Report review will be connected in a separate change"
                                                >
                                                    {task.ready
                                                        ? "Review assessment (pending)"
                                                        : "Continue assessment (pending)"}
                                                </button>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </section>
                            <section className="faculty-card">
                                <div className="faculty-card-heading">
                                    <h2>
                                        <PortalIcon name="archive" /> Recent
                                        reports
                                    </h2>
                                    <button
                                        type="button"
                                        className="faculty-text-link"
                                        onClick={() => setActivePage("archive")}
                                    >
                                        View archive{" "}
                                        <PortalIcon name="chevron-right" />
                                    </button>
                                </div>

                                {/* !!! TODO: Load actual saved reports and connect each Download PDF button below. [SD] */}
                                <DashboardSearch label="Search recent reports" value={reportSearch} onChange={setReportSearch} />
                                <div className="faculty-recent-reports faculty-record-scroll" role="region" aria-label="Recent report records" tabIndex={0}>
                                    {!visibleReports.length && <p role="status" className="py-3 text-sm">No reports match your search.</p>}
                                    {visibleReports.map((report) => (
                                        <article
                                            key={report.id}
                                            className="faculty-recent-report"
                                        >
                                            <span className="faculty-empty-icon">
                                                <PortalIcon name="file-text" />
                                            </span>
                                            <div>
                                                <h3>
                                                    {report.title} ·{" "}
                                                    {report.course}
                                                </h3>
                                                <p className="faculty-muted">
                                                    Status:{" "}
                                                    <time
                                                        dateTime={report.date}
                                                    >
                                                        {report.archived}
                                                    </time>
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                disabled
                                                className="faculty-sample-download"
                                                aria-label={`Download ${report.title} PDF unavailable in design preview`}
                                            >
                                                <PortalIcon name="download" />{" "}
                                                Download PDF
                                            </button>
                                        </article>
                                    ))}
                                    <p className="faculty-muted faculty-download-note">
                                        Sample archive entries · PDF downloads
                                        are unavailable in this design preview.
                                    </p>
                                </div>
                            </section>
                        </div>
                        <aside
                            className="faculty-column"
                            aria-label="Deadlines and guidance"
                        >
                            <section className="faculty-card">
                                <h2>
                                    <PortalIcon name="calendar-days" /> Upcoming
                                    deadlines
                                </h2>
                                <div className="faculty-record-scroll" role="region" aria-label="Upcoming deadline records" tabIndex={0}>
                                {!visibleDeadlines.length && <p role="status" className="p-3 text-sm">No upcoming deadlines.</p>}
                                <ul className="faculty-deadlines">
                                    {visibleDeadlines.map((task) => (
                                        <li key={task.id}>
                                            <time dateTime={task.date}>
                                                {task.due}
                                            </time>
                                            <span>
                                                {task.title}
                                                <small>{task.course}</small>
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                                </div>
                            </section>
                            <section className="faculty-card">
                                <h2>
                                    <PortalIcon name="users" /> Peer reviews
                                </h2>
                                <div className="faculty-record-scroll px-3" role="region" aria-label="Peer reviews assigned to you" tabIndex={0}>
                                    {visibleReviews.map((review) => <article key={review.id} className="border-b border-[var(--faculty-border)] py-2 text-sm"><h3>{review.title}</h3><p>{review.course} · {review.status.replaceAll("_", " ")}</p></article>)}
                                    {!visibleReviews.length && <p role="status" className="py-3 text-sm">No peer reviews in this semester.</p>}
                                </div>
                                <div className="faculty-card-body">
                                    <p>
                                        {samplePeerReviews.length} reviews assigned to you
                                        this semester
                                    </p>
                                    <button
                                        type="button"
                                        className="faculty-text-link"
                                        onClick={() => setActivePage("reviews")}
                                    >
                                        Open peer reviews{" "}
                                        <PortalIcon name="chevron-right" />
                                    </button>
                                </div>
                            </section>
                            <section className="faculty-card">
                                <h2>
                                    <PortalIcon name="clipboard-list" />{" "}
                                    Reporting steps
                                </h2>
                                <ol className="faculty-steps">
                                    <li>Confirm your assessment</li>
                                    <li>Review results and evidence</li>
                                    <li>
                                        Generate the Final Instrument Report PDF
                                    </li>
                                </ol>
                            </section>
                        </aside>
                    </div>
                )}

                {/* Open the chosen Faculty page. Edit its form and saving code in that page's file. */}
                {activePage !== "dashboard" && (
                    <section className="faculty-detail-page">
                        <h2 className="faculty-page-title">{pageTitle}</h2>
                        {activePage === "assessments" && <MyAssessmentsPage />}
                        {activePage === "roster" && <FacultyRosterPage />}
                        {activePage === "reviews" && <FacultyPeerReviewsPage />}
                        {activePage === "archive" && <FacultyArchivePage />}
                    </section>
                )}
            </main>
            <footer className="faculty-footer">
                {branding.universityName} · {branding.portalName}
            </footer>
        </div>
    )
}
