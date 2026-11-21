/**
 * File: facultyDashboardData.ts
 * Purpose: Prepares courses, tasks, reports, and reviews for the Faculty dashboard.
 *
 * Demo input files are in server/demo_data. This file only prepares display records.
 *
 * !!! TODO: Use the signed-in user's ID and initials instead of the fixed demo profile. [SD]
 * !!! Django must check which records the user can access. [SD]
 */

import type { PortalData } from "../api/portalData"

// Prepare course cards, tasks, reports, and reviews from the records returned by Django.

// !!! TODO: Replace the fixed demo profile below with the signed-in user's ID and initials. [SD]
// !!! These filters control display only. Django must check which records the user can access. [SD]
export function buildFacultyDashboardData(data: PortalData | null, semesterId: string) {
    const faculty = data?.users.find((user) => user.id === "faculty-1")
    const initials = faculty?.name.split(" ").filter(Boolean).map((part) => part[0]).slice(0, 2).join("") ?? ""
    const shortDate = (date: string) => new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`))
    const courses = data?.courses.filter((course) => (course.faculty_id === "faculty-1" || data?.assessments.some((row) => row.course_id === course.id && row.faculty_id === "faculty-1")) && course.semester_id === semesterId) ?? []
    const rows = data?.assessments.filter((assessment) => assessment.faculty_id === "faculty-1" && courses.some((course) => course.id === assessment.course_id)) ?? []
    const title = (row: typeof rows[number]) => row.task_title ?? data?.assignment_versions.find((version) => version.id === row.assignment_version_id)?.payload.name ?? "Untitled assessment"
    const courseCode = (id: string) => courses.find((course) => course.id === id)?.course_code ?? ""
    const complete = (status: string) => ["submitted", "archived"].includes(status)
    const sampleAssessments = rows.map((row) => ({ id: row.id, title: title(row), course: courseCode(row.course_id), status: row.status, complete: complete(row.status) }))
    const sampleCourses = courses.map((course) => {
        const assessments = rows.filter((row) => row.course_id === course.id)
        const finished = assessments.length > 0 && assessments.every((row) => complete(row.status))
        return { code: course.course_code, title: course.name, status: finished ? "Complete" : "In progress", icon: finished ? "circle-check" : "clock" }
    })
    const sampleTasks = rows.filter((row) => !complete(row.status)).map((row) => ({
        id: row.id, title: title(row), course: `${courseCode(row.course_id)} · PI ${data?.indicators.find((indicator) => indicator.id === row.indicator_id)?.code ?? "Unmapped"}`,
        status: row.status.replaceAll("_", " "), ready: row.status === "ready_for_review",
        description: row.status === "ready_for_review" ? "Review results and evidence before generating the final PDF." : "Confirm the group, explanation, and student evidence.",
        due: shortDate(row.due_on), date: row.due_on,
    })).sort((a, b) => a.date.localeCompare(b.date))
    const sampleReports = (data?.reports ?? []).filter((report) => rows.some((row) => row.id === report.assessment_id)).map((report) => {
        const row = rows.find((assessment) => assessment.id === report.assessment_id)!
        return { id: report.id, title: title(row), course: courseCode(row.course_id), date: report.generated_at.slice(0, 10), archived: `${report.status.replaceAll("_", " ")} · ${shortDate(report.generated_at.slice(0, 10))}` }
    })
    const samplePeerReviews = (data?.peer_reviews ?? []).filter((review) => review.reviewer_id === "faculty-1" && data?.assessments.some((task) => task.id === review.assessment_id && task.semester_id === semesterId)).map((review) => {
        const row = data!.assessments.find((assessment) => assessment.id === review.assessment_id)!
        const reportCourse = data!.courses.find((course) => course.id === row.course_id)
        return { id: review.id, title: title(row), course: reportCourse?.course_code ?? "", status: review.status }
    })
    return { sampleCourses, sampleTasks, sampleAssessments, sampleReports, samplePeerReviews,
        sampleFaculty: { name: faculty?.name ?? "Loading profile", initials, semester: data?.semesters.find((semester) => semester.id === semesterId)?.label ?? "" },
    }
}
