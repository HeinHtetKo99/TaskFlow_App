## Summary

- Fix permission bug: workspace members (role: `member`) must not be able to create tasks.
- Add a new `review` workflow step: assignee can move work to `review`; only admin can mark tasks `done`. Admin can move status for any task.

## Current State Analysis

- Roles are stored per workspace member doc: `workspaces/{workspaceId}/members/{uid}.role` and exposed as `isAdmin` via [WorkspaceContext.jsx](file:///d:/new-folder/TaskFlow_App/src/context/WorkspaceContext.jsx).
- Task creation is currently available to all users via the “+ Create Task” button on [Tasks.jsx](file:///d:/new-folder/TaskFlow_App/src/pages/Tasks.jsx), and `onSubmit` calls `createTask()` even when `isAdmin` is false.
- Task workflow statuses are hard-coded to `todo | doing | done` across:
  - [Tasks.jsx](file:///d:/new-folder/TaskFlow_App/src/pages/Tasks.jsx) (columns + move logic)
  - [TaskCard.jsx](file:///d:/new-folder/TaskFlow_App/src/components/TaskCard.jsx) (move buttons)
  - [TaskForm.jsx](file:///d:/new-folder/TaskFlow_App/src/components/TaskForm.jsx) (status select)

## Proposed Changes

### 1) Prevent members from creating tasks

- File: [Tasks.jsx](file:///d:/new-folder/TaskFlow_App/src/pages/Tasks.jsx)
  - Hide or disable the “+ Create Task” button when `isAdmin` is false.
  - Hard-block member creation paths:
    - `onCreate`: do nothing when `!isAdmin`.
    - `onSubmit`: if `!isAdmin` and `!editing`, return early (and optionally show a small inline message).
  - Keep existing behavior where members can still view their assigned tasks and move their own task status.

Notes:
- This is a front-end restriction. Without Firestore security rules, a malicious client could still write directly. If you want true enforcement, we will add Firestore rules in the implementation phase (requires project Firebase rules setup).

### 2) Add “review” step with admin approval for “done”

- Status model:
  - Add a new status value: `review`.
  - Intended flow:
    - Members (assignees): `todo ↔ doing → review` (members cannot move to `done`).
    - Admin: can move any task to any status including `done`.

- File: [Tasks.jsx](file:///d:/new-folder/TaskFlow_App/src/pages/Tasks.jsx)
  - Update columns to 4 statuses: `todo`, `doing`, `review`, `done`.
  - Update grid layout to 4 columns on desktop.
  - Update `onMove` rules:
    - If `isAdmin`: allow moving any task to any status.
    - Else (member): keep current “assignee-only” restriction AND additionally block moving to `done`.

- File: [TaskCard.jsx](file:///d:/new-folder/TaskFlow_App/src/components/TaskCard.jsx)
  - Add a “Review” move button.
  - For members: hide “Done” button (or disable it) so the UI matches the new rule.
  - For admins: show all status buttons and allow moving any task.

- File: [TaskForm.jsx](file:///d:/new-folder/TaskFlow_App/src/components/TaskForm.jsx)
  - Add `review` to the status dropdown (admin-only usage since only admin can open the form after change #1).

## Assumptions & Decisions (Locked)

- Members cannot create tasks at all (admin only).
- “Review step” is implemented as an additional `review` status/column.
- Admin can move task status regardless of assignee (including `review → done` approval).

## Verification

- Manual smoke checks (local):
  - Login as admin:
    - See “+ Create Task”, can create task, can set status to `review`, can move any task to `done`.
  - Login as member:
    - Do not see (or cannot use) “+ Create Task”.
    - Can only move tasks assigned to them.
    - Can move to `review`, but cannot move any task to `done`.
- Dev checks:
  - `npm run lint`
  - `npm run build`

