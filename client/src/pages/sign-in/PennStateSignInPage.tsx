/**
 * PennStateSignInPage.tsx
 * Previews the handoff to Penn State sign-in. [SD]
 */

import { Button } from "../../Button"
import { SignInCard } from "../../components/SignInCard"

type PennStateSignInPageProps = {
    onBack: () => void
}

export function PennStateSignInPage({ onBack }: PennStateSignInPageProps) {
    return (
        <SignInCard title="Sign in with Penn State">
            {/* TODO: Once Penn State single sign-on is connected, make the main
            "Sign in with Penn State" button start that flow. Remove this preview
            page and its screen entry in App.tsx. [SD]
            */}
            
            <p className="mt-4 text-sm text-slate-600">
                In the finished portal, this option will take you to Penn State sign-in.
            </p>
            
            <Button variant="secondary" className="mt-6" onClick={onBack}>
                Back to sign-in
            </Button>
        </SignInCard>
    )
}