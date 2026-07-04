# Specification: Learning Management System (LMS)

**Track ID:** `lms-system_20260402`
**Type:** Feature
**Priority:** High
**Phase:** 6 (Education & Community)

## Overview

Build a comprehensive, admin-configurable multimodal Learning Management System integrated into the Aevani platform. The LMS enables educators, institutions, and the Aevani team to create, sell, and deliver courses on sustainable agriculture topics. It supports multiple course formats, rich multimedia content, assessments, progress tracking, certificates, and deep integration with the existing e-commerce and affiliate systems.

## Background

Aevani's target segments include Educators & Institutions and Hobbyist Gardeners who want to learn sustainable farming techniques. The platform already delivers educational content through the CMS (Track 6: content-seo), but lacks structured learning paths, assessments, and progress tracking. A full LMS will:

- Create a new revenue stream (paid courses)
- Increase user engagement and time-on-site
- Differentiate Aevani from commodity agriculture suppliers
- Provide affiliates with high-value digital products to promote
- Serve the Educators & Institutions segment directly

## User Roles

| Role | Description |
|------|-------------|
| **Learner** | Any authenticated user enrolled in courses. Consumes content, takes quizzes, earns certificates. |
| **Instructor** | New role added to the user system. Creates and manages course content. Cannot access admin panels beyond their own courses. |
| **Admin** | Existing admin role. Full LMS configuration: pricing, enrollment policies, analytics, certificate templates, instructor management. |
| **Affiliate** | Existing role. Can generate affiliate links for courses (same as products). |

---

## Functional Requirements

### FR-1: Course Types and Structure

**Description:** Support multiple course delivery formats with a hierarchical curriculum structure.

**Course Types:**
- **Self-paced:** Learner progresses at own speed, no deadlines
- **Instructor-led:** Scheduled sessions with start/end dates, paced content release
- **Blended:** Mix of self-paced modules and scheduled live sessions
- **Cohort-based:** Groups of learners start together, progress together with deadlines

**Curriculum Hierarchy:**
```
Program (optional grouping)
  -> Course
    -> Module (section/chapter)
      -> Lesson
        -> Content Block (atomic content unit)
```

**Acceptance Criteria:**
- [ ] Admin can create courses of each type
- [ ] Curriculum hierarchy is enforced: lessons belong to modules, modules belong to courses
- [ ] Programs can group multiple courses into a learning path
- [ ] Each level has: title, description, slug, sort order, published/draft status
- [ ] Courses have: thumbnail, description, duration estimate, difficulty level, language tag
- [ ] Prerequisites can be defined at the course level (must complete course X before starting Y)
- [ ] Courses can be cloned from templates
- [ ] Course versioning: new version can be created while old version remains accessible to enrolled learners

**Priority:** P0

---

### FR-2: Drag-and-Drop Curriculum Builder

**Description:** Admin/Instructor UI for visually constructing course curriculum.

**Acceptance Criteria:**
- [ ] Drag-and-drop interface for reordering modules within a course
- [ ] Drag-and-drop for reordering lessons within a module
- [ ] Drag-and-drop for reordering content blocks within a lesson
- [ ] Inline editing of titles and descriptions
- [ ] Bulk operations: move lessons between modules, duplicate modules
- [ ] Live preview of lesson content
- [ ] Autosave with manual publish control
- [ ] Undo/redo support

**Priority:** P1

---

### FR-3: Multimodal Content Delivery

**Description:** Support diverse content types within lessons.

**Content Block Types:**
| Type | Description | Storage |
|------|-------------|---------|
| `video` | Hosted video with streaming | S3 + signed URLs |
| `text` | Rich text (Quill editor, reuse from content-seo) | Database |
| `slides` | Interactive presentation (markdown-based slides) | Database |
| `download` | Downloadable files (PDF, worksheets) | S3 |
| `audio` | Audio content/podcasts | S3 |
| `embed` | External content (YouTube, Vimeo, CodePen) | URL reference |
| `code` | Code snippets with syntax highlighting | Database |
| `image` | Images with captions | S3 via file table |

**Acceptance Criteria:**
- [ ] Each content block has a type discriminator and type-specific configuration (JSON)
- [ ] Video content: upload to S3, generate signed streaming URLs, track watch progress (% watched)
- [ ] Text content: uses existing Quill rich text editor component
- [ ] Downloads: upload to S3, track download count
- [ ] Embeds: whitelist of allowed domains (YouTube, Vimeo, CodePen, etc.), oEmbed or iframe
- [ ] Audio: streaming playback with progress tracking
- [ ] Content blocks are independently orderable within a lesson
- [ ] Mobile-responsive rendering for all content types

**Priority:** P0

---

### FR-4: Assessment Engine

**Description:** Quizzes and assessments with multiple question types and configurable grading.

**Question Types:**
| Type | Auto-gradable | Description |
|------|:---:|-------------|
| `multiple_choice` | Yes | Single correct answer from options |
| `multi_select` | Yes | Multiple correct answers |
| `true_false` | Yes | Binary choice |
| `fill_blank` | Yes | Exact or fuzzy text match |
| `matching` | Yes | Match items from two columns |
| `short_answer` | No | Free text, reviewed by instructor |
| `essay` | No | Long-form response, reviewed by instructor |
| `ordering` | Yes | Arrange items in correct sequence |

**Acceptance Criteria:**
- [ ] Question bank: pool of questions per course, reusable across quizzes
- [ ] Quizzes can pull N random questions from a bank (configurable)
- [ ] Timed quizzes: configurable duration, auto-submit on timeout
- [ ] Configurable passing score per quiz (percentage)
- [ ] Retry policy: unlimited, limited attempts, or single attempt
- [ ] Auto-grading for objective question types with immediate feedback
- [ ] Manual grading queue for essay/short-answer with instructor notifications
- [ ] Quiz results: score breakdown, correct/incorrect per question, time spent
- [ ] Quizzes can be placed as content blocks within lessons or as standalone module assessments
- [ ] Question versioning: editing a question does not alter past attempt records
- [ ] Admin analytics: question difficulty analysis, average scores, pass rates

**Priority:** P0

---

### FR-5: Progress Tracking

**Description:** Track learner progress through courses at every level of the hierarchy.

**Tracking Mechanisms:**
- Video: percentage watched (mark complete at configurable threshold, default 90%)
- Text: scroll-to-bottom or time-on-page threshold
- Quiz: completion with score recorded
- Download: file downloaded at least once
- Audio: percentage listened

**Acceptance Criteria:**
- [ ] Per-content-block completion status stored
- [ ] Lesson completion: all required content blocks completed
- [ ] Module completion: all required lessons completed
- [ ] Course completion: all required modules completed + passing all required assessments
- [ ] Progress percentage calculated at lesson, module, and course levels
- [ ] "Resume where I left off" functionality across sessions
- [ ] Last accessed timestamp per course for the learner
- [ ] Progress data is never deleted, only reset if explicitly requested

**Priority:** P0

---

### FR-6: Learner Dashboard

**Description:** Personal learning hub for enrolled users.

**Acceptance Criteria:**
- [ ] "My Learning" page showing all enrolled courses with progress bars
- [ ] Filter by: in-progress, completed, not started
- [ ] Sort by: recently accessed, enrollment date, progress percentage
- [ ] Course card shows: thumbnail, title, instructor, progress %, last accessed
- [ ] Quick "Continue" button that navigates to the last accessed lesson
- [ ] Overall learning statistics: courses completed, total hours, current streak
- [ ] Bookmarks: save specific lessons for quick access
- [ ] Notes: per-lesson note-taking with markdown support
- [ ] Earned certificates displayed

**Priority:** P0

---

### FR-7: Certificates and Achievements

**Description:** Reward course completion with verifiable certificates and gamification elements.

**Certificates:**
- [ ] Admin-configurable certificate templates (HTML/CSS-based, rendered to PDF)
- [ ] Template variables: learner name, course title, completion date, instructor name, certificate ID
- [ ] Auto-generated on course completion (if certificate is enabled for the course)
- [ ] Downloadable PDF
- [ ] Public verification page: `/certificates/verify/{certificateId}` shows certificate details
- [ ] Unique certificate ID per issuance

**Achievements / Badges:**
- [ ] Predefined badge types: first course completed, 5 courses completed, perfect quiz score, 7-day streak, etc.
- [ ] Badge display on learner profile
- [ ] Admin can create custom badges with name, description, icon (SVG upload), and trigger conditions

**Priority:** P1

---

### FR-8: Course Catalog and Discovery

**Description:** Public-facing course browsing experience.

**Acceptance Criteria:**
- [ ] Course catalog page at `/courses` with grid/list view
- [ ] Filter by: category, difficulty, course type, price (free/paid), instructor
- [ ] Search courses by title, description, tags
- [ ] Course detail page at `/courses/{slug}` with: description, curriculum outline (expandable), instructor bio, reviews, pricing, enrollment CTA
- [ ] Course categories and tags (admin-managed)
- [ ] Featured courses section on catalog page
- [ ] Related courses suggestions
- [ ] Course preview: first module/lesson accessible without enrollment

**Priority:** P0

---

### FR-9: Course Pricing and Enrollment

**Description:** Flexible pricing and enrollment management.

**Pricing Models:**
- Free (open access)
- One-time purchase (Stripe Checkout, same pattern as product checkout)
- Bundled (included in a subscription plan, future consideration)

**Enrollment Types:**
- Open: anyone can enroll (free) or purchase
- Approval-required: learner requests, admin/instructor approves
- Invite-only: admin sends enrollment invitations
- Capacity-limited: maximum enrollment count

**Acceptance Criteria:**
- [ ] Course pricing configurable per course
- [ ] Stripe Checkout integration for paid courses (reuse existing Stripe patterns)
- [ ] Enrollment record created on successful payment or approval
- [ ] Enrollment statuses: active, completed, suspended, expired
- [ ] Enrollment expiry: optional time-limited access (e.g., 12 months)
- [ ] Bulk enrollment: admin can enroll multiple users at once (CSV upload or user search)
- [ ] Enrollment capacity: configurable max seats per course
- [ ] Revenue reports: total revenue, revenue per course, refund tracking

**Priority:** P0

---

### FR-10: Discussion Forums

**Description:** Per-course and per-lesson discussion threads.

**Acceptance Criteria:**
- [ ] Discussion thread per lesson (optional, toggled by instructor)
- [ ] Course-level general discussion board
- [ ] Thread creation: title + body (rich text)
- [ ] Replies with nesting (max 2 levels)
- [ ] Instructor/admin can pin, lock, or delete threads
- [ ] Notification to instructor on new posts (in-app, optional email)
- [ ] Pagination and sorting (newest, oldest, most replies)

**Priority:** P2

---

### FR-11: Course Reviews and Ratings

**Description:** Learner feedback system for completed or in-progress courses.

**Acceptance Criteria:**
- [ ] 1-5 star rating with text review
- [ ] Only enrolled learners can review (after completing at least 25% of course)
- [ ] One review per learner per course (editable)
- [ ] Average rating displayed on course card and detail page
- [ ] Admin moderation: approve, reject, flag reviews
- [ ] Sort reviews: newest, highest rated, lowest rated, most helpful

**Priority:** P2

---

### FR-12: Admin Course Management

**Description:** Comprehensive admin interface for LMS configuration.

**Acceptance Criteria:**
- [ ] Course CRUD with all fields (type, pricing, enrollment policy, prerequisites, etc.)
- [ ] Instructor management: assign instructor role, assign instructors to courses
- [ ] Course analytics dashboard: enrollment count, completion rate, average score, revenue, drop-off by module
- [ ] Question bank management: browse, edit, import/export questions
- [ ] Certificate template designer: WYSIWYG or code-based template editing
- [ ] Category/tag management for courses
- [ ] Enrollment management: view enrollees, bulk enroll/unenroll, export enrollment data
- [ ] Configuration panel: global LMS settings (default passing score, completion thresholds, etc.)
- [ ] Audit log integration for all LMS admin actions

**Priority:** P0

---

### FR-13: Instructor Dashboard

**Description:** Content creation and course management interface for instructors.

**Acceptance Criteria:**
- [ ] My Courses view: courses assigned to the instructor
- [ ] Curriculum builder access for assigned courses (FR-2)
- [ ] Content creation: add/edit lessons and content blocks
- [ ] Quiz builder: create questions, assemble quizzes
- [ ] Manual grading queue: review and grade essay/short-answer submissions
- [ ] Student progress view: see enrolled learner progress per course
- [ ] Discussion moderation for their courses
- [ ] Basic analytics: enrollment, completion, quiz scores for their courses

**Priority:** P1

---

### FR-14: Platform Integration

**Description:** Connect LMS with existing Aevani systems.

**Acceptance Criteria:**
- [ ] Course-product linking: associate courses with product categories (e.g., "Hydroponics 101" linked to Hydroponics products). Display linked products in course sidebar.
- [ ] Affiliate system: affiliates can generate links for courses, earn commission on paid course sales. Reuse existing affiliate tracking infrastructure.
- [ ] Auth integration: add "instructor" to user role enum. Instructor permissions scoped to assigned courses only.
- [ ] File storage: all media uses existing S3 + file table infrastructure
- [ ] Navigation: courses accessible from main navigation, integrated into existing layout
- [ ] SEO: course pages have meta tags, JSON-LD CourseInfo structured data, included in sitemap

**Priority:** P0

---

## Non-Functional Requirements

### NFR-1: Performance
- Course catalog page loads in under 2s (server-rendered)
- Video streaming starts within 3s (signed URL generation < 500ms)
- Progress tracking updates are debounced (max 1 API call per 5 seconds per learner)
- Quiz submission processes in under 1s for auto-graded quizzes
- Database queries for progress/analytics use appropriate indexes

### NFR-2: Security
- Enrolled-only content access enforced server-side (tRPC middleware)
- Signed S3 URLs with short expiry (15 minutes) for premium content
- Quiz answers not exposed in client-side code
- Rate limiting on quiz submissions (prevent brute-force answer testing)
- Certificate verification endpoint is public but read-only
- Instructor access scoped to their assigned courses only

### NFR-3: Accessibility
- All video content supports captions/subtitles (upload SRT/VTT files)
- Screen reader compatible lesson navigation
- Keyboard navigable curriculum builder
- WCAG 2.1 AA compliance for all LMS pages
- Color contrast meets 4.5:1 minimum ratio

### NFR-4: Scalability
- Schema supports 10,000+ enrollments per course
- Progress tracking queries optimized with composite indexes
- Content blocks loaded lazily (only current lesson loaded)
- Pagination on all list views (courses, enrollments, questions, discussions)

### NFR-5: Testing
- 70% code coverage target (per workflow.md)
- Unit tests for all service layer functions
- Integration tests for tRPC procedures with auth context
- Component tests for curriculum builder interactions

---

## Database Schema Design

### New Tables Required

```
lms_program          - Optional grouping of courses into learning paths
lms_course           - Core course entity
lms_course_version   - Versioning for courses
lms_module           - Sections within a course
lms_lesson           - Individual lessons within modules
lms_content_block    - Atomic content units within lessons (typed: video, text, etc.)
lms_quiz             - Quiz configuration (linked to lesson or module)
lms_question_bank    - Pool of questions per course
lms_question         - Individual questions with type and config
lms_question_option  - Options for multiple-choice type questions
lms_quiz_attempt     - Learner quiz attempt record
lms_quiz_answer      - Individual answer per question per attempt
lms_enrollment       - Learner enrollment in a course
lms_progress         - Per-content-block progress tracking
lms_bookmark         - Learner bookmarks
lms_note             - Learner notes per lesson
lms_certificate_template - Admin-designed certificate templates
lms_certificate      - Issued certificates
lms_badge            - Badge definitions
lms_learner_badge    - Badges earned by learners
lms_discussion_thread - Discussion threads
lms_discussion_reply  - Replies to threads
lms_course_review    - Course reviews and ratings
lms_course_category  - LMS-specific categories
lms_course_tag       - Tags for courses
lms_course_product   - Course-to-product-category links
lms_course_prerequisite - Prerequisites between courses
```

### Key Relationships
- `lms_course.instructor_id` -> `user.id` (role = 'instructor')
- `lms_enrollment.user_id` -> `user.id`
- `lms_enrollment.course_id` -> `lms_course.id`
- `lms_content_block.file_id` -> `file.id` (for media content)
- `lms_course_product.product_category_id` -> `product_category.id`
- `user.role` enum extended: `'admin' | 'customer' | 'affiliate' | 'instructor'`

---

## API Design (tRPC Routers)

### `lms.course` Router
- `list` - Public: paginated course catalog with filters
- `getBySlug` - Public: course detail with curriculum outline
- `create` - Admin/Instructor: create course
- `update` - Admin/Instructor: update course
- `delete` - Admin: soft-delete course
- `clone` - Admin: clone course from template
- `publish` - Admin/Instructor: publish draft course

### `lms.curriculum` Router
- `getModules` - Get modules for a course
- `createModule` - Create module
- `updateModule` - Update module (including reorder)
- `deleteModule` - Delete module
- `createLesson` - Create lesson in module
- `updateLesson` - Update lesson
- `deleteLesson` - Delete lesson
- `reorder` - Bulk reorder modules/lessons/blocks
- `createContentBlock` - Add content block to lesson
- `updateContentBlock` - Update content block
- `deleteContentBlock` - Remove content block

### `lms.quiz` Router
- `create` - Create quiz
- `update` - Update quiz config
- `getQuestions` - Get questions for quiz (instructor/admin)
- `createQuestion` - Add question to bank
- `updateQuestion` - Edit question
- `deleteQuestion` - Remove question
- `startAttempt` - Learner starts quiz (returns questions without answers)
- `submitAttempt` - Learner submits answers
- `getAttemptResult` - Get graded result
- `gradeEssay` - Instructor grades essay question

### `lms.enrollment` Router
- `enroll` - Enroll in free course or initiate paid checkout
- `requestEnroll` - Request enrollment (approval-required courses)
- `approveEnrollment` - Admin/Instructor approves
- `bulkEnroll` - Admin bulk enrollment
- `getMyEnrollments` - Learner's enrollments
- `getCourseEnrollments` - Admin: enrollments for a course

### `lms.progress` Router
- `trackProgress` - Update content block progress (debounced)
- `getCourseProgress` - Get full progress for a course
- `getResumePoint` - Get last accessed lesson
- `resetProgress` - Reset progress for a course (learner action)

### `lms.certificate` Router
- `getTemplate` - Admin: get certificate template
- `saveTemplate` - Admin: create/update template
- `issue` - Auto-issue on completion
- `download` - Download PDF
- `verify` - Public: verify certificate by ID
- `getMyCertificates` - Learner: list earned certificates

### `lms.discussion` Router
- `getThreads` - List threads for lesson/course
- `createThread` - Create discussion thread
- `getThread` - Get thread with replies
- `createReply` - Reply to thread
- `moderate` - Pin/lock/delete thread (instructor/admin)

### `lms.review` Router
- `create` - Submit review
- `update` - Edit own review
- `list` - List reviews for course
- `moderate` - Admin: approve/reject review

### `lms.admin` Router
- `getDashboard` - LMS analytics overview
- `getCourseAnalytics` - Per-course analytics
- `getQuizAnalytics` - Quiz performance analytics
- `getRevenueReport` - Revenue report for paid courses
- `getInstructors` - List instructors
- `assignInstructor` - Assign instructor to course
- `getGlobalSettings` - Get LMS config
- `updateGlobalSettings` - Update LMS config

---

## UI/UX Requirements

### Public Pages
- `/courses` - Course catalog (grid, filters, search)
- `/courses/{slug}` - Course detail (landing page, curriculum, reviews, pricing)
- `/certificates/verify/{id}` - Public certificate verification

### Learner Pages (authenticated)
- `/learn` - My Learning dashboard
- `/learn/{courseSlug}` - Course player (lesson viewer, sidebar navigation)
- `/learn/{courseSlug}/{lessonSlug}` - Direct lesson link
- `/learn/certificates` - My certificates
- `/learn/bookmarks` - Saved bookmarks

### Instructor Pages
- `/instructor` - Instructor dashboard
- `/instructor/courses/{id}/edit` - Curriculum builder
- `/instructor/courses/{id}/students` - Student progress
- `/instructor/grading` - Manual grading queue

### Admin Pages
- `/admin/lms` - LMS overview dashboard
- `/admin/lms/courses` - Course management
- `/admin/lms/courses/{id}` - Course detail/edit
- `/admin/lms/enrollments` - Enrollment management
- `/admin/lms/certificates` - Certificate template management
- `/admin/lms/analytics` - Analytics dashboard
- `/admin/lms/settings` - Global LMS configuration

### Design Guidelines
- Follow existing Aevani design system (Track 8 tokens, DaisyUI components)
- Course player: sidebar-based navigation with content area (similar to popular LMS platforms)
- Mobile: responsive course player, collapsible sidebar, touch-friendly quiz interactions
- Use existing PatternBackground and ScrollReveal components where appropriate
- No emojis in UI - use custom SVGs or icon libraries per project convention

---

## Out of Scope (Future Considerations)

- **SCORM/xAPI package import** - Complex standard, defer to future track
- **Live video sessions** - Requires WebRTC or third-party integration (Zoom, etc.)
- **Subscription-based course bundles** - Depends on Stripe Billing from Track 12
- **AI-powered content recommendations** - Future ML integration
- **Multi-language course content** - i18n for course content is deferred
- **White-label LMS for external institutions** - Multi-tenant LMS
- **Mobile native app** - PWA approach is sufficient for now
- **Peer assessment** - Learners grading each other
- **Learning path automation** - Auto-enroll based on completion rules
- **Gamification points/XP system** - Defer to future enhancement (badges are in scope)

---

## Open Questions

1. **Video hosting limits:** Should there be per-course or per-instructor storage quotas on S3?
2. **Certificate PDF library:** Confirm approach - server-side HTML-to-PDF (Puppeteer/Playwright) vs. client-side (jsPDF)?
3. **Instructor revenue sharing:** Should instructors receive a percentage of paid course revenue, or is this admin-managed externally?
4. **Course refund policy:** How does refunding a paid course affect enrollment status and progress data?
5. **Live session scheduling:** Even though live video is out of scope, should we include calendar/scheduling infrastructure for cohort-based courses?
