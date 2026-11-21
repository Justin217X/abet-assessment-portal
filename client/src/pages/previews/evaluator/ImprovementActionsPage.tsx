/**
 * File: ImprovementActionsPage.tsx
 * Purpose: Shows improvement actions, supporting findings, and follow-up results.
 *
 * !!! Earlier preview only. Current improvement records use RoleDataPage.tsx. [SD]
 *
 * !!! TODO:
 * - Load released findings, improvement decisions, actions, and follow-up results from Django.
 * - Replace EmptyPanel with the loaded records and saved Actions Report links.
 * - Show missing follow-up results clearly; do not treat them as proof of improvement.
 * - Django: Return only records released to the signed-in evaluator.
 * [SD]
 */

import { EmptyPanel } from "../../../components/FacultyPanels"

export function ImprovementActionsPage() {
    return (
        <>
        {/* !!! TODO: Load authorized actions and distinguish missing follow-up results
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
