/**
 * File: SelfStudyMaterialsPage.tsx
 * Purpose: Lists Self-Study materials available for evaluator review.
 *
 * !!! Self-Study integration is outside the current scope, per Professor Martin. [SD]
 *
 * !!! TODO:
 * - Keep this preview out of EvaluatorDashboard.tsx navigation.
 * - Check remaining imports before removing this unused preview.
 * - Do not connect Self-Study uploads or viewing unless the scope changes.
 * [SD]
 */

import { EmptyPanel } from "../../../components/FacultyPanels"

export function SelfStudyMaterialsPage() {
    return (
        <>
        {/* !!! Outside current scope. Check imports before removing this older preview. [SD] */}
          <EmptyPanel
            title="Available Self-Study materials"
            columns={["Material", "Program", "Action"]}
            message="No Self-Study materials loaded."
          />
        </>
    )
}
