# LMS Platform — Feature Status

## Admin

### Completed

Admin can login (accounts are provisioned, no self-signup)
Admin dashboard shows platform-wide analytics including total users, active courses, enrollments, and revenue
Admin can view and manage all users — activate, deactivate, or delete any account
Admin can manage all instructors, view their courses, and see which students are enrolled under each instructor
Admin can moderate courses — approve, reject, archive, or republish any course submitted by instructors
Admin can manage course categories used to organize the catalog
Admin can create and publish platform-wide announcements visible to all users
Admin can manage certificates — issue certificates manually or revoke existing ones
Admin can view all payment transactions and process refunds (live data from backend)
Admin can view a full audit log of all system activity
Admin can configure platform-wide settings

### Pending

Admin workshop moderation is missing — workshops have no approve/reject/archive flow on the backend
Admin study groups page exists but has no backend — group data is not persisted
Admin discussions moderation page exists in the UI but is not wired to the backend

---

## Instructor

### Completed

Instructor can signup
Instructor can login
Instructor can create a course and edit it at any time
While creating a course the instructor can set both Arabic and English titles and descriptions
Course has sections and sections have lessons
Lessons support video, reading material, PDF documents, and quizzes
Documents (PDFs) can be uploaded and students can view them inside the lesson player
Instructor can create quizzes linked to a specific lesson or to the course as a whole
Quizzes support a mandatory flag so students must pass before moving forward
Quizzes support randomization of questions so each attempt presents a different order
Quizzes support configuring a time limit, passing score, and maximum number of attempts allowed
Instructor can add, edit, and delete questions and answer options in any quiz
Instructor can create assignments with a deadline and view all student submissions
Instructor can grade student assignment submissions
Instructor submits a course for admin review and approval before it goes live
Instructor can view all students enrolled in their courses along with individual progress
Instructor can participate in course discussion forums, pin important threads, and mark threads as solved
Dashboard shows course-level analytics and student engagement statistics

### Pending

Instructor cannot create or manage workshops — workshop creation has no backend support
The number of questions displayed per quiz attempt is configurable in the UI but is not saved to or enforced by the backend
Instructor revenue page exists in the UI but revenue breakdown and payout data are not connected to the backend

---

## Student

### Completed

Student can signup
Student can login
Student can browse and search the course catalog by keyword, category, and level
Student can enroll in a course
Student can take lessons — watch videos, read content, and view PDF documents inside the lesson player
Student marks lessons as complete to track progress
Student can take quizzes attached to lessons and receives an auto-graded score instantly
Student can view all their past quiz attempts and best scores
Student can submit assignments before the deadline
Student can earn a certificate automatically upon completing all required lessons and passing mandatory quizzes
Student can view and download their earned certificates, and share a public verification link
Student can participate in course discussion forums — create threads and reply to others
Student can write and save personal notes on any lesson
Student can leave a rating and written review on any completed course
Student dashboard shows overall learning progress, active courses, and completion statistics

### Pending

Student workshop registration and browsing exists in the UI but workshop data is client-side only and not persisted in the backend
Study groups are entirely client-side — joining, creating, and messaging has no backend and resets on page reload
Student schedule page exists but is not connected to any backend events or deadlines
