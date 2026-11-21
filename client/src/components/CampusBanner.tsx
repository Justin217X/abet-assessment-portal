/**
 * File: CampusBanner.tsx
 * Purpose: Displays the shared university photo, university name,
 * page title, and subtitle.
 *
 * Update branding.ts to change the university name, image, or crop.
 */

import { branding } from "../config/branding"
import "./CampusBanner.css"

type CampusBannerProps = { title: string; subtitle: string; compact?: boolean }

export function CampusBanner({ title, subtitle, compact = true }: CampusBannerProps) {
    return (
        <section className={`campus-banner ${compact ? "!min-h-[100px] [&_.campus-banner-content]:!py-3 [&_h1]:!text-[clamp(22px,2vw,28px)]" : ""}`} aria-label={title}>

            {/* Change the university photo and crop in branding.ts. */}
            <img src={branding.campusBanner.imageUrl} alt=""
                style={{ objectPosition: branding.campusBanner.imagePosition }} />

            <div className="campus-banner-content">
                <p>{branding.universityName}</p>
                <h1>{title}</h1>
                <p>{subtitle}</p>
            </div>
        </section>
    )
}
