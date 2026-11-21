/**
 * File: PennStateSignInPage.tsx
 * Purpose: Shows a preview message for Penn State sign-in.
 *
 * !!! This page does not sign anyone in yet.
 * !!! TODO:
 * - Django: Add the approved Penn State SSO login and return flow.
 * - SignInPage.tsx: Make "Sign in with Penn State" start that login flow.
 * - App.tsx: Open the correct dashboard after sign-in.
 * - Remove this preview page, its import, and the "penn-state" screen
 *   from App.tsx when the real login flow works. [SD]
 */

import { Button } from "../../Button"
import { SignInCard } from "../../components/SignInCard"

type PennStateSignInPageProps = {
    onBack: () => void
}

export function PennStateSignInPage({ onBack }: PennStateSignInPageProps) {
    return (
        <SignInCard title="Sign in with Penn State">

            <p className="mt-4 text-sm text-slate-600">
                In the finished portal, this option will take you to Penn State sign-in.
            </p>

            <Button variant="secondary" className="mt-6" onClick={onBack}>
                Back to sign-in
            </Button>
        </SignInCard>
    )
}
