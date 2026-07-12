# TaskFlow ✅ (React + Firebase Team Task Manager)

TaskFlow is a production-style team task management app (Kanban board) built with **React + Vite + Tailwind CSS + Firebase**.  
It demonstrates real-world patterns used in modern web apps: authentication, role-based access, realtime collaboration, clean component architecture, and safe data workflows.

## 🔗 Live Demo
- Live App: https://taskflow-five-gules.vercel.app/

---

## Features

### Authentication
- Register & Login with email/password
- Session persistence across refresh
- Protected routes (members can’t access pages unless signed in)

### Workspaces & Roles
A workspace is auto-created on first signup.

**Admin (owner):**
- invite members by email
- create/edit tasks
- assign tasks to members
- move tasks
- trash/restore/permanently delete

**Member:**
- view tasks in the workspace
- move task status (Todo/Doing/Done)
- cannot edit or trash tasks

### Realtime Invitations (Key Interview Feature)
- Admin sends an invite to an email address
- If the invitee is logged in, they see a realtime invitation popup immediately
- Invitee can Accept & Join or Decline
- Only accepted members can see the workspace tasks

### Task Board
Kanban columns: **Todo / Doing / Done**

Create task with:
- title
- description
- due date
- optional assignee (admin-only)

Task cards show:
- assignee name/email
- due date

### Trash (Safe Delete)
- Tasks moved to Trash are not permanently deleted immediately
- Admin can restore from Trash anytime
- Admin can permanently delete tasks from Trash

---

## Tech Stack
- React (JSX)
- Vite
- Tailwind CSS
- React Router
- Firebase Authentication
- Cloud Firestore (Realtime Database)

---

## Getting Started

### 1) Install
```bash
npm install

2) Add environment variables

Create a .env file in the project root:

VITE_FIREBASE_API_KEY=YOUR_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_DOMAIN
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
VITE_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID

# Demo welcome-page logins (auto-created in Firebase Auth on first click)
VITE_DEMO_ADMIN_EMAIL=admin@demo.com
VITE_DEMO_ADMIN_PASSWORD=demo1234
VITE_DEMO_MEMBER_EMAIL=member@demo.com
VITE_DEMO_MEMBER_PASSWORD=demo1234

✅ Important: restart dev server after adding .env

Demo accounts on `/welcome` sign in with these credentials. On first use, TaskFlow creates the Firebase users and links the member account into the admin demo workspace.

3) Run locally
npm run dev
