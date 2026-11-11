/**
 * ImprovementActionsPage.tsx
 * Shows improvement actions, supporting findings, and follow-up results. [SD]
 */

import { EmptyPanel } from "../../../components/FacultyPanels"

export function ImprovementActionsPage() {
    return (
        <>
        {/* TODO: Load authorized actions and distinguish missing follow-up results
          from results that have no recorded conclusion. [SD] */}
          <EmptyPanel
            title="Recorded improvement actions"
            columns={[
                "Program",
                "Planned improvement",
                "Supporting findings",
                "Later assessment results",
                "Recorded conclusion",
            ]}
            message="No improvement actions loaded."
            />
        </>
    )
}