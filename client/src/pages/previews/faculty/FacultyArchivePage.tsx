/**
 * FacultyArchivePage.tsx
 * Shows the layout for previously submitted reports. [SD]
 */

import { EmptyPanel } from "../../../components/FacultyPanels"

export function FacultyArchivePage() {
    // TODO: Load submitted report versions and link each row to a read-only report view. [SD]
    return (
        <EmptyPanel
            title="Report archive"
            columns={["Assessment / Course", "Semester", "Submitted version", "Action"]}
            message="No archived reports loaded."
        />
    )
}