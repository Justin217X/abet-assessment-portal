/**
 * File: SampleReportLibrary.tsx
 * Purpose: Searches, previews, and downloads locally supplied historical PDFs.
 * !!! These originals are separate from AI-generated mock report records. [SD]
 */
import { useEffect, useState } from "react"
import type { PortalData } from "../api/portalData"

type Sample = PortalData["sample_reports"][number]

export function SampleReportLibrary() {
    const [reports, setReports] = useState<Sample[] | null>(null)
    const [error, setError] = useState("")
    const [search, setSearch] = useState("")
    const [selection, setSelection] = useState("")
    useEffect(() => {
        const controller = new AbortController()
        async function load() {
            const response = await fetch("/api/demo/sample-reports/", { signal: controller.signal })
            if (!response.ok) throw new Error("Could not load historical samples. Check that Django is running in development mode.")
            const data = await response.json()
            if (!Array.isArray(data.sample_reports)) throw new Error("The sample catalog returned an invalid response.")
            setReports(data.sample_reports)
        }
        load().catch((reason: unknown) => {
            if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Could not load historical samples.")
        })
        return () => controller.abort()
    }, [])
    if (error) return <p role="alert">{error}</p>
    if (!reports) return <p role="status">Loading supplied PDF samples...</p>
    const visible = reports.filter((row) => [row.course_code, row.pi_code, row.filename].join(" ").toLowerCase().includes(search.trim().toLowerCase()))
    const selected = visible.find((row) => row.id === selection && row.file_available) ?? visible.find((row) => row.file_available)
    return <div className="space-y-3">
        <p className="rounded-md bg-blue-50 p-3 text-sm">Supplied historical PDF examples. These are original files, not AI-generated reports for the fictional assessments. Campus locations have not been verified.</p>
        <label className="grid max-w-lg gap-1 text-sm font-medium">Search PDF samples
            <input type="search" placeholder="Course, PI or filename" value={search} onChange={(event) => setSearch(event.target.value)} className="rounded-md border border-slate-300 bg-white px-3 py-2" />
        </label>
        <p role="status" className="text-xs">{visible.length} of {reports.length} supplied PDFs</p>
        <div className="grid min-w-0 items-start gap-3 lg:grid-cols-[19rem_minmax(0,1fr)]">
            <div role="region" aria-label="Provided PDF samples" tabIndex={0} className="max-h-[60dvh] overflow-y-auto pr-2">
                <ul className="space-y-2">{visible.map((row) => <li key={row.id} className={"rounded-lg border p-3 " + (selected?.id === row.id ? "border-blue-700 bg-blue-50" : "border-slate-200 bg-white")}>
                    <h3 className="text-sm font-semibold">{row.course_code} · PI {row.pi_code}</h3>
                    <p className="text-xs">{row.semester} · {row.page_count} pages · {(row.size_bytes / 1024 / 1024).toFixed(1)} MB</p>
                    <p className="mt-1 break-all text-xs text-slate-600">{row.filename}</p>
                    <button type="button" disabled={!row.file_available} aria-pressed={selected?.id === row.id} onClick={() => setSelection(row.id)} className="mt-2 rounded border border-slate-300 bg-white px-3 py-1 text-sm disabled:opacity-50">{row.file_available ? "Preview PDF" : "File not available locally"}</button>
                </li>)}</ul>
                {!visible.length && <p className="p-3 text-sm">{reports.length ? "No PDF samples match your search." : "No historical samples are listed."}</p>}
            </div>
            <section aria-label="Historical PDF preview" className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
                {selected ? <>
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 p-3">
                        <h3 className="text-sm font-semibold">{selected.course_code} · PI {selected.pi_code}</h3>
                        <div className="flex gap-3 text-sm"><a href={selected.preview_url} target="_blank" rel="noreferrer" className="underline">Open PDF</a><a href={selected.download_url} className="underline">Download sample</a></div>
                    </div>
                    <iframe key={selected.id} title={"Historical PDF " + selected.filename} src={selected.preview_url} className="h-[60dvh] w-full border-0" />
                    <p className="p-2 text-xs text-slate-600">If the embedded viewer is unavailable, use Open PDF. Original file content is preserved.</p>
                </> : <p className="p-4 text-sm">No available PDF matches this search. Clear the search or add the supplied files to the local sample folder.</p>}
            </section>
        </div>
    </div>
}
