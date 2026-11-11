/**
 * PortalSignInPage.tsx
 * Shows the portal account sign-in form layout. [SD]
 */

import { Button } from "../../Button"
import { SignInCard } from "../../components/SignInCard"

type PortalSignInPageProps = {
    onBack: () => void
}

export function PortalSignInPage({ onBack }: PortalSignInPageProps) {
    return (
        <SignInCard title="Sign in to Portal">
            {/* TODO: Connect the approved portal sign-in flow and update this message.
            Use the email and password fields only if the approved flow requires them. [SD]
            */}
            
            <p className="mt-4 text-sm text-slate-600">
                Form preview · Sign-in is not connected yet.
            </p>
            
            {/* Keep the credential fields disabled during the UI preview. [SD] */}
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