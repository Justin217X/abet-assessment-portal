/**
 * FacultyPeerReviewsPage.tsx
 * Shows assigned peer reviews and opens the review details preview. [SD]
 */

import { useState } from "react"
import { Button } from "../../../Button"
import { FacultyPeerReviewsPanel } from "../../../components/FacultyPanels"
import { PeerReviewDetailsPage } from "./PeerReviewDetailsPage"

export function FacultyPeerReviewsPage() {
    const [showReviewDetails, setShowReviewDetails] = useState(false)
    
    if (showReviewDetails) {
        return (
            <div className="space-y-4">
                <Button variant="secondary" onClick={() => setShowReviewDetails(false)}>
                    Back to peer reviews
                </Button>
                <PeerReviewDetailsPage />
            </div>
        )
    }
    
    return (
        <div className="space-y-4">
            {/* TODO: Replace this preview button with Open review on each assigned row. [SD] */}
            <Button variant="secondary" onClick={() => setShowReviewDetails(true)}>
                Open peer review preview
            </Button>
            <FacultyPeerReviewsPanel />
        </div>
    )
}