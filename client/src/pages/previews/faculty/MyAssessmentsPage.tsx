/**
 * MyAssessmentsPage.tsx
 * Shows assigned assessments and opens their preview pages. [SD]
 */

import { useState } from "react"
import { Button } from "../../../Button"
import { FacultyAssessmentsPanel } from "../../../components/FacultyPanels"
import { AssessmentDetailsPage } from "./AssessmentDetailsPage"
import { ReportPreparationPage } from "./ReportPreparationPage"

type AssessmentPage = "list" | "details" | "preparation"

export function MyAssessmentsPage() {
    const [page, setPage] = useState<AssessmentPage>("list")
    
    if (page !== "list") {
        return (
            <div className="space-y-4">
                <Button variant="secondary" onClick={() => setPage("list")}>
                    Back to my assessments
                </Button>
                
                {page === "details" ? <AssessmentDetailsPage /> : <ReportPreparationPage />}
            </div>
        )
    }
    
    return (
        <div className="space-y-4">
            {/* TODO: Replace these preview buttons with actions on loaded assessment rows. [SD] */}
            <div className="flex flex-wrap gap-2">
                
                <Button variant="secondary" onClick={() => setPage("details")}>
                    Open assessment details preview
                </Button>
        
                <Button variant="secondary" onClick={() => setPage("preparation")}>
                    Open report preparation preview
                </Button>
            </div>

            <FacultyAssessmentsPanel />
        </div>
    )
}