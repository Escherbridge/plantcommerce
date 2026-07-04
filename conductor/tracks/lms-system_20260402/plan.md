# Implementation Plan: Learning Management System (LMS)

**Track ID:** `lms-system_20260402`
**Estimated Duration:** 10-14 weeks
**Dependencies:** Tracks 1 (transaction-core), 2 (auth-accounts), 6 (content-seo) should be complete or substantially complete.

## Overview

The LMS is built across 9 phases, each delivering a functional vertical slice. Phases 1-4 establish the backend foundation (schema, APIs, content engine, assessments). Phases 5-6 add tracking and rewards. Phases 7-8 build the learner and admin UIs. Phase 9 integrates with existing platform systems.

Each phase ends with a verification checkpoint. All tasks follow the TDD cycle: write failing test, implement to pass, refactor.

---

## Phase 1: Database Schema and Core Models

**Goal:** Define all LMS database tables, relations, and migrations. Extend the user role enum.

### Task 1.1: Extend User Role Enum
- [ ] Write test: verify that user table accepts 'instructor' role value; verify existing roles still work
- [ ] Implement: add 'instructor' to the role enum in `user` table schema (`schema.ts`); generate and run migration
- [ ] Verify: tests pass, existing user queries unaffected, migration applies cleanly

### Task 1.2: Course and Program Tables
- [ ] Write test: insert/select operations on `lms_program` and `lms_course` tables; verify all fields, defaults, and constraints
- [ ] Implement: define `lmsProgram` and `lmsCourse` tables in schema with fields: id, title, slug (unique), description, courseType enum (self_paced, instructor_led, blended, cohort), instructorId (FK to user), thumbnailFileId (FK to file), difficulty enum (beginner, intermediate, advanced), language, durationEstimate, price, pricingType enum (free, one_time), enrollmentType enum (open, approval, invite, capacity), maxEnrollment, passingScore, status enum (draft, published, archived), version, programId (FK), sortOrder, prerequisites config, meta fields, timestamps
- [ ] Verify: tests pass, migration applies, indexes on slug/status/instructorId

### Task 1.3: Module, Lesson, and Content Block Tables
- [ ] Write test: CRUD operations on `lms_module`, `lms_lesson`, `lms_content_block`; verify parent-child relationships and sort ordering
- [ ] Implement: define three tables with hierarchical FKs (course->module->lesson->content_block). Content block has: type enum (video, text, slides, download, audio, embed, code, image), config (JSON text), fileId (FK to file), isRequired boolean, completionThreshold, timestamps
- [ ] Verify: tests pass, cascading deletes work correctly, sort order maintained

### Task 1.4: Quiz and Question Tables
- [ ] Write test: insert quiz with questions and options; verify question type enum, option structure, question bank queries
- [ ] Implement: define `lms_quiz` (linked to lesson or module, config: timeLimit, passingScore, maxAttempts, randomize, questionCount), `lms_question_bank` (courseId grouping), `lms_question` (type enum, prompt, config JSON, bankId, points), `lms_question_option` (questionId, label, isCorrect, sortOrder)
- [ ] Verify: tests pass, question bank queries filter correctly by course

### Task 1.5: Enrollment and Progress Tables
- [ ] Write test: enrollment creation, status transitions, progress tracking inserts and queries
- [ ] Implement: define `lms_enrollment` (userId, courseId, status enum [active, completed, suspended, expired], enrolledAt, completedAt, expiresAt, stripePaymentId), `lms_progress` (enrollmentId, contentBlockId, lessonId, moduleId, status enum [not_started, in_progress, completed], progressPercent, metadata JSON, timestamps). Add composite indexes on (userId, courseId) for enrollment, (enrollmentId, contentBlockId) for progress.
- [ ] Verify: tests pass, unique constraint on enrollment per user per course

### Task 1.6: Certificate and Badge Tables
- [ ] Write test: certificate template CRUD, certificate issuance with unique ID, badge definition and award
- [ ] Implement: define `lms_certificate_template` (name, htmlTemplate, cssStyles, isDefault, courseId), `lms_certificate` (enrollmentId, templateId, certificateUid unique text, issuedAt, metadata JSON), `lms_badge` (name, description, iconFileId, triggerType, triggerConfig JSON), `lms_learner_badge` (userId, badgeId, earnedAt)
- [ ] Verify: tests pass, certificate UID uniqueness enforced

### Task 1.7: Discussion, Review, and Supporting Tables
- [ ] Write test: discussion thread/reply CRUD, review creation with rating validation, course-category and course-tag operations
- [ ] Implement: define `lms_discussion_thread` (lessonId nullable, courseId, userId, title, body, isPinned, isLocked, timestamps), `lms_discussion_reply` (threadId, userId, parentReplyId nullable, body, timestamps), `lms_course_review` (courseId, userId, rating 1-5, reviewText, status enum [pending, approved, rejected], timestamps), `lms_course_category` (name, slug, description, sortOrder), `lms_course_tag` (name, slug), `lms_course_to_tag` (courseId, tagId), `lms_course_product` (courseId, productCategoryId), `lms_course_prerequisite` (courseId, prerequisiteCourseId), `lms_bookmark` (userId, lessonId, timestamps), `lms_note` (userId, lessonId, content, timestamps)
- [ ] Verify: tests pass, all foreign keys valid, migrations apply cleanly

### Task 1.8: Drizzle Relations
- [ ] Write test: verify relation-based queries work (course with modules, module with lessons, enrollment with progress, etc.)
- [ ] Implement: define all Drizzle `relations()` for the new tables, add relations to existing tables (user -> enrollments, user -> instructorCourses, file -> content blocks)
- [ ] Verify: tests pass, no circular dependency issues, relation queries return expected nested data

### Task 1.9: Phase 1 Verification
- [ ] Run full migration on clean database
- [ ] Verify all tables created with correct columns and indexes
- [ ] Verify existing tables unaffected
- [ ] Run `npm run check` - no TypeScript errors
- [ ] [checkpoint marker]

---

## Phase 2: Course Management API

**Goal:** tRPC routers for course CRUD, curriculum management, and enrollment. Service layer with business logic.

### Task 2.1: LMS Course Service - Core CRUD
- [ ] Write test: create course with valid data, reject invalid data (missing title, invalid type), list courses with pagination and filters, get by slug, update, soft-delete
- [ ] Implement: `src/lib/server/services/lms/course.ts` with functions: createCourse, updateCourse, deleteCourse, getCourseBySlug, listCourses (with filter/sort/pagination), cloneCourse
- [ ] Verify: tests pass, service handles edge cases (duplicate slug, nonexistent instructor)

### Task 2.2: LMS Course tRPC Router
- [ ] Write test: tRPC procedure tests with mocked context for each endpoint; verify auth middleware (admin/instructor only for mutations, public for reads)
- [ ] Implement: `src/lib/server/api/lms/course.ts` router with procedures: list, getBySlug, create (admin/instructor), update, delete (admin), clone (admin), publish
- [ ] Verify: tests pass, unauthorized access rejected, Zod validation on all inputs

### Task 2.3: Curriculum Service - Modules and Lessons
- [ ] Write test: create/update/delete/reorder modules within a course; create/update/delete/reorder lessons within a module; bulk reorder operations
- [ ] Implement: `src/lib/server/services/lms/curriculum.ts` with functions for module and lesson CRUD, reorder logic (swap sort orders), move lesson between modules
- [ ] Verify: tests pass, sort order maintained after operations, cascade deletes work

### Task 2.4: Curriculum tRPC Router
- [ ] Write test: tRPC procedure tests for module/lesson/content block CRUD; verify instructor can only modify their assigned courses
- [ ] Implement: `src/lib/server/api/lms/curriculum.ts` router with all curriculum manipulation procedures; instructor scoping middleware
- [ ] Verify: tests pass, instructor scope enforced, reorder returns updated order

### Task 2.5: Content Block Service
- [ ] Write test: create content blocks of each type with type-specific config validation; verify file references for media types; update and delete with cleanup
- [ ] Implement: `src/lib/server/services/lms/contentBlock.ts` with type-discriminated validation (Zod discriminated unions), file association logic, sort order management
- [ ] Verify: tests pass, invalid config rejected per type, file references validated

### Task 2.6: Enrollment Service
- [ ] Write test: enroll in free course, reject double-enrollment, enrollment capacity enforcement, approval workflow (request -> approve/reject), bulk enrollment, enrollment expiry
- [ ] Implement: `src/lib/server/services/lms/enrollment.ts` with functions: enroll, requestEnrollment, approveEnrollment, rejectEnrollment, bulkEnroll, checkCapacity, suspendEnrollment, expireEnrollments (cron-ready)
- [ ] Verify: tests pass, capacity limits enforced, status transitions valid

### Task 2.7: Enrollment tRPC Router
- [ ] Write test: tRPC procedures for enrollment operations; verify learner can only enroll themselves, admin can bulk enroll
- [ ] Implement: `src/lib/server/api/lms/enrollment.ts` router; integrate with Stripe for paid course checkout initiation
- [ ] Verify: tests pass, auth enforced, Stripe checkout URL returned for paid courses

### Task 2.8: LMS Root Router Integration
- [ ] Write test: verify LMS routers are accessible from the root tRPC router under `lms.*` namespace
- [ ] Implement: create `src/lib/server/api/lms/index.ts` merging all LMS sub-routers; register in root router (`src/lib/server/api/root.ts`)
- [ ] Verify: tests pass, all LMS endpoints accessible, no conflicts with existing routers

### Task 2.9: Phase 2 Verification
- [ ] Run full test suite - all pass
- [ ] Verify course CRUD end-to-end via tRPC client
- [ ] Verify enrollment flow end-to-end
- [ ] `npm run check` passes
- [ ] [checkpoint marker]

---

## Phase 3: Content Delivery System

**Goal:** Multimodal content rendering, S3 media upload/streaming, and content block type implementations.

### Task 3.1: Video Upload and Streaming Service
- [ ] Write test: generate signed upload URL for video, generate signed streaming URL with expiry, validate file type/size limits
- [ ] Implement: `src/lib/server/services/lms/media.ts` extending existing file service with: generateVideoUploadUrl, generateStreamingUrl (signed, 15-min expiry), validateMediaFile; support mp4, webm, mov up to 2GB
- [ ] Verify: tests pass, signed URLs have correct expiry, invalid file types rejected

### Task 3.2: Media Upload tRPC Procedures
- [ ] Write test: tRPC procedure for requesting upload URL (instructor/admin only), confirm upload completion, list media library for course
- [ ] Implement: add media procedures to curriculum router or create `src/lib/server/api/lms/media.ts`; integrate with existing file table for metadata storage
- [ ] Verify: tests pass, uploaded file metadata persisted, signed URLs generated correctly

### Task 3.3: Content Block Renderers - Video and Audio
- [ ] Write test: component renders video player with correct source URL; audio player renders with playback controls; progress callback fires at intervals
- [ ] Implement: `src/lib/components/lms/content/VideoBlock.svelte` with HTML5 video, progress tracking (timeupdate event), signed URL source; `AudioBlock.svelte` with similar pattern; both report progress percentage via callback
- [ ] Verify: tests pass, components render without errors, progress callback fires

### Task 3.4: Content Block Renderers - Text, Code, Image
- [ ] Write test: text block renders Quill content (read-only); code block renders with syntax highlighting; image block renders with caption and alt text
- [ ] Implement: `TextBlock.svelte` using Quill delta renderer (read-only mode from content-seo track), `CodeBlock.svelte` with Prism.js or Shiki highlighting, `ImageBlock.svelte` with S3 URL and caption
- [ ] Verify: tests pass, rich text renders correctly, code highlighting works for common languages

### Task 3.5: Content Block Renderers - Slides, Embed, Download
- [ ] Write test: slides block renders markdown-based slides with navigation; embed renders YouTube/Vimeo iframes safely; download block shows file info with download button
- [ ] Implement: `SlidesBlock.svelte` with slide navigation (prev/next/overview), `EmbedBlock.svelte` with domain whitelist validation and iframe sandbox, `DownloadBlock.svelte` with signed download URL and download count tracking
- [ ] Verify: tests pass, embed whitelist enforced, download counter increments

### Task 3.6: Content Block Router Component
- [ ] Write test: router component selects correct renderer based on content block type; handles unknown types gracefully
- [ ] Implement: `ContentBlockRenderer.svelte` that takes a content block object and renders the appropriate type-specific component; includes loading states and error boundaries
- [ ] Verify: tests pass, all 8 content types render through router, unknown type shows fallback

### Task 3.7: Phase 3 Verification
- [ ] All content block components render correctly
- [ ] Video/audio streaming works with signed URLs
- [ ] Upload flow works end-to-end for instructor
- [ ] Mobile-responsive rendering verified
- [ ] [checkpoint marker]

---

## Phase 4: Assessment Engine

**Goal:** Quiz creation, question banks, quiz-taking flow, auto-grading, and manual grading queue.

### Task 4.1: Question Bank Service
- [ ] Write test: create questions of each type with correct config; add to bank; query bank with filters (type, tags); randomize selection of N questions
- [ ] Implement: `src/lib/server/services/lms/questionBank.ts` with: createQuestion (validates config per type), updateQuestion (versioning - creates new, marks old inactive), listQuestions (filtered, paginated), getRandomQuestions (weighted or uniform)
- [ ] Verify: tests pass, type-specific validation works, randomization produces correct count

### Task 4.2: Quiz Configuration Service
- [ ] Write test: create quiz attached to lesson/module; configure time limit, passing score, max attempts, question source (bank random vs. fixed list); validate quiz is completable (has enough questions)
- [ ] Implement: `src/lib/server/services/lms/quiz.ts` with: createQuiz, updateQuiz, deleteQuiz, getQuizForLesson, validateQuizCompleteness
- [ ] Verify: tests pass, incomplete quiz (no questions) flagged, config validation works

### Task 4.3: Quiz Attempt Flow Service
- [ ] Write test: start attempt (creates record, returns questions WITHOUT correct answers), submit attempt (records answers, auto-grades objective questions, calculates score), enforce time limit (reject late submissions), enforce max attempts
- [ ] Implement: `src/lib/server/services/lms/quizAttempt.ts` with: startAttempt, submitAttempt, autoGrade (per question type), calculateScore, getAttemptResult; answer comparison logic for each auto-gradable type (exact match, fuzzy match for fill_blank, set comparison for multi_select, order comparison for ordering)
- [ ] Verify: tests pass for each question type grading, time limit enforced, attempt count enforced

### Task 4.4: Manual Grading Service
- [ ] Write test: identify ungraded essay/short_answer responses; instructor submits grade and feedback; recalculate attempt score after manual grade; notification trigger
- [ ] Implement: `src/lib/server/services/lms/grading.ts` with: getUngradedSubmissions (filtered by course/instructor), gradeAnswer (score + feedback), recalculateAttemptScore, markAttemptFullyGraded
- [ ] Verify: tests pass, score recalculation correct, partially-graded attempts flagged

### Task 4.5: Quiz tRPC Router
- [ ] Write test: tRPC procedures for quiz CRUD (instructor/admin), question CRUD, startAttempt (learner, enrolled only), submitAttempt, getResult, gradeAnswer (instructor)
- [ ] Implement: `src/lib/server/api/lms/quiz.ts` router with all procedures; enrollment check middleware for learner endpoints; instructor scope check for grading
- [ ] Verify: tests pass, unenrolled learner cannot start quiz, correct answers not leaked in startAttempt response

### Task 4.6: Quiz UI Components - Question Renderers
- [ ] Write test: each question type renders correct input controls; multiple choice shows radio buttons; multi-select shows checkboxes; matching shows drag/connect UI; fill blank shows text input; essay shows textarea
- [ ] Implement: `src/lib/components/lms/quiz/` directory with: MultipleChoice.svelte, MultiSelect.svelte, TrueFalse.svelte, FillBlank.svelte, Matching.svelte, ShortAnswer.svelte, Essay.svelte, Ordering.svelte; each emits answer value
- [ ] Verify: tests pass, all input types functional, answer values emitted correctly

### Task 4.7: Quiz Player Component
- [ ] Write test: quiz player loads questions, shows timer (if timed), navigates between questions, submits all answers, shows results
- [ ] Implement: `src/lib/components/lms/quiz/QuizPlayer.svelte` with: question navigation (prev/next/jump), timer countdown with auto-submit, answer collection, submit confirmation dialog, results display with score and per-question feedback
- [ ] Verify: tests pass, timer auto-submits, navigation works, results display correctly

### Task 4.8: Phase 4 Verification
- [ ] All question types grade correctly (auto and manual)
- [ ] Quiz flow end-to-end: create quiz -> learner takes -> auto-grade -> view results
- [ ] Manual grading queue works for essay questions
- [ ] Time limits enforced
- [ ] [checkpoint marker]

---

## Phase 5: Progress Tracking and Analytics

**Goal:** Granular progress tracking, learner dashboard data, admin analytics.

### Task 5.1: Progress Tracking Service
- [ ] Write test: track video progress (percentage watched), track text completion (scroll/time), track quiz completion (score recorded), track download (downloaded flag); aggregate lesson/module/course completion percentages
- [ ] Implement: `src/lib/server/services/lms/progress.ts` with: updateContentBlockProgress (debounce-friendly, upsert), calculateLessonProgress, calculateModuleProgress, calculateCourseProgress, getResumePoint (last accessed content block), markLessonComplete, markCourseComplete (triggers certificate if applicable)
- [ ] Verify: tests pass, completion thresholds respected, course completion triggers correctly

### Task 5.2: Progress tRPC Router
- [ ] Write test: trackProgress procedure (rate-limited, enrolled learner only), getCourseProgress, getResumePoint, resetProgress
- [ ] Implement: `src/lib/server/api/lms/progress.ts` router; trackProgress accepts partial updates (e.g., video at 45%); debounce enforcement (reject if last update < 5 seconds)
- [ ] Verify: tests pass, rate limiting works, unenrolled access rejected

### Task 5.3: Learner Analytics Service
- [ ] Write test: calculate learning streak (consecutive days with activity), total learning hours, courses completed count, average quiz scores
- [ ] Implement: `src/lib/server/services/lms/learnerAnalytics.ts` with: getLearnerStats, getLearningStreak, getRecentActivity, getQuizPerformanceHistory
- [ ] Verify: tests pass, streak calculation handles timezone edge cases, stats aggregate correctly

### Task 5.4: Admin Analytics Service
- [ ] Write test: course enrollment count, completion rate, average quiz score, drop-off by module (where learners stop), revenue per course, overall LMS dashboard stats
- [ ] Implement: `src/lib/server/services/lms/adminAnalytics.ts` with: getCourseAnalytics, getQuizAnalytics (question difficulty, pass rates), getEnrollmentTrends (time series), getDropOffAnalysis, getRevenueReport, getLMSDashboardStats
- [ ] Verify: tests pass, analytics queries perform within 500ms on test data, aggregations correct

### Task 5.5: Analytics tRPC Router
- [ ] Write test: admin-only access to analytics endpoints; learner access to their own stats only
- [ ] Implement: `src/lib/server/api/lms/analytics.ts` router with dashboard, course analytics, quiz analytics, revenue report procedures; add learner stats to progress router
- [ ] Verify: tests pass, admin auth enforced, date range filtering works

### Task 5.6: Phase 5 Verification
- [ ] Progress tracking updates correctly for all content types
- [ ] Course completion fires at correct threshold
- [ ] Analytics queries return accurate data
- [ ] Resume point works across sessions
- [ ] [checkpoint marker]

---

## Phase 6: Certificates and Achievements

**Goal:** PDF certificate generation, public verification, badge system.

### Task 6.1: Certificate Template Service
- [ ] Write test: create template with HTML/CSS, list templates, assign template to course, render template with variables (learner name, course title, date, cert ID)
- [ ] Implement: `src/lib/server/services/lms/certificate.ts` with: createTemplate, updateTemplate, listTemplates, renderTemplate (HTML string interpolation with sanitization), assignTemplateToCourse
- [ ] Verify: tests pass, template variables substituted correctly, XSS in template variables sanitized

### Task 6.2: PDF Generation Service
- [ ] Write test: render HTML template to PDF buffer; verify PDF is valid; verify file size is reasonable (< 5MB)
- [ ] Implement: `src/lib/server/services/lms/pdfGenerator.ts` using Puppeteer (or Playwright) for HTML-to-PDF rendering; configure page size (landscape A4), margins; return PDF buffer
- [ ] Verify: tests pass, PDF renders correctly, performance acceptable (< 5 seconds)

### Task 6.3: Certificate Issuance Service
- [ ] Write test: auto-issue certificate on course completion (triggered by progress service), generate unique certificate UID, store certificate record, upload PDF to S3
- [ ] Implement: `src/lib/server/services/lms/certificateIssuance.ts` with: issueCertificate (called from progress.markCourseComplete), generateCertificateUid (UUID v4 short format), storeCertificatePdf (upload to S3)
- [ ] Verify: tests pass, certificate issued only once per enrollment, UID is unique

### Task 6.4: Certificate tRPC Router
- [ ] Write test: download certificate (learner, own only), verify certificate (public endpoint), list my certificates, admin template CRUD
- [ ] Implement: add certificate procedures to `src/lib/server/api/lms/certificate.ts`; public verify endpoint returns certificate details without auth
- [ ] Verify: tests pass, public verify works without auth, download returns PDF

### Task 6.5: Badge Service
- [ ] Write test: define badge with trigger condition, check badge eligibility after relevant events, award badge, list learner badges
- [ ] Implement: `src/lib/server/services/lms/badges.ts` with: createBadge (admin), checkAndAwardBadges (called after course completion, quiz perfect score, streak milestone), getLearnerBadges, predefined triggers: first_course_completed, courses_completed_5, perfect_quiz, streak_7_days
- [ ] Verify: tests pass, badge awarded only once, trigger conditions evaluated correctly

### Task 6.6: Public Certificate Verification Page
- [ ] Write test: page loads with certificate ID, displays certificate details (learner name, course, date, status), handles invalid certificate ID gracefully
- [ ] Implement: `src/routes/certificates/verify/[id]/+page.svelte` and `+page.server.ts` with server-side data loading; clean design showing verification status
- [ ] Verify: tests pass, valid certificate shows details, invalid shows "not found" message

### Task 6.7: Phase 6 Verification
- [ ] Certificate auto-issues on course completion
- [ ] PDF downloads correctly
- [ ] Public verification page works
- [ ] Badges award on trigger events
- [ ] [checkpoint marker]

---

## Phase 7: Learner UI

**Goal:** Complete learner-facing interface: course catalog, course player, learning dashboard.

### Task 7.1: Course Catalog Page
- [ ] Write test: page renders course grid, filters work (category, difficulty, price), search returns matching courses, pagination works
- [ ] Implement: `src/routes/courses/+page.svelte` and `+page.server.ts` with: course grid with cards (thumbnail, title, instructor, rating, price), filter sidebar, search input, pagination; use existing DaisyUI card patterns
- [ ] Verify: tests pass, page loads within 2s, filters produce correct results, mobile responsive

### Task 7.2: Course Detail Page
- [ ] Write test: page renders course info, expandable curriculum outline, instructor bio, reviews section, enrollment CTA (enroll/buy/request)
- [ ] Implement: `src/routes/courses/[slug]/+page.svelte` and `+page.server.ts` with: hero section (thumbnail, title, description), curriculum accordion (modules -> lessons, show free preview indicator), instructor card, reviews list, pricing and enrollment button, related courses
- [ ] Verify: tests pass, SEO meta tags present, enrollment button state reflects user status (not enrolled, enrolled, completed)

### Task 7.3: Course Player Layout
- [ ] Write test: layout renders sidebar navigation with module/lesson tree, content area, progress indicators per lesson
- [ ] Implement: `src/routes/learn/[courseSlug]/+layout.svelte` with: collapsible sidebar showing course structure (modules, lessons with completion checkmarks), breadcrumb, content area slot, mobile: bottom drawer for navigation
- [ ] Verify: tests pass, sidebar reflects real-time progress, mobile navigation works

### Task 7.4: Lesson Page
- [ ] Write test: page loads content blocks in order, renders through ContentBlockRenderer, tracks progress on content interaction
- [ ] Implement: `src/routes/learn/[courseSlug]/[lessonSlug]/+page.svelte` with: content blocks rendered sequentially, progress tracking callbacks wired to tRPC, lesson navigation (prev/next), quiz integration if lesson has quiz
- [ ] Verify: tests pass, progress tracked, navigation works, quiz renders inline

### Task 7.5: My Learning Dashboard
- [ ] Write test: dashboard shows enrolled courses with progress, filters (in-progress, completed, not started), continue button navigates to resume point
- [ ] Implement: `src/routes/learn/+page.svelte` with: course cards showing progress bar and last accessed, filter tabs, learning stats summary (courses completed, hours, streak), recent activity feed
- [ ] Verify: tests pass, progress bars accurate, continue button works, empty state handled

### Task 7.6: Bookmarks and Notes
- [ ] Write test: add/remove bookmark on a lesson, view bookmarks list, add/edit/delete note on a lesson, notes support markdown
- [ ] Implement: bookmark toggle component in lesson page, `/learn/bookmarks` page listing bookmarked lessons, notes panel in lesson page (collapsible sidebar or modal), markdown editor for notes
- [ ] Verify: tests pass, bookmarks persist, notes save and render markdown

### Task 7.7: My Certificates Page
- [ ] Write test: page lists earned certificates with course name, date, download button, verification link
- [ ] Implement: `src/routes/learn/certificates/+page.svelte` with certificate cards, download PDF button, copy verification link button
- [ ] Verify: tests pass, PDF download works, verification link correct

### Task 7.8: Phase 7 Verification
- [ ] Full learner flow: browse catalog -> enroll -> take lessons -> complete quiz -> earn certificate
- [ ] Mobile responsive on all learner pages
- [ ] Progress persists across sessions
- [ ] Accessibility audit (keyboard navigation, screen reader)
- [ ] [checkpoint marker]

---

## Phase 8: Admin and Instructor UI

**Goal:** Admin LMS management panels and instructor content creation interface.

### Task 8.1: Admin LMS Dashboard
- [ ] Write test: dashboard renders key metrics (total courses, enrollments, completion rate, revenue), charts load
- [ ] Implement: `src/routes/admin/lms/+page.svelte` with: stats cards, enrollment trend chart (time series), top courses by enrollment, recent enrollments feed, quick actions (create course, manage enrollments)
- [ ] Verify: tests pass, data loads from analytics service, layout matches existing admin patterns

### Task 8.2: Admin Course Management
- [ ] Write test: course list with search/filter, create course form with all fields, edit course, publish/archive toggle
- [ ] Implement: `src/routes/admin/lms/courses/+page.svelte` (list) and `src/routes/admin/lms/courses/[id]/+page.svelte` (edit); multi-step form for course creation (basics -> pricing -> enrollment -> settings); use existing DaisyUI form patterns
- [ ] Verify: tests pass, course CRUD works end-to-end, form validation provides clear errors

### Task 8.3: Curriculum Builder UI
- [ ] Write test: drag-and-drop reordering of modules, drag-and-drop of lessons within modules, add/edit/delete content blocks, inline title editing
- [ ] Implement: `src/lib/components/lms/admin/CurriculumBuilder.svelte` using HTML5 Drag and Drop API (or a Svelte-compatible library); module/lesson/block tree with drag handles, inline edit mode, add buttons at each level, content block type selector, autosave indicator
- [ ] Verify: tests pass, reorder persists to API, drag-and-drop works on desktop, fallback reorder buttons for mobile

### Task 8.4: Quiz Builder UI
- [ ] Write test: create quiz, add questions of each type, configure quiz settings (timer, attempts, passing score), preview quiz
- [ ] Implement: quiz builder section within curriculum builder; question type selector, per-type form (options for MC, pairs for matching, etc.), question bank browser (search and add existing questions), quiz preview mode
- [ ] Verify: tests pass, all question types configurable, preview shows learner view

### Task 8.5: Admin Enrollment Management
- [ ] Write test: view enrollments with filters (course, status, date range), bulk enroll via CSV, approve/reject pending enrollments, export enrollment data
- [ ] Implement: `src/routes/admin/lms/enrollments/+page.svelte` with: enrollment table with pagination and filters, bulk actions, CSV upload for bulk enrollment, approval queue for approval-required courses, CSV export
- [ ] Verify: tests pass, bulk enrollment processes correctly, CSV format validated

### Task 8.6: Admin Certificate Template Manager
- [ ] Write test: list templates, create template with HTML editor, preview with sample data, assign to course
- [ ] Implement: `src/routes/admin/lms/certificates/+page.svelte` with: template list, code editor for HTML/CSS (Monaco or CodeMirror), live preview panel with sample variable substitution, assign template to courses
- [ ] Verify: tests pass, preview renders correctly, template saves and loads

### Task 8.7: Admin Analytics Panels
- [ ] Write test: course analytics page shows enrollment/completion/score metrics, quiz analytics shows question difficulty, revenue report with date range filter
- [ ] Implement: `src/routes/admin/lms/analytics/+page.svelte` with tabs: overview, per-course, quiz analytics, revenue; data tables and charts; date range picker; CSV export for reports
- [ ] Verify: tests pass, data matches service layer calculations, exports generate valid CSV

### Task 8.8: Instructor Dashboard
- [ ] Write test: instructor sees only assigned courses, can access curriculum builder for their courses, sees student progress, accesses grading queue
- [ ] Implement: `src/routes/instructor/+page.svelte` (dashboard), `src/routes/instructor/courses/[id]/+layout.svelte` (course management with tabs: edit, students, grading); reuse curriculum builder from Task 8.3 with instructor scope; grading queue filtered to instructor's courses
- [ ] Verify: tests pass, instructor cannot access other instructors' courses, grading queue shows only their submissions

### Task 8.9: Admin LMS Settings
- [ ] Write test: load global settings, update settings (default passing score, completion thresholds, embed whitelist), settings persist
- [ ] Implement: `src/routes/admin/lms/settings/+page.svelte` with: form for global LMS configuration, validation, save confirmation
- [ ] Verify: tests pass, settings affect course defaults, invalid values rejected

### Task 8.10: Phase 8 Verification
- [ ] Admin can create and publish a complete course with curriculum, quizzes, and certificate
- [ ] Instructor can build curriculum for assigned courses only
- [ ] Analytics display accurate data
- [ ] All admin pages accessible from admin navigation
- [ ] [checkpoint marker]

---

## Phase 9: Integration and Polish

**Goal:** Connect LMS with existing platform systems, SEO, affiliate integration, and final polish.

### Task 9.1: Course-Product Linking
- [ ] Write test: link courses to product categories, display linked products in course sidebar, display related courses on product pages
- [ ] Implement: course-product association UI in admin course editor; product recommendation sidebar in course player; "Related Courses" section on product category pages using existing product category data
- [ ] Verify: tests pass, bidirectional links display correctly, no N+1 queries

### Task 9.2: Affiliate Integration for Courses
- [ ] Write test: affiliate can generate link for a course, click tracking works on course pages, commission attributed on paid course enrollment, affiliate dashboard shows course earnings
- [ ] Implement: extend existing affiliate link system to support course entities (add course_id to affiliate_link or create lms_affiliate_link); affiliate dashboard shows course links alongside product links; commission calculation on course purchase via Stripe webhook
- [ ] Verify: tests pass, affiliate attribution tracks through checkout, commission calculated correctly

### Task 9.3: Stripe Webhook for Course Purchases
- [ ] Write test: Stripe checkout.session.completed event for course purchase creates enrollment, webhook handles duplicate events idempotently, failed payment does not create enrollment
- [ ] Implement: extend existing Stripe webhook handler to detect course purchases (via metadata), create enrollment record on successful payment, send enrollment confirmation email
- [ ] Verify: tests pass, enrollment created on payment, idempotent handling works

### Task 9.4: Navigation and Layout Integration
- [ ] Write test: main navigation includes "Learn" link, course pages use site-wide layout, admin sidebar includes LMS section
- [ ] Implement: add "Learn" / "Courses" to main navigation component; add LMS section to admin sidebar; ensure breadcrumbs work across LMS pages; footer includes courses link
- [ ] Verify: tests pass, navigation consistent across pages, active state correct

### Task 9.5: SEO for Course Pages
- [ ] Write test: course catalog has meta tags, course detail has JSON-LD (Course schema), courses included in sitemap.xml
- [ ] Implement: add meta tags to course catalog and detail pages (title, description, og:image from course thumbnail); JSON-LD Course and CourseInstance structured data; extend sitemap generation to include published courses
- [ ] Verify: tests pass, structured data validates with Google's tool, sitemap includes courses

### Task 9.6: Email Notifications
- [ ] Write test: enrollment confirmation email sent, course completion email sent, grading complete notification sent, enrollment approval notification sent
- [ ] Implement: extend existing email service with LMS templates: enrollment confirmation, course completion (with certificate link), grade notification, approval notification; use existing Resend infrastructure
- [ ] Verify: tests pass, emails send with correct content, templates render correctly

### Task 9.7: Discussion Forums Implementation
- [ ] Write test: create thread on lesson, reply to thread, nested replies (max 2 levels), pin/lock/delete (instructor/admin), pagination
- [ ] Implement: discussion UI component embedded in lesson page (toggleable section below content), thread list with sorting, reply form with rich text, moderation controls for instructor/admin roles
- [ ] Verify: tests pass, nesting enforced, moderation works, pagination handles large thread counts

### Task 9.8: Course Reviews Implementation
- [ ] Write test: enrolled learner with 25%+ progress can submit review, one review per learner per course, admin moderation (approve/reject), average rating calculation
- [ ] Implement: review form on course detail page (for enrolled learners), review list with ratings, admin moderation panel in admin LMS, average rating displayed on course cards and detail page
- [ ] Verify: tests pass, eligibility enforced, moderation flow works, average rating accurate

### Task 9.9: Mobile Polish and Performance
- [ ] Write test: course player works on 320px viewport, touch interactions work for quiz questions, no horizontal overflow on any LMS page
- [ ] Implement: responsive fixes across all LMS pages, touch-friendly quiz interactions (larger tap targets for matching/ordering), lazy loading of content blocks, performance optimization (preload next lesson data, image optimization)
- [ ] Verify: manual testing on mobile viewports, Lighthouse performance score > 80, no layout shift

### Task 9.10: Audit Logging for LMS
- [ ] Write test: course creation logged, enrollment changes logged, grade submissions logged, certificate issuance logged
- [ ] Implement: integrate with existing auditLog service; add LMS-specific actions (lms.course.created, lms.enrollment.approved, lms.quiz.graded, lms.certificate.issued, etc.)
- [ ] Verify: tests pass, audit entries created for all significant LMS actions

### Task 9.11: Final Integration Verification
- [ ] Full end-to-end flow: admin creates course -> instructor builds curriculum -> learner enrolls (paid) -> completes course -> earns certificate -> affiliate earns commission
- [ ] Run full test suite - all pass
- [ ] `npm run check` passes
- [ ] `npm run build` succeeds
- [ ] Coverage meets 70% threshold for LMS code
- [ ] Accessibility audit: WCAG 2.1 AA on all LMS pages
- [ ] [checkpoint marker]

---

## Summary

| Phase | Tasks | Focus | Est. Duration |
|-------|-------|-------|---------------|
| 1 | 9 | Database schema and migrations | 1 week |
| 2 | 9 | Course management and enrollment APIs | 1.5 weeks |
| 3 | 7 | Content delivery and media streaming | 1 week |
| 4 | 8 | Assessment engine (quizzes, grading) | 1.5 weeks |
| 5 | 6 | Progress tracking and analytics | 1 week |
| 6 | 7 | Certificates and badges | 1 week |
| 7 | 8 | Learner-facing UI | 1.5 weeks |
| 8 | 10 | Admin and instructor UI | 2 weeks |
| 9 | 11 | Integration, polish, and verification | 1.5-2 weeks |
| **Total** | **75** | | **12-14 weeks** |

### Critical Path
Phase 1 -> Phase 2 -> Phase 3 + Phase 4 (parallel) -> Phase 5 -> Phase 6 -> Phase 7 + Phase 8 (parallel) -> Phase 9

### Risk Factors
- **Video streaming performance:** S3 signed URL generation and streaming latency need real-world testing early
- **PDF generation:** Puppeteer/Playwright adds a significant dependency; consider lighter alternatives if deployment constraints arise
- **Drag-and-drop builder:** Complex UI interaction; allow extra time for cross-browser and mobile testing
- **Quiz auto-grading edge cases:** Fuzzy matching for fill_blank, partial credit for multi_select need careful test coverage
- **Schema size:** 20+ new tables is the largest single-track schema addition; migration testing critical
