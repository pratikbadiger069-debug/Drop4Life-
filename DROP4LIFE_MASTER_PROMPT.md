# DROP4LIFE — MASTER WEBSITE BUILD 

## 1. Your role

Act as a senior full-stack developer, UI/UX engineer, software architect, database designer, and QA engineer.

Build a complete, responsive blood donation and emergency blood coordination platform called **Drop4Life**.

The original website reference was supplied as a video to ChatGPT, but the video may not be available inside the IDE. Follow this written specification as the project's source of truth. Do not claim to have inspected the original video directly. If screenshots or additional reference notes are supplied later, use them to improve visual accuracy.

## 2. Project objective

Create a functional website connecting:

- **Donors** who can respond to donation requests.
- **Hospitals** that need blood donations and manage emergency requests.
- **NGOs** that organize donation campaigns and coordinate donors and hospitals.

The final product must include a public website, role-specific authentication, three separate dashboards, blood compatibility, donor matching, emergency request workflows, maps, notifications, reports, and settings.

This is not just a UI mockup. All implemented buttons, forms, navigation elements, filters, and workflows must behave correctly.

## 3. Branding

- Website name: **Drop4Life**
- Tagline: **Every Drop Can Save a Life.**
- Logo direction: a blood drop combined with a subtle heart or life symbol.
- Primary color: deep blood red.
- Supporting colors: white, soft pink, charcoal, and accessible neutral tones.
- Style: modern, trustworthy, clean healthcare interface.

Use the Drop4Life name consistently in page titles, navigation, authentication screens, dashboards, documentation, and branding. Do not use the placeholder name VitalPulse.

## 4. Preferred technology stack

Use the following stack unless the existing repository already uses a suitable alternative:

- Next.js with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide icons
- React Hook Form and Zod
- Recharts for analytics
- Supabase Auth and PostgreSQL for production persistence
- Leaflet and OpenStreetMap for maps
- Vitest for unit tests
- Playwright for end-to-end tests

Keep dependencies reasonable. Do not migrate a working project to another stack without a clear technical reason.

## 5. Design system

Create a modern healthcare interface.

Visual direction:
- White and light neutral backgrounds
- Deep red and coral accents
- Clear typography
- Rounded cards
- Subtle borders and shadows
- Compact, useful dashboard layouts
- Consistent spacing
- Professional tables and charts
- Clear status indicators
- Responsive navigation
- Accessible contrast and keyboard navigation

Avoid excessive gradients, unnecessary animation, inconsistent icon styles, and generic template layouts.

Use a reusable design system rather than styling each page independently.

## 6. Public website

Create the following routes:

- `/`
- `/about`
- `/find-blood`
- `/blood-compatibility`
- `/blood-network`
- `/emergency`
- `/contact`
- `/login`
- `/register/donor`
- `/register/hospital`
- `/register/ngo`

### Landing page

Include:
- Header and navigation
- Hero section with a clear blood donation message
- Find Blood and Become a Donor actions
- Blood group cards
- Platform statistics
- Blood compatibility checker
- Emergency request section
- Donor/hospital/NGO introduction
- How the platform works
- Impact statistics
- Footer

Do not present invented statistics as real. Seeded demo statistics must be clearly identified as sample data.

### Blood compatibility

Support all eight ABO/Rh blood groups:

O-, O+, A-, A+, B-, B+, AB-, AB+.

Allow users to select a donor group and recipient group and view red blood cell compatibility.

Display compatible groups and explain the result.

State that compatibility checking is informational and does not replace clinical screening, crossmatching, or blood-bank approval.

### Find blood

Allow users to search for blood requests and participating hospitals using:
- Blood group
- Location
- Distance
- Urgency
- Request status
- Availability where appropriate

Provide list and map views where possible.

Never publicly reveal private donor contact details or exact home addresses.

## 7. Authentication and three user roles

Build a login page with three role options:

1. Donor
2. Hospital
3. NGO

Provide:
- Email and password
- Role-aware login
- Registration
- Logout
- Forgot password
- Form validation
- Loading and error states
- Session persistence
- Protected routes
- Role-specific redirects

Dashboard routes:

- `/donor/dashboard`
- `/hospital/dashboard`
- `/ngo/dashboard`

A user must not gain access to a different role's resources by changing a URL or selecting a different role in the UI.

Use secure server-side authorization and database policies. The selected role in a login form is not proof of permission.

For the initial prototype, provide a clearly labeled mock authentication adapter and demo accounts. Do not hardcode production credentials or use insecure client-only authentication as the final security solution.

## 8. Donor portal

Routes:

- `/donor/dashboard`
- `/donor/requests`
- `/donor/donations`
- `/donor/compatibility`
- `/donor/notifications`
- `/donor/profile`
- `/donor/settings`

Dashboard:
- Welcome message
- Blood group
- Donation history summary
- Availability
- Eligibility information
- Relevant nearby requests
- Recent activity
- Donation impact

Request management:
- View requests
- Filter by blood group, location, and urgency
- Open request details
- Accept or decline invitations
- Track response status

Donation history:
- Donation date
- Hospital or donation center
- Blood group
- Record status

Profile:
- Name
- Contact information
- Blood group
- City and approximate location
- Availability
- Last donation date

Settings:
- Notifications
- Privacy
- Availability
- Account preferences

Do not independently certify medical eligibility. Eligibility must be determined by qualified professionals and applicable donation guidelines.

## 9. Hospital portal

Routes:

- `/hospital/dashboard`
- `/hospital/requests`
- `/hospital/inventory`
- `/hospital/donors`
- `/hospital/network`
- `/hospital/reports`
- `/hospital/notifications`
- `/hospital/profile`
- `/hospital/settings`

Dashboard:
- Active requests
- Emergency requests
- Inventory summaries
- Critical inventory alerts
- Donor responses
- Fulfilled requests
- Recent activity

### Emergency request creation

Fields:
- Required blood group
- Units required
- Hospital department
- Required date and time
- Priority
- Location
- Authorized case reference
- Notes

Priority:
- Critical
- Emergency
- Urgent
- Normal

Request workflow:
1. Validate the form.
2. Save the request.
3. Find compatible donor candidates.
4. Rank suitable candidates.
5. Display matches with clear explanations.
6. Send in-app notifications.
7. Track responses.
8. Allow authorized staff to confirm and close the request.

Hospital staff must be able to view, edit, cancel, and close their own requests according to the request's current status.

### Blood inventory

Track all eight blood groups with:
- Available units
- Configurable low-stock threshold
- Status
- Last updated time

Inventory data is operational demo data unless connected to a verified blood-bank system. Never imply that simulated inventory represents confirmed real-world availability.

## 10. NGO portal

Routes:

- `/ngo/dashboard`
- `/ngo/campaigns`
- `/ngo/blood-drives`
- `/ngo/donors`
- `/ngo/hospitals`
- `/ngo/requests`
- `/ngo/reports`
- `/ngo/notifications`
- `/ngo/profile`
- `/ngo/settings`

Dashboard:
- Active campaigns
- Registered donors
- Blood drives
- Participating hospitals
- Donations recorded
- Campaign performance

Campaign management:
- Create campaign
- Edit campaign
- View campaign details
- Register participants
- Track progress
- Cancel a campaign

Campaign fields:
- Campaign name
- Description
- Date and time
- Location
- Target donations
- Required blood groups
- Partner hospital
- Contact details
- Campaign status

Donor coordination:
- Search and filter donors
- View consented participant details
- Manage registrations
- Coordinate campaigns

Hospital coordination:
- View participating hospitals
- View authorized requests
- Track collaboration
- Manage campaign partnerships

NGOs must not be granted unrestricted access to hospital or donor data.

## 11. Smart donor matching

Create a reusable matching service.

Potential criteria:
- Blood group compatibility
- Verified availability
- Approximate distance
- Hospital-defined urgency
- Donation eligibility confirmed by an appropriate professional
- Donor response history, if sufficient data exists

Return:
- Candidate list
- Match explanation
- Compatibility result
- Distance when location permission exists
- Availability status
- Request status

Do not present an arbitrary percentage as a medically validated probability of success. If using a ranking score, label it as an operational ranking score and explain its criteria.

Never contact donors through external channels without appropriate consent and authorization.

## 12. Maps and location

Use Leaflet and OpenStreetMap if appropriate.

Map layers may include:
- Participating hospitals
- Public blood banks
- NGO locations
- Emergency request locations
- Donor locations only where sharing is explicitly permitted

Features:
- Map and list views
- Search by location
- Filter markers
- Marker detail cards
- Approximate distance
- Directions link where appropriate

Use approximate or deliberately generalized donor locations in public-facing views.

## 13. Emergency response workflow

Implement explicit request states:

- `OPEN`
- `MATCHING`
- `RESPONSES_RECEIVED`
- `DONOR_CONFIRMED`
- `IN_PROGRESS`
- `FULFILLED`
- `CANCELLED`
- `EXPIRED`

Enforce valid state transitions in the business logic.

Show a request timeline:
1. Request created
2. Matching started
3. Donor responses received
4. Donor confirmation
5. Donation coordination
6. Request closed

Use confirmation dialogs for cancellations and other destructive actions.

Do not mark a request fulfilled merely because a donor clicked Accept.

## 14. Notifications

Provide:
- Notification bell
- Unread count
- Notification dropdown
- Notification center
- Read/unread state
- Mark all as read
- Relevant filters

Events:
- New emergency request
- Compatible request invitation
- Donor response
- Request status change
- Campaign invitation
- Campaign reminder
- Account and security event

Generate notifications from real application events. Do not rely solely on static placeholder notifications.

## 15. Reports and analytics

Use Recharts.

Donor reports:
- Donation history
- Monthly activity
- Recorded donation impact

Hospital reports:
- Requests by blood group
- Fulfillment trends
- Emergency request counts
- Inventory trends
- Donor response rate

NGO reports:
- Campaign performance
- Donor participation
- Recorded donations
- Blood group distribution

Include date filters, chart legends, accessible data labels, empty states, and export functionality where appropriate.

Clearly distinguish sample data from verified production data.

## 16. Profiles and settings

Build separate profile and settings pages for each role.

Include:
- Profile editing
- Field validation
- Save and cancel
- Success and error feedback
- Password/account security settings
- Notification preferences
- Privacy controls
- Role-specific organization information

Only authorized users may update organization information or operational records.

## 17. Database and backend

Create a maintainable data-access layer.

Suggested entities:
- `users`
- `donor_profiles`
- `hospital_profiles`
- `ngo_profiles`
- `blood_requests`
- `donor_responses`
- `donations`
- `blood_inventory`
- `campaigns`
- `campaign_registrations`
- `blood_drives`
- `notifications`
- `locations`
- `audit_events`

Use relational constraints, migrations, timestamps, indexes, and appropriate foreign keys.

Implement row-level security and backend authorization.

Validate data on the server.

Keep service-role credentials out of browser code.

Provide demo seed data separately from production data.

Do not invent integrations with real hospitals, blood banks, messaging services, or external medical systems.

## 18. Engineering quality

Requirements:
- Reusable components
- Strict TypeScript
- Consistent error handling
- No dead buttons
- No broken routes
- No duplicated business logic
- Accessible form labels
- Responsive layouts
- Loading and empty states
- Useful inline validation
- Unit tests for business logic
- End-to-end tests for critical workflows

Add tests for blood compatibility and emergency request state transitions.

## 19. Mandatory development phases

Phase 0: Repository inspection, written feature specification, route map, data model, UI system, and implementation plan.

Phase 1: Project foundation and reusable design system.

Phase 2: Public website and landing page.

Phase 3: Authentication, registration, and three-role authorization.

Phase 4: Blood compatibility engine.

Phase 5: Donor portal.

Phase 6: Smart donor matching.

Phase 7: Hospital portal.

Phase 8: NGO portal.

Phase 9: Find blood and maps.

Phase 10: Emergency response workflow.

Phase 11: Notifications.

Phase 12: Reports and analytics.

Phase 13: Profiles and settings.

Phase 14: Persistent backend, migrations, security, and data integration.

Phase 15: Reference-based visual refinement.

Phase 16: Full QA and production-readiness audit.

## 20. Mandatory development rules

- Implement one phase at a time.
- Run the application after each phase.
- Fix errors before moving forward.
- Do not delete working features while implementing new ones.
- Do not replace working functionality with placeholders.
- Reuse shared components.
- Update project documentation when architecture changes.
- Never claim that an untested feature works.
- Keep an explicit list of incomplete features.
- Stop at the end of each phase and wait for approval before starting the next one.

## 21. Definition of done

Drop4Life is complete when all three roles can authenticate, access their permitted dashboards, complete their core workflows, interact with persistent data, receive relevant notifications, and use the public website responsively.

All critical routes and business rules must be tested.

**Start with Phase 0 only. Do not implement the entire application in one pass.**
