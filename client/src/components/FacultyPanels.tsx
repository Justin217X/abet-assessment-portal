/**
 * FacultyPanels.tsx
 * Provides Faculty panels and a shared empty table layout for dashboards. [SD]
 */

import { useId } from "react"

type EmptyPanelProps = {
  title: string
  columns: string[]
  message: string
  showSearch?: boolean
  searchLabel?: string
}

// The assessment, peer review, and archive tables share this layout. [SD]
export function EmptyPanel({
  title,
  columns,
  message,
  showSearch,
  searchLabel = "Search assessments",
}: EmptyPanelProps) {
  // Give each panel a unique heading ID so its table can refer to it. [SD]
  const headingId = useId()

  return (
    <section
      aria-labelledby={headingId}
      className="min-w-0 rounded-lg border border-slate-200 bg-white p-4"
    >
      <h2 id={headingId} className="text-lg font-semibold">
        {title}
      </h2>

      {/* TODO: Enable search and filter the table rows once records are available. [SD] */}
      {showSearch && (
        <label className="mt-3 block text-sm font-medium">
          {searchLabel}
          <input
            type="search"
            disabled
            placeholder="No assessments loaded"
            className="mt-1 block rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
      )}

      {/* Let the table scroll sideways on narrow screens. [SD] */}
      <div className="mt-4 overflow-x-auto">
        <table aria-labelledby={headingId} className="w-full text-left text-sm">
          <thead className="bg-slate-100">
            <tr>
              {columns.map((column) => (
                <th key={column} scope="col" className="px-3 py-2">
                  {column}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* Show one message across all columns while the table is empty. [SD] */}
            <tr>
              <td colSpan={columns.length} className="px-3 py-4 text-slate-600">
                {message}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}

export function FacultyAssessmentsPanel() {
  return (
    <EmptyPanel
      title="My assessments"
      columns={["Assessment / Course", "PI", "Due date", "Report status", "Action"]}
      message="No assessment records loaded."
      showSearch
    />
  )
}

export function FacultyPeerReviewsPanel() {
  return (
    <EmptyPanel
      title="Peer reviews"
      columns={["Report / Version", "Course", "Review status", "Due date", "Action"]}
      message="No peer review records loaded."
    />
  )
}