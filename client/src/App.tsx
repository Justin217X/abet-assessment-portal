/**
 * App.tsx
 * Switches between sign-in previews and the four role demos. [SD]
 */

import { useState } from "react"
import { PennStateSignInPage } from "./pages/sign-in/PennStateSignInPage"
import { PortalSignInPage } from "./pages/sign-in/PortalSignInPage"
import { AdministratorDashboard } from "./dashboards/AdministratorDashboard"
import { CoordinatorDashboard } from "./dashboards/CoordinatorDashboard"
import { EvaluatorDashboard } from "./dashboards/EvaluatorDashboard"
import { FacultyDashboard } from "./dashboards/FacultyDashboard"
import { SignInPage } from "./pages/sign-in/SignInPage"

type Screen =
  | "sign-in"
  | "penn-state"
  | "portal"
  | "faculty"
  | "coordinator"
  | "evaluator"
  | "administrator"

function App() {
  // TODO: Use the signed-in user's assigned access to open a dashboard
  // and make Sign out end the active portal session. [SD]
  const [screen, setScreen] = useState<Screen>("sign-in")
  const backToSignIn = () => setScreen("sign-in")

  if (screen === "penn-state") {
    return <PennStateSignInPage onBack={backToSignIn} />
  }

  if (screen === "portal") {
    return <PortalSignInPage onBack={backToSignIn} />
  }

  if (screen === "faculty") {
    return <FacultyDashboard onBackToSignIn={backToSignIn} />
  }

  if (screen === "coordinator") {
    return (
      <CoordinatorDashboard
        onBackToSignIn={backToSignIn}
        onOpenFacultyWorkspace={() => setScreen("faculty")}
      />
    )
  }

  if (screen === "evaluator") {
    return <EvaluatorDashboard onBackToSignIn={backToSignIn} />
  }

  if (screen === "administrator") {
    return <AdministratorDashboard onBackToSignIn={backToSignIn} />
  }

  return (
    <SignInPage
      onOpenPennState={() => setScreen("penn-state")}
      onOpenPortal={() => setScreen("portal")}
      onOpenFacultyDemo={() => setScreen("faculty")}
      onOpenCoordinatorDemo={() => setScreen("coordinator")}
      onOpenEvaluatorDemo={() => setScreen("evaluator")}
      onOpenAdministratorDemo={() => setScreen("administrator")}
    />
  )
}

export default App