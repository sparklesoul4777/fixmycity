# FixMyCity — Smart City Issue Tracking & Management Platform

> **Empowering Citizens to Fix Their City with AI-Powered Smart Response**

A comprehensive, full-stack smart city management platform that enables citizens to report, track, and resolve urban infrastructure issues. Powered by AI analysis, real-time geolocation, and intelligent admin dashboards for municipal management.

---

## 🌍 Project Overview

**FixMyCity** is an intelligent civic issue management system designed to bridge the gap between citizens and city administration. It transforms how cities respond to infrastructure problems by:

- **Democratizing Problem Reporting**: Citizens can easily report city issues with photos, location, and detailed descriptions
- **AI-Powered Triage**: Gemini AI automatically analyzes issues to determine priority levels and appropriate departments
- **Real-Time Tracking**: Citizens and admins monitor issue resolution in real-time with complete history
- **Multi-Dimensional Monitoring**: Track infrastructure health, security vulnerabilities, and resource capacity
- **Intelligent Escalation**: Automatic escalation to higher authorities based on issue severity and SLA violations
- **Data-Driven Insights**: Comprehensive dashboards showing city health metrics, issue patterns, and resource utilization

The platform serves two primary user roles:

- **Citizens**: Report and track issues, rate resolutions, receive updates
- **Admins**: Manage issues, assign tasks, monitor city infrastructure health, and detect security anomalies

---

## ✨ Key Features

### 👥 For Citizens

- **Issue Reporting**: Submit city problems with photos, descriptions, and precise GPS coordinates
- **Category Selection**: 8 predefined categories covering roads, utilities, sanitation, and safety
- **Real-Time Tracking**: Monitor issue status from reported → acknowledged → resolved
- **Map Visualization**: Browse and locate all reported issues on an interactive map
- **Issue Upvoting**: Community validation system to prioritize issues
- **Resolution Rating**: Rate completed issues and provide feedback on admin handling
- **Notifications**: Stay informed of status changes and administrative updates

### 🛡️ For Administrators

- **Unified Dashboard**: Overview of all city issues with key metrics and trends
- **Smart Assignment**: Assign issues to field officers with SLA deadline tracking
- **Infrastructure Monitoring**: Track health status and issue counts for city assets
- **Security Monitoring**: Real-time detection of suspicious activities and security anomalies
- **Capacity Planning**: Monitor hospital bed capacity, road congestion, and water supply levels
- **Escalation Management**: Escalate critical issues to higher authorities with documentation
- **Analytics & Reporting**: Visual dashboards with charts, graphs, and downloadable reports
- **Multi-Department Management**: Route issues to appropriate city departments

### 🤖 AI-Powered Intelligence

- **Automatic Issue Analysis**: Gemini AI analyzes issue descriptions to determine:
  - Priority level (Emergency → Low)
  - Suggested department for handling
  - Detailed analytical summary
  - Actionable steps for resolution
- **Smart Routing**: Issues automatically suggested to the most appropriate department
- **Pattern Recognition**: AI identifies trends in city problems for proactive planning

### 🔒 Security & Compliance

- **Role-Based Access Control**: Separate citizen and admin portals with restricted access
- **Security Logging**: Comprehensive audit trails for all system activities
- **Suspicious Activity Detection**: Real-time alerts for unusual system behavior
- **Data Protection**: Secure Firebase authentication with Google OAuth support
- **Privacy Compliance**: Citizen data protection with granular access controls

### 📊 Advanced Monitoring

- **Infrastructure Assets**: Track roads, water mains, electrical grids with health scores (1-100)
- **Hospital Capacity**: Real-time bed availability and utilization metrics
- **Road Congestion**: Monitor traffic patterns and identify bottlenecks
- **Water Supply**: Track water zone supply and demand levels
- **Smart Response**: Integrated response system coordinating multiple departments

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│            FixMyCity Application Stack                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────── Frontend Layer ──────────────────┐  │
│  │  React 18 + TypeScript + Vite + Tailwind CSS    │  │
│  │  • SPA with client-side routing (React Router)  │  │
│  │  • Component library (shadcn/ui - Radix UI)     │  │
│  │  • State management (TanStack React Query)      │  │
│  │  • Real-time data subscriptions                 │  │
│  └────────────────────────────────────────────────┘  │
│                        ↓                               │
│  ┌──────────────── API Layer ──────────────────────┐  │
│  │  Firebase Realtime APIs                         │  │
│  │  • Cloud Firestore (NoSQL Database)             │  │
│  │  • Firebase Authentication                      │  │
│  │  • Firebase Storage (Image uploads)             │  │
│  │  • Server-side timestamp management             │  │
│  └────────────────────────────────────────────────┘  │
│                        ↓                               │
│  ┌──────────────── Service Layer ──────────────────┐  │
│  │  Business Logic & External Integrations         │  │
│  │  • Issue Management Service                     │  │
│  │  • Security Logging Service                     │  │
│  │  • Infrastructure Asset Service                 │  │
│  │  • Capacity Monitoring Service                  │  │
│  │  • AI Analysis Service (Gemini Integration)     │  │
│  └────────────────────────────────────────────────┘  │
│                        ↓                               │
│  ┌──────────────── Data Layer ───────────────────┐   │
│  │  Firebase Firestore Collections                │   │
│  │  • /issues (citizen reports & tracking)        │   │
│  │  • /users (authentication & profiles)          │   │
│  │  • /security_logs (audit trails)               │   │
│  │  • /infrastructure (asset monitoring)          │   │
│  │  • /capacity_{hospitals,roads,water}          │   │
│  └────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Data Flow Example: Issue Reporting

```
1. Citizen captures photo & fills report form
   ↓
2. Frontend validates & uploads image to Firebase Storage
   ↓
3. AI Service analyzes issue description via Gemini API
   ↓
4. Issue document created in Firestore with AI analysis
   ↓
5. Security logging records the submission
   ↓
6. Admin dashboard receives real-time update via snapshot listener
   ↓
7. Admin reviews, assigns to officer, sets SLA deadline
   ↓
8. Citizen receives notification of status change
   ↓
9. Officer completes work and updates status
   ↓
10. Citizen rates resolution and provides feedback
```

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite (ultra-fast dev experience)
- **Styling**: Tailwind CSS 3.x + CSS Modules
- **UI Component Library**: shadcn/ui (Radix UI primitives)
- **Routing**: React Router DOM v6
- **Forms**: React Hook Form + Zod validation
- **State Management**: TanStack React Query v5 (server state)
- **Charts & Visualization**: Recharts, Leaflet (maps)
- **Animation**: Framer Motion
- **Toasts/Notifications**: Sonner
- **Icons**: Lucide React

### Backend & Database

- **Authentication**: Firebase Authentication (Email/Password + Google OAuth)
- **Database**: Firebase Firestore (NoSQL, real-time)
- **File Storage**: Firebase Storage (image uploads)
- **Backend Rules**: Firestore Security Rules

### AI & External Services

- **AI Analysis**: Google Generative AI (Gemini 1.5 Flash)
- **Geolocation**: Browser Geolocation API + Leaflet maps

### Development & Testing

- **Testing Framework**: Vitest + React Testing Library
- **Linting**: ESLint
- **Code Quality**: TypeScript strict mode
- **Package Manager**: Bun
- **Deployment**: Vercel configuration included

---

## 📁 Project Structure

```
FixMyCityFinal/
│
├── src/
│   ├── components/
│   │   ├── Layout.tsx                 # Main app layout wrapper
│   │   ├── ProtectedRoute.tsx         # Role-based access control
│   │   ├── IssueCard.tsx              # Issue display component
│   │   ├── RatingModal.tsx            # Issue rating UI
│   │   ├── StatusBadge.tsx            # Status visualization
│   │   └── ui/                        # shadcn/ui components (50+ components)
│   │       ├── button.tsx, input.tsx, dialog.tsx
│   │       ├── accordion.tsx, carousel.tsx, tabs.tsx
│   │       └── ... (full shadcn/ui library)
│   │
│   ├── pages/
│   │   ├── Index.tsx                  # Home page / landing
│   │   ├── Auth.tsx                   # Login & signup portal
│   │   ├── ReportIssue.tsx            # Issue creation form
│   │   ├── IssuesList.tsx             # Issue listing & filtering
│   │   ├── IssueDetail.tsx            # Issue detail view
│   │   ├── MapView.tsx                # Geolocation-based issue map
│   │   ├── Notifications.tsx          # User notifications
│   │   │
│   │   ├── AdminDashboard.tsx         # Main admin dashboard
│   │   ├── AdminInfrastructure.tsx    # Infrastructure monitoring
│   │   ├── AdminSecurity.tsx          # Security logs & anomalies
│   │   ├── AdminSmartResponse.tsx     # Multi-department coordination
│   │   ├── AdminCapacityMonitor.tsx   # Resource capacity tracking
│   │   │
│   │   ├── CitizenSecurity.tsx        # Citizen security info
│   │   ├── CitizenInfrastructure.tsx  # Citizen infrastructure view
│   │   ├── CitizenSmartResponse.tsx   # Citizen smart response tracking
│   │   ├── CitizenCapacityMonitor.tsx # Citizen capacity awareness
│   │   │
│   │   └── NotFound.tsx               # 404 error page
│   │
│   ├── services/
│   │   ├── issueService.ts            # CRUD for issues, status updates, history
│   │   ├── aiService.ts               # Gemini AI integration & analysis
│   │   ├── securityService.ts         # Audit logging, suspicious activity
│   │   ├── infrastructureService.ts   # Asset management & health tracking
│   │   ├── capacityService.ts         # Hospital, road, water capacity monitoring
│   │   └── (service interfaces & implementations)
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx            # Global auth state (user, login, logout)
│   │
│   ├── hooks/
│   │   ├── use-toast.ts               # Toast notifications hook
│   │   └── use-mobile.tsx             # Responsive design hook
│   │
│   ├── lib/
│   │   ├── firebase.ts                # Firebase initialization & exports
│   │   └── utils.ts                   # Utility functions
│   │
│   ├── data/
│   │   ├── mockData.ts                # Mock users and officers
│   │   └── capacityData.ts            # Seed data for capacity entities
│   │
│   ├── types/
│   │   └── index.ts                   # TypeScript interfaces & types
│   │
│   ├── App.tsx                        # Main app component with routing
│   ├── main.tsx                       # React DOM entry point
│   ├── App.css                        # Global styles
│   ├── index.css                      # Tailwind directives
│   └── vite-env.d.ts                  # Vite environment types
│
├── public/
│   └── robots.txt                     # SEO robots directive
│
├── test/
│   ├── example.test.ts                # Test example
│   └── setup.ts                       # Test configuration
│
├── Configuration Files
│   ├── vite.config.ts                 # Vite build configuration
│   ├── tsconfig.json                  # TypeScript configuration
│   ├── tsconfig.app.json              # App-specific TS config
│   ├── tailwind.config.ts             # Tailwind CSS theme configuration
│   ├── postcss.config.js              # PostCSS configuration
│   ├── eslint.config.js               # Linting rules
│   ├── components.json                # shadcn/ui configuration
│   ├── package.json                   # Dependencies & scripts
│   ├── vercel.json                    # Vercel deployment config
│   └── firestore.rules                # Firestore security rules
│
├── index.html                         # HTML entry point
├── README.md                          # This file
└── build_error.txt                    # Build logs (if applicable)
```

**Key Directories Explained:**

- **`/pages`**: Complete page components for each route (both citizen and admin views)
- **`/services`**: Business logic abstraction layer communicating with Firebase and external APIs
- **`/components/ui`**: 50+ pre-built, accessible UI components from shadcn/ui
- **`/contexts`**: Global state management (authentication context)
- **`/types`**: Centralized TypeScript type definitions ensuring type safety

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** 18.x or higher
- **npm**, **yarn**, **bun**, or **pnpm** (Bun recommended for faster installs)
- **Firebase Account** with a Firestore project set up
- **Google Generative AI API Key** (for Gemini integration)
- **Git** (for cloning the repository)

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/fixmycity.git
cd fixmycity/FixMyCityFinal
```

### Step 2: Install Dependencies

```bash
bun install
# OR with npm:
npm install
# OR with yarn:
yarn install
```

### Step 3: Configure Environment Variables

Create a `.env.local` file in the project root with your Firebase and AI credentials:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Google Generative AI (Gemini)
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### Step 4: Set Up Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create or select your project
3. Create a Firestore database (choose test mode for development, production for deployment)
4. Enable Authentication methods:
   - Email/Password authentication
   - Google OAuth provider
5. Enable Firebase Storage for image uploads
6. Upload `firestore.rules` to your database security rules

### Step 5: Run the Development Server

```bash
bun run dev
# OR with npm:
npm run dev
```

The application will be available at `http://localhost:8080`

### Step 6: Build for Production

```bash
bun run build
# OR with npm:
npm run build
```

Production files will be in the `dist/` directory.

### Additional Commands

```bash
# Run tests
bun run test
# OR watch mode:
bun run test:watch

# Lint code
bun run lint

# Preview production build locally
bun run preview
```

---

## 📖 How to Use the System

### For Citizens

#### 1. **Authentication**

- Navigate to `/auth`
- Sign up with email/password or Google account
- Select "Citizen" role
- Email verification (if configured)

#### 2. **Report an Issue**

- Click "Report Issue" from home or navigation
- Fill in issue details:
  - **Title**: Brief issue description
  - **Category**: Select from 8 predefined categories
  - **Description**: Detailed explanation
  - **Photo**: Upload an image (optional but recommended)
  - **Location**: Use current or manually select on map
- Submit→ AI analyzes the issue automatically
- Receive confirmation with issue ID

#### 3. **Track Issues**

- View "My Issues" list showing personal reports
- See all city issues in "Issues" tab
- Click issue card for detailed view with:
  - Status history
  - Admin comments
  - Progress updates
  - Geolocation on map

#### 4. **Community Features**

- **Upvote** issues to show community support
- **Rate resolutions** after issue closure (1-5 stars)
- **Provide feedback** on admin handling
- **Upload photos** as part of resolution feedback

#### 5. **Map View**

- Explore all reported issues on interactive Leaflet map
- Click markers to see issue details
- Filter by category or status
- See density of problems in different areas

### For Administrators

#### 1. **Admin Authentication**

- Navigate to `/auth` and login with admin account
- Select "Admin" role during signup

#### 2. **Dashboard Overview** (`/admin`)

Shows comprehensive metrics:

- **Total Issues**: Count by status (reported, acknowledged, in-progress, resolved)
- **Response Time**: Average time to acknowledge
- **Category Distribution**: Pie chart of issue types
- **Status Trends**: Area chart showing issue flow over time
- **Department Load**: Heat map of issue distribution
- **Pending SLA**: Issues approaching deadline

#### 3. **Issue Management**

- View all citizen reports with filters:
  - By status (reported → resolved)
  - By priority (emergency → low)
  - By category
  - By date range
  - By assignment status
- For each issue:
  - **View Details**: Full description, photos, location
  - **Assign**: Select field officer and set SLA deadline
  - **Update Status**: Move through workflow
  - **Add Notes**: Internal admin comments
  - **Escalate**: Move to higher authority with reason
  - **Rate Citizen Feedback**: Review and document citizen satisfaction

#### 4. **Infrastructure Monitoring** (`/admin/infrastructure`)

- View all city infrastructure assets:
  - **Asset Name & Type**: Road, bridge, water main, electrical grid, etc.
  - **Health Score**: 1-100 numeric health percentage
  - **Status**: Healthy, Degraded, Critical
  - **Associated Issues**: Count of open issues linked to asset
  - **Last Inspection**: Most recent inspection date
- Update asset health based on issue resolution
- Create new infrastructure assets
- Mark for maintenance or inspection

#### 5. **Security Monitoring** (`/admin/security`)

Real-time security dashboard:

- **Suspicious Activities**: AI-flagged unusual system behavior
- **Activity Audits**: Complete log of all user actions
- **Security Categories**: Auth, data access, system, privacy concerns
- **Severity Levels**: Low → Critical
- **IP Address Tracking**: Monitor user locations
- **Export Logs**: Download audit trail for compliance

#### 6. **Capacity Planning** (`/admin/capacity`)

Monitor city resources:

**Hospitals**

- Bed capacity (total vs. occupied)
- Utilization percentage
- Alert thresholds (e.g., >80% capacity)
- Emergency vs. normal beds

**Roads**

- Traffic congestion levels
- Average speed metrics
- Peak hours analysis
- Incidents per zone

**Water Supply**

- Supply zones and coverage areas
- Water availability (liters/day)
- Demand levels
- Supply/demand ratio

**Smart Response Integration**

- Coordinate multi-department actions
- Link related issues to single response
- Track response team assignments
- Escalate cross-department issues

---

## 💼 Example Workflow: End-to-End Issue Resolution

### Scenario: Pothole on Main Street

**Timeline:**

#### T+0 min: Citizen Reports Issue

```
1. Citizen snaps photo of pothole
2. Opens FixMyCity app → "Report Issue"
3. Fills in:
   - Title: "Large pothole on Main Street between 5th and 6th Ave"
   - Category: "Roads & Infrastructure"
   - Description: "Dangerous pothole causing traffic accidents"
   - Photo: uploads image
   - Location: GPS-enabled (39.7392°N, 104.9903°W)
4. System submits to Firestore
```

#### T+1 min: AI Analysis

```
Gemini AI analyzes the issue:
{
  "priority": "High",
  "suggestedDept": "Public Works",
  "analysis": "Traffic safety hazard requiring urgent road repair",
  "actionItems": [
    "Inspect pothole depth and surrounding pavement",
    "Determine repair method (patching vs overlay)",
    "Schedule work during low-traffic hours",
    "Apply temporary warning markers"
  ]
}
```

#### T+15 min: Admin Review

```
1. Admin Dashboard alerts of new HIGH priority issue
2. Admin opens issue detail:
   - Sees photo, description, AI analysis
   - Verifies location on map
   - Confirms suggested department (Public Works)
3. Admin:
   - Updates status: "reported" → "acknowledged"
   - Assigns to: "John Smith" (Public Works Officer)
   - Sets SLA deadline: +3 days (72 hours)
   - Adds note: "Approved for emergency repair. Check traffic patterns first."
4. System logs activity to security audit
```

#### T+16 min: Citizen Notification

```
Citizen receives notification:
- Status changed to "Acknowledged"
- Assigned Officer: John Smith (Public Works)
- Expected Resolution: [deadline date]
- Link to detailed updates
```

#### T+2 hours: Officer Assessment

```
1. Officer visits location
2. Photographs pothole dimensions
3. Updates status: "acknowledged" → "verified"
4. Adds field notes: "Pothole 6 inches deep, 2 feet diameter.
   Requires full pothole seal patch. No sub-base damage."
```

#### T+1 day: Work Scheduled

```
1. Officer schedules repair for next day 10 PM (off-peak)
2. Updates status: "verified" → "in-progress"
3. System adds temporary closure notice to issue
4. Citizen receives: "Work scheduled for [date] [time]"
```

#### T+2 days: Work Completion

```
1. Officer completes repair
2. Takes completion photo
3. Updates status: "in-progress" → "resolved"
4. Adds completion note: "Pothole sealed with hot asphalt patch.
   Road tested and stable."
```

#### T+2 days: Citizen Rating

```
1. Citizen receives notification: Issue resolved
2. Opens rating modal
3. Rates response: ⭐⭐⭐⭐⭐ (5 stars)
4. Comments: "Quick response and professional work. Thank you!"
5. Optionally uploads photo of completed repair
6. System records feedback
```

#### T+3 days: Resolution Dashboard

```
Admin dashboard updated:
- Issue #12345: RESOLVED (2-day completion)
- Response Rate: Acknowledged in 15 minutes ✓
- SLA Status: Met (3-day SLA) ✓
- Citizen Rating: 5/5 stars ✓
- Department: Public Works ✓
```

**Database Collections Updated:**

- ✅ `/issues/12345` - Full history recorded
- ✅ `/security_logs` - All actions logged
- ✅ `/infrastructure` - Asset health updated
- ✅ Analytics tracked for dashboard

---

## 🎯 Key Features in Detail

### AI-Powered Analysis

The system integrates Google's Gemini 1.5 Flash API to automatically analyze issue descriptions and:

- Determine appropriate **priority levels** based on safety and impact
- Suggest the **best department** for handling (Public Works, Sanitation, etc.)
- Generate **action items** for resolution
- Provide **analytical summaries** for quick admin review
- Fall back to predefined rules if API unavailable

**Prompt Engineering**: Issues are analyzed with context-aware prompts that consider:

- Category of issue
- Keywords indicating urgency
- Common patterns in city maintenance
- Standard operating procedures for departments

### Real-Time Database Subscriptions

Using Firestore's snapshot listeners:

- Admin dashboards auto-update when new issues reported
- Citizens see status changes instantly (no page refresh needed)
- Security alerts trigger in real-time when suspicious activity detected
- Capacity levels update continuously as demand changes

### Role-Based Access Control

- **Citizens** can only see/edit their own issues and public information
- **Admins** can access all issues, user data, and system logs
- **Field Officers** see assigned issues only
- Implemented via `ProtectedRoute` component and Firestore security rules

### Geolocation Integration

- **Automatic GPS** capture with browser's Geolocation API
- **Manual Selection** via Leaflet map interface
- **Leaflet Maps** display all issues with clickable markers
- **Distance Filtering** to show nearby issues
- **Address Lookup** (future enhancement)

### Multi-Department Coordination

Smart Response module enables:

- Linking multiple issues into single coordinated response
- Assigning tasks to multiple departments simultaneously
- Cross-department communication through notes
- Consolidated resolution tracking

### Infrastructure Health Scoring

Assets tracked include:

- Roads (potholes, surface condition, traffic)
- Water mains (pressure, leaks, supply capacity)
- Electrical grids (outages, efficiency)
- Public facilities (condition, maintenance needs)

Health calculated as: **100 − (issueCount × severity) − age penalty**

### Security & Audit Logging

Every action logged with:

- User ID and name
- Action performed
- Timestamp
- IP address (for investigations)
- Severity classification
- Suspicious activity flagging for anomaly detection

---

## 🔐 Security & Privacy

### Authentication

- **Firebase Auth**: Industry-standard email/password validation
- **Google OAuth**: Single sign-on with Google accounts
- **Session Management**: Automatic token refresh and expiry
- **Password Requirements**: Enforced strong password policies (if configured)

### Data Protection

- **Firestore Rules**: Row-level security controls who can read/write data
- **Encrypted Transport**: HTTPS for all communications
- **Role-Based Access**: Citizens cannot access admin data
- **Field-Level Security**: Sensitive fields (IP logs) restricted

### Compliance

- **GDPR Ready**: User data deletion on request
- **Data Privacy**: Personal information segregated from logs
- **Audit Trail**: All actions logged for compliance reports
- **Right to Access**: Users can download their data

---

## 📊 Dashboard Metrics & Visualizations

### Admin Dashboard Charts

1. **Issue Status Distribution** (Pie Chart)
   - Visual breakdown of issues by status
   - Click to filter issue list

2. **Resolution Trends** (Area Chart)
   - Timeline of issue volume
   - Overlaid with resolution rate
   - Identify seasonal patterns

3. **Department Workload** (Bar Chart)
   - Issues assigned per department
   - Capacity visualization
   - Load balancing insights

4. **Average Response Time** (KPI Card)
   - Median time from report to acknowledgment
   - Target vs. actual performance
   - Trend indicator (↑↓)

5. **Pending SLA Issues** (Table)
   - Issues approaching deadline
   - Override options for extensions
   - Critical flag for overdue issues

### Capacity Monitoring Dashboard

- **Hospital Beds**: Current utilization with capacity bars
- **Road Traffic**: Color-coded congestion status
- **Water Supply**: Supply vs. demand ratio gauge
- **Alerts**: Critical capacity threshold notifications

---

## 🧪 Testing

The project includes a testing setup with Vitest and React Testing Library:

```bash
# Run all tests once
bun run test

# Run tests in watch mode (continuous)
bun run test:watch
```

**Test Files Location**: `src/test/`

Test examples included for:

- Component rendering
- User interactions
- Service functions
- Type safety validation

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push repository to GitHub
2. Connect GitHub repo to Vercel
3. Set environment variables in Vercel dashboard:
   ```
   VITE_FIREBASE_API_KEY
   VITE_FIREBASE_AUTH_DOMAIN
   ... (all VITE_* variables)
   ```
4. Vercel auto-builds and deploys on push

### Deploy to Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Build project
bun run build

# Deploy
firebase deploy
```

### Deploy to Other Platforms

The `dist/` folder after `npm run build` contains static files ready for:

- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Azure Static Web Apps
- Docker containers

---

## 📈 Future Improvements & Roadmap

### Phase 2 Features

- **Mobile App**: React Native version for iOS/Android
- **SMS Notifications**: Text-based alerts for critical issues
- **Email Digest**: Weekly city report summaries
- **Payment Integration**: Handle fine/permit payments
- **Weather API**: Factor weather into issue resolution
- **Predictive Analytics**: ML-based issue forecasting

### Phase 3 Enhancements

- **AR Navigation**: Augmented reality for field officers
- **Blockchain Ledger**: Immutable issue history
- **Computer Vision**: Image analysis for automatic categorization
- **Multi-Language Support**: Internationalization
- **Advanced WebRTC**: Voice/video communication in app
- **IoT Sensor Integration**: Real-time sensor data for assets

### Known Limitations

- Currently optimized for single-city deployments
- Batch email/SMS not yet implemented
- Offline sync not yet supported
- Multi-city federation in progress

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes
4. Write or update tests
5. Commit with clear message:
   ```bash
   git commit -m "feat: Add feature description"
   ```
6. Push and create Pull Request

**Contribution Guidelines**:

- Follow existing code style
- Write tests for new features
- Update TypeScript types
- Document complex logic

---

## 📝 License

This project is provided for educational and hackathon purposes.

---

## 👥 Contributors & Team

#### Development Team

- **Architecture & Backend Services**: Team Lead
- **Frontend UI/UX**: Component Lead
- **AI Integration**: Gemini API Lead
- **Database & Security**: Firebase Specialist

#### Credits

- **shadcn/ui**: Component library (Radix UI)
- **Firebase**: Backend infrastructure
- **Google Generative AI**: Gemini API
- **Vercel**: Hosting & deployment

---

## 📞 Support & Contact

### How to Get Help

- **Issue Tracking**: Check existing GitHub issues
- **Documentation**: See README sections above
- **Code Examples**: Check the `src/` directory structure
- **Configuration Help**: See `.env.local` setup section

### Quick Links

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Google Generative AI Docs](https://ai.google.dev)

---

## 🎉 Acknowledgments

Built with modern web technologies and best practices for a production-ready smart city platform. Special thanks to:

- **Firebase** for reliable backend
- **Google AI** for intelligent analysis
- **React Community** for excellent tooling
- **shadcn/ui** for beautiful components
- **TailwindCSS** for rapid styling

---

**FixMyCity** — Making cities smarter, one report at a time.

_Last Updated: March 2026 | Version: 1.0.0_
