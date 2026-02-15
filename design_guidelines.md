# Design Guidelines: Premium Quiz Bot Telegram Mini App

## Design Approach: Reference-Based
**Primary Reference:** Telegram Mini App design patterns combined with modern dashboard aesthetics similar to Duolingo, Notion, and Linear interfaces.

**Design Philosophy:** Create a mobile-first, app-like experience that feels native to Telegram while providing a professional, engaging quiz management interface. The design should be vibrant, modern, and optimized for quick interactions within the Telegram ecosystem.

---

## Core Design Elements

### Typography
- **Primary Font:** Inter or SF Pro Display via Google Fonts
- **Headings:** 
  - Page Titles: 24-28px, Bold (700)
  - Section Headers: 18-20px, Semibold (600)
  - Card Titles: 16px, Semibold (600)
- **Body Text:**
  - Primary: 14-16px, Regular (400)
  - Secondary/Meta: 12-14px, Regular (400)
  - Numbers/Stats: 24-32px, Bold (700)
- **Buttons:** 14-16px, Medium (500)

### Layout System
**Spacing Units:** Tailwind units of 2, 4, 6, and 8 for consistency
- Component padding: p-4 to p-6
- Card spacing: gap-4
- Section margins: mb-6 to mb-8
- Container padding: px-4

**Grid System:**
- Statistics cards: 2-column grid on mobile (grid-cols-2 gap-4)
- Quick actions: Single column list with full-width buttons
- Content max-width: max-w-md (centered for mobile app feel)

---

## Color Palette & Visual Treatment

### Gradient System
- **Primary Gradient:** Purple (#8B5CF6) to Blue (#3B82F6) diagonal gradient
- **Card Backgrounds:** White with subtle shadow (rgba(0,0,0,0.05))
- **Accent Colors:**
  - Success/Engagement: Emerald (#10B981)
  - Warning/Premium: Amber (#F59E0B)
  - Text Primary: Gray-900 (#111827)
  - Text Secondary: Gray-600 (#4B5563)

### Component Styling
- **Cards:** Rounded-2xl (rounded-2xl), subtle shadow, white background
- **Buttons:** Rounded-xl (rounded-xl) with gradient or solid fills
- **Icons:** 20-24px, matching text color or gradient accent

---

## Component Library

### Navigation
- **Bottom Tab Bar:**
  - Fixed at bottom with backdrop blur
  - 3 main tabs: Dashboard, Create, My Quizzes
  - Active state: Gradient text + icon color
  - Inactive state: Gray-500 color
  - Tab height: h-16 with safe area padding

### Dashboard Components

**1. Welcome Header**
- Gradient background (purple to blue diagonal)
- White text with user greeting "Welcome Back, [Username]!"
- User avatar/icon in top-right
- Dark mode toggle icon
- Padding: p-6

**2. Statistics Cards (2x2 Grid)**
- Card structure: White background, rounded-2xl, p-4
- Each card contains:
  - Large number display (32px, bold)
  - Label below (14px, gray-600)
  - Small icon in top-right corner (20px)
- Cards: Total Quizzes, Free Quizzes, Paid Quizzes, Engagement
- Grid: grid-cols-2 gap-4

**3. Quick Actions Section**
- Header: "Quick Actions" (18px, semibold, mb-4)
- Action buttons: Full-width, left-aligned with icons
- Button style: White background, border, rounded-xl, p-4
- Each button: Icon (left) + Text + Chevron (right)
- Gap between buttons: gap-3

### Create Quiz Page
- Form-based interface with input fields
- Section headers for organization
- Quiz type selector (Free/Paid toggle or buttons)
- Question builder with add/remove functionality
- Save as Draft + Publish buttons at bottom

### My Quizzes Page
- List view of created quizzes
- Each quiz card shows:
  - Quiz title (16px, semibold)
  - Type badge (Free/Paid with color coding)
  - Stats: Questions count, Participants
  - Edit/Delete action buttons
- Filter tabs: All, Free, Paid, Draft
- Empty state illustration when no quizzes exist

### Buttons & CTAs
- **Primary Button:** Gradient background (purple to blue), white text, rounded-xl, px-6 py-3
- **Secondary Button:** White background, gradient border, gradient text, rounded-xl, px-6 py-3
- **Icon Button:** Square with rounded-lg, subtle background, centered icon
- **Danger Button:** Red background for delete actions

---

## Interaction Patterns

### Micro-interactions
- Card tap: Gentle scale down (95%) on press
- Button press: Slight opacity change (0.9)
- Tab switch: Smooth color transition
- Page transitions: Slide animation (left/right for navigation)

### Loading States
- Skeleton loaders for cards (shimmer effect)
- Spinner for form submissions
- Progress indicators for quiz creation

### Feedback
- Toast notifications for success/error (top of screen, slides down)
- Haptic feedback on important actions (Telegram WebApp API)
- Confirmation dialogs for destructive actions

---

## Mobile Optimization

### Touch Targets
- Minimum touch area: 44x44px for all interactive elements
- Adequate spacing between tappable items (minimum 8px)
- Comfortable thumb zones for bottom navigation

### Safe Areas
- Account for iOS notch and Android navigation
- Bottom navigation includes safe-area-inset-bottom
- Top header accounts for status bar

### Performance
- Minimize animations to avoid lag
- Lazy load quiz lists
- Optimize images (icons as SVG via Heroicons CDN)

---

## Accessibility

- High contrast ratios (4.5:1 minimum for text)
- Clear focus states for keyboard navigation
- Descriptive labels for all interactive elements
- Support for Telegram's dark/light mode settings

---

## Images & Icons

**Icons:** Use Heroicons (outline style) via CDN for consistency
- Dashboard: Home icon
- Create: Plus/PencilSquare icon
- My Quizzes: DocumentText/ClipboardDocumentList icon
- Stats: ChartBar, Users, CurrencyDollar icons
- Actions: Play, Edit, Trash, Share icons

**Illustrations:** (Optional)
- Empty state illustration for "No quizzes yet" page
- Success illustration after quiz publication
- Use simple, colorful line art style matching gradient theme

---

## Telegram Mini App Specific

- Utilize Telegram's color scheme API for theme integration
- Implement Telegram's back button in header navigation
- Use Telegram WebApp haptic feedback for enhanced UX
- Match Telegram's native UI patterns for familiarity
- Support Telegram's viewport expansion API for full-screen experience