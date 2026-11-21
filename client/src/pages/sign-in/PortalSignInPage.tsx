/**
 * File: PortalSignInPage.tsx
 * Purpose: Shows the local portal sign-in preview for evaluators.
 *
 * !!! The fields and Sign in button are disabled. No login request is sent.
 * !!! TODO:
 * - Django: Add local evaluator login, logout, and session handling.
 * - This file: Add a form that sends login details to Django.
 * - This file: Show loading and error messages.
 * - Enable the fields and Sign in button when the login flow works.
 * - App.tsx: Open the Evaluator dashboard after successful sign-in.
 * - Django: Check the evaluator's role and released-document access.
 * - Confirm whether local accounts use email or username before
 *   connecting the Email field. [SD]
 */

import { Button } from "../../Button"
import { SignInCard } from "../../components/SignInCard"

type PortalSignInPageProps = {
    onBack: () => void
}

export function PortalSignInPage({ onBack }: PortalSignInPageProps) {
    return (
        <SignInCard title="Sign in to Portal">
            <p className="mt-4 text-sm text-slate-600">
                Form preview · Sign-in is not connected yet.
            </p>

            {/* !!! Keep these fields disabled until local evaluator login is connected.[SD] */}
            <fieldset disabled className="mx-auto mt-6 max-w-xs space-y-4 text-left">
                <legend className="sr-only">Portal account</legend>

                <label className="block text-sm font-medium">
                    Email

                    <input
                        type="email"
                        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2"
                    />
                </label>

                <label className="block text-sm font-medium">
                    Password

                    <input
                        type="password"
                        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2"
                    />
                </label>

                <Button className="w-full opacity-60">Sign in</Button>
            </fieldset>

                <Button variant="secondary" className="mt-6" onClick={onBack}>
                    Back to sign-in
                </Button>
        </SignInCard>
    )
}
