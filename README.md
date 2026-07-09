# LMS Platform — Feature Status

---

## Admin

### Completed

- [x] Admin can login (accounts are provisioned, no self-signup)
- [x] Admin dashboard shows platform-wide analytics including total users, active courses, enrollments, and revenue
- [x] Admin can view and manage all users — activate, deactivate, or delete any account
- [x] Admin can manage all instructors, view their courses, and see which students are enrolled under each instructor
- [x] Admin can moderate courses — approve, reject, archive, or republish any course submitted by instructors
- [x] Admin can manage course categories used to organize the catalog
- [x] Admin can create and publish platform-wide announcements visible to all users
- [x] Admin can manage certificates — issue certificates manually or revoke existing ones
- [x] Admin can view all payment transactions and process refunds (live data from backend)
- [x] Admin can view an audit log of moderation actions — covers user status changes, user deletions, and course approve/reject/archive/publish
- [x] Admin can configure platform-wide settings

### Pending

- [ ] Admin workshop moderation is missing — workshops have no approve/reject/archive flow on the backend
- [ ] Admin study groups page exists but has no backend — group data is not persisted
- [ ] Admin discussions moderation page exists in the UI but is not wired to the backend

---

## Instructor

### Completed

- [x] Instructor can signup and login
- [x] Instructor can create a course and edit it at any time, with both Arabic and English titles and descriptions
- [x] Course has sections and lessons; lessons support video, reading material, PDF documents, and quizzes
- [x] Documents (PDFs) can be uploaded and students can view them inside the lesson player
- [x] Instructor can create quizzes linked to a specific lesson or to the course as a whole
- [x] Quizzes support a mandatory flag, randomized question order, time limit, passing score, and maximum attempts
- [x] Instructor can add, edit, and delete questions and answer options in any quiz
- [x] Instructor can create assignments with a deadline, view all student submissions, and grade them
- [x] Instructor submits a course for admin review and approval before it goes live
- [x] Instructor can view all students enrolled in their courses along with individual progress *(partial)*
- [x] Instructor can participate in course discussion forums, pin important threads, and mark threads as solved
- [x] Instructor can duplicate an existing course — creates a full copy including all sections and lessons as a draft
- [x] Dashboard shows course-level analytics and student engagement statistics

### Pending

- [ ] Instructor cannot create or manage workshops — workshop creation has no backend support
- [ ] The number of questions displayed per quiz attempt is configurable in the UI but is not saved to or enforced by the backend
- [ ] Instructor revenue page exists in the UI but revenue breakdown and payout data are not connected to the backend
- [ ] Promotions/coupons should be an admin-only feature — confirm with Sarmad whether to remove it from the instructor side
- [ ] Instructor should be able to reply to student queries per course — discussion reply feature needs review

---

## Student

### Completed

- [x] Student can signup and login
- [x] Student can browse and search the course catalog by keyword, category, and level
- [x] Student can enroll in a course
- [x] Student can take lessons — watch videos, read content, and view PDF documents inside the lesson player
- [x] Student marks lessons as complete to track progress
- [x] Student can take quizzes attached to lessons and receives an auto-graded score instantly
- [x] Student can view all their past quiz attempts and best scores *(partial)*
- [x] Student can submit assignments before the deadline *(partial)*
- [x] Student can earn a certificate automatically upon completing all required lessons and passing mandatory quizzes
- [x] Student can view and download their earned certificates, and share a public verification link
- [x] Student can participate in course discussion forums — create threads and reply to others
- [x] Student can write and save personal notes on any lesson
- [x] Student can leave a rating and written review on any completed course
- [x] Student dashboard shows overall learning progress, active courses, and completion statistics

### Pending

- [ ] Student workshop registration and browsing exists in the UI but workshop data is client-side only and not persisted in the backend
- [ ] Study groups are entirely client-side — joining, creating, and messaging has no backend and resets on page reload
- [ ] Student schedule page exists but is not connected to any backend events or deadlines
- [ ] Course content screen shows dummy data for assignments and quizzes at the course level — needs to be made dynamic using existing APIs

---

## Open Questions

> **Study groups** — do we need them?

> **Trainings and live classes** — do we need them?

> **Audit log scope** — currently covers admin moderation actions only (user changes, course moderation). Decide if full platform-wide logging (logins, enrollments, payments, instructor actions) is required.

> **Platform settings** — data is being saved but where should it be surfaced in the UI? Needs a decision.

> **Featured courses** — if a course is marked as featured, where should it appear and what is the sorting/display logic?

> **i18n** — correct Arabic translations are missing for most static UI text.

> **Mandatory quizzes** — if a quiz is mandatory, should students be blocked from advancing to the next lesson/section without passing, and should the "Mark as Complete" button be disabled? Confirm with Sarmad.
