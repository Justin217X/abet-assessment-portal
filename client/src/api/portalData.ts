/**
 * File: portalData.ts
 * Purpose: Defines portal data fields and sends requests to Django.
 *
 * !!! TODO: Replace demo URL's and demo-only reponse checks with authenticated live APIs. [SD]
 */

export type ActivityEvent = { id: string; occurred_at: string; actor: string; title: string; description: string; roles: ("faculty" | "coordinator" | "admin")[]; kind: string; source: "shared_mock" | "browser_demo" | "saved_demo"; entity_id?: string }

// Shared field names keep all dashboard pages using the same data format.
export type PortalData = {
    campuses?: { id: string; name: string }[]
    activity: ActivityEvent[]
    sample_reports: { campus_id?: string | null; id: string; filename: string; course_code: string; semester: string; pi_code: string; title: string; page_count: number; size_bytes: number; source_kind: string; generated_by_ai: boolean; file_available: boolean; preview_url: string; download_url: string }[]
    metadata: { fictional: boolean; dataset_id: string; as_of: string; current_date?: string }
    users: { id: string; name: string; email: string; roles: string[] }[]
    courses: {
        id: string
        name: string
        course_code: string
        campus_id?: string
        semester_id: string
        faculty_id: string
    }[]
    schedules: { id: string; semester_id: string; program_id: string; title: string; due_on: string; owner_id: string }[]
    outcomes: { id: string; program_id: string; code: string; description: string }[]
    improvement_actions: { id: string; owner_id: string; report_id: string; status: string; description: string; review_on: string }[]
    self_study_materials: { id: string; title: string; report_ids: string[]; status: string; file_available: boolean }[]
    access_grants: { id: string; user_id: string; report_ids: string[]; expires_on: string }[]
    application_errors: { id: string; occurred_at: string; kind: string; status: string; message: string; import_id: string }[]
    imports: { id: string; requested_by: string; source: string; status: string; finished_at: string }[]
    settings: Record<string, string>
    semesters: { id: string; label: string; starts_on: string; ends_on: string }[]
    students: { id: string; display_label: string; program_id: string }[]
    enrollments: {
        id: string
        course_id: string
        section_id: string
        student_id: string
        status: string
        match_status: string
    }[]
    sections: { id: string; course_id: string; section_code: string }[]
    assessments: {
        id: string
        task_title?: string
        course_id: string
        semester_id: string
        assignment_id: number
        assignment_version_id: string
        criterion_id: string
        indicator_id: string
        student_group_id: string
        faculty_id: string
        status: string
        due_on: string
        faculty_explanation: string
        evidence_ids: string[]
    }[]
    assignment_versions: {
        id: string
        assignment_id: number
        revision_number: number
        payload: {
            name: string
            description: string
            use_rubric_for_grading: boolean
            rubric: {
                id: string
                description: string
                long_description?: string
                points: number
                ratings: { id: string; description: string; points: number }[]
            }[]
        }
    }[]
    student_groups: {
        id: string
        course_id: string
        program_id: string
        student_ids: string[]
        confirmed: boolean
    }[]
    programs: { id: string; name: string }[]
    indicators: {
        id: string
        code: string
        description: string
        outcome_id: string
    }[]
    evidence: {
        id: string
        assessment_id: string
        student_id: string
        band: string
        criterion_score: number | null
        criterion_max: number | null
        eligible: boolean
        suggested: boolean
        filename: string
        content: string
        instructor_feedback: string
        file_available: boolean
    }[]
    peer_reviews: {
        id: string
        assessment_id: string
        report_id: string
        reviewer_id: string
        status: string
        feedback: string
        due_on: string
    }[]
    reports: {
        id: string
        assessment_id: string
        assignment_version_id: string
        status: string
        filename: string
        generated_at: string
        report_version: number
        file_available: boolean
    }[]
    statistics: Record<
        string,
        {
            total_students: number
            mean_score: number | null
            median_score: number | null
            distribution: {
                label: string
                student_count: number
                percentage: number
            }[]
        } | null
    >
}

export async function loadPortalData(signal: AbortSignal): Promise<PortalData> {
    const response = await fetch("/api/demo/portal/", { signal })
    if (!response.ok)
        throw new Error(
            "Could not load the shared demo records. Check that Django is running.",
        )
    const data: PortalData = await response.json()
    if (!data.metadata?.fictional || !Array.isArray(data.assessments)) {
        throw new Error(
            "The demo API did not return the expected fictional dataset.",
        )
    }
    return data
}
