/**
 * File: EvaluatorReportArchive.tsx
 * Purpose: Displays historical PDF examples released to the demo evaluator
 * and provides a separate view of fictional report records.
 *
 * !!! Live authentication, production permissions, and automatic archiving are not connected yet. [SD]
 *
 * !!! TODO: Use actual released archive records and signed-in  evaluator access. [SD]
 */

import { useEffect, useState } from "react"
import type { PortalData } from "../api/portalData"
import { SampleReportLibrary } from "./SampleReportLibrary"
import { PendingEvaluatorAction } from "./PendingEvaluatorAction"
import { RoleDataPage } from "./RoleDataPage"

export function EvaluatorReportArchive() {

    // Remember the PDF list, any error, and the selected view.
    const [reports, setReports] = useState<PortalData["sample_reports"] | null>(null)
    const [campuses, setCampuses] = useState<NonNullable<PortalData["campuses"]>>([])
    const [error, setError] = useState("")
    const [view, setView] = useState<"pdfs" | "records">("pdfs")

    // Load the PDF list available to the demo evaluator from Django.
    // !!! TODO: Use the signed-in evaluator and check file access on the server. [SD]
    useEffect(() => {
        const controller = new AbortController()
        fetch("/api/demo/evaluator/sample-reports/", { signal: controller.signal }).then(async (response) => {

            // Show an error if the request fails.
            if (!response.ok) throw new Error("Could not load the Evaluator demo PDF archive. Check Django.")
            const data = await response.json()

            // Check that the response contains a list.
            // !!! TODO: Also check the required information in each report. [SD]
            if (!Array.isArray(data.sample_reports)) throw new Error("The PDF archive returned an invalid response.")
            setReports(data.sample_reports)
            setCampuses(Array.isArray(data.campuses) ? data.campuses : [])
        }).catch((reason: unknown) => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Could not load PDF archives.") })

        // Cancel the request when the user leaves this page.
        return () => controller.abort()
    }, [])
    return <div className="space-y-3">
        <section className="rounded-lg border border-slate-200 bg-white p-3">
            <h2 className="font-semibold">Assessment reports &amp; supporting evidence</h2>
            <p className="mt-1 text-sm">Find reports by course, semester, or PI. Historical PDFs are supplied examples; released mock records are a separate demonstration.</p>
            <p className="mt-2 text-xs text-slate-600">Evidence to review: assignment instructions · rubric · PI results · faculty explanation · graded student samples and comments.</p>

            {/* !!! TODO: Show saved final reports and evidence after the Coordinator releases them. [SD] */}
            <p className="mt-1 text-xs text-slate-600">Automatic archiving and links to newly generated reports and evidence are pending.</p>
            <div className="mt-3 flex flex-wrap gap-2"><PendingEvaluatorAction label="View linked assessment evidence" /></div>
        </section>

        {/* Switch between supplied historical PDFs and fictional report records. */}
        <div className="flex flex-wrap gap-2">{(["pdfs", "records"] as const).map((item) => <button type="button" key={item} aria-pressed={view === item} onClick={() => setView(item)} className={`rounded-md border px-3 py-2 text-sm ${view === item ? "border-blue-800 bg-blue-800 text-white" : "border-slate-300 bg-white"}`}>{item === "pdfs" ? "Archived PDF examples" : "Released mock records"}</button>)}</div>

        {/* Display the selected view, a loading message, or an error. */}
        {view === "records" ? <RoleDataPage role="ABET Evaluator" view="reports" /> : error ? <p role="alert">{error}</p> : reports ? <SampleReportLibrary reports={reports} campuses={campuses} evaluator /> : <p role="status">Loading released PDF examples...</p>}
    </div>
}
