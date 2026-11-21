/**
 * File: PortalIcon.tsx
 * Purpose: Displays shared icons using the surrounding text color.
 */

import "./PortalIcon.css"

type PortalIconProps = {
    name: string
    className?: string
}

// Icons accompany visible labels, so screen readers can skip the decoration.
export function PortalIcon({ name, className = "" }: PortalIconProps) {
    return (
        <span
            aria-hidden="true"
            className={`portal-icon ${className}`}
            style={{ maskImage: `url("/icons/${name}.svg")` }}
        />
    )
}
