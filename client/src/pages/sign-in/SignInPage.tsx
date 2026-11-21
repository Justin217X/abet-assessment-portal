/**
 * File: SignInPage.tsx
 * Purpose: Shows sign-in options and temporary dashboard demo buttons.
 *
 * !!! Neither sign-in option is connected yet.
 * !!! TODO:
 * - Penn State button: Start the approved SSO login through Django.
 * - Portal button: Open the local evaluator login form.
 * - App.tsx: Open a dashboard only after login and role checks.
 * - Update "Both options open UI previews" when real sign-in works.
 * - Remove the demo buttons and their callbacks from this file
 *   and App.tsx before production use.
 * [SD]
 * !!! Django must check permissions even after demo buttons are removed. [SD]
 */

import { Button } from "../../Button"
import { SignInCard } from "../../components/SignInCard"

type SignInPageProps = {
    onOpenPennState: () => void
    onOpenPortal: () => void

    // !!! Remove these four demo callbacks when real sign-in works. [SD]
    onOpenFacultyDemo: () => void
    onOpenCoordinatorDemo: () => void
    onOpenEvaluatorDemo: () => void
    onOpenAdministratorDemo: () => void
}

export function SignInPage({
    onOpenPennState,
    onOpenPortal,
    onOpenFacultyDemo,
    onOpenCoordinatorDemo,
    onOpenEvaluatorDemo,
    onOpenAdministratorDemo,
}: SignInPageProps) {
    return (
        <SignInCard title="Sign in">
            {/* !!! TODO: Connect these buttons to their sign-in flows and update the preview message. [SD] */}
            <div className="mx-auto mt-6 flex w-full max-w-xs flex-col gap-3">

                <Button onClick={onOpenPennState}>
                    Sign in with Penn State
                </Button>
                <span className="text-sm text-slate-500">or</span>

                <Button variant="secondary" onClick={onOpenPortal}>
                    Sign in to Portal
                </Button>

                <p className="text-sm text-slate-600">
                    Both options open UI previews.
                </p>
            </div>

            {/* !!! TODO: Remove this demo section once real sign-in opens the assigned dashboard.
            Remove the four demo callbacks from SignInPageProps, the parameter list,
            and the <SignInPage /> call in App.tsx. [SD]
            */}
            <div className="mt-6 flex flex-wrap justify-center gap-2 border-t border-slate-200 pt-6">

                <Button variant="secondary" onClick={onOpenFacultyDemo}>
                    Open Faculty Demo
                </Button>
                <Button variant="secondary" onClick={onOpenCoordinatorDemo}>
                    Open Coordinator Demo
                </Button>
                <Button variant="secondary" onClick={onOpenEvaluatorDemo}>
                    Open Evaluator Demo
                </Button>
                <Button variant="secondary" onClick={onOpenAdministratorDemo}>
                    Open Administrator Demo
                </Button>
            </div>
        </SignInCard>
    )
}
