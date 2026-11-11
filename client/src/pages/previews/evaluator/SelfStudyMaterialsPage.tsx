/**
 * SelfStudyMaterialsPage.tsx
 * Lists Self-Study materials available for evaluator review. [SD]
 */

import { EmptyPanel } from "../../../components/FacultyPanels"

export function SelfStudyMaterialsPage() {
    return (
        <>
        {/* TODO: Load materials released to this evaluator and link each row
          to its read-only document view. [SD] */}
          <EmptyPanel
            title="Available Self-Study materials"
            columns={["Material", "Program", "Action"]}
            message="No Self-Study materials loaded."
          />
        </>
    )
}