# CampusSkills Git Workflow

## Branch Structure

```text
main
└── develop
    ├── feature/auth-v2
    ├── feature/listings
    ├── feature/notifications
    └── feature/whatever-is-next
```

### main

Stable branch.

Anything in `main` should be:

* Tested
* Working
* Demo-ready
* Safe to show professors/team members

### develop

Integration branch.

Completed features get merged here first.

Think of this as:

```text
Current state of the project
```

### feature/*

Feature branches.

Examples:

```text
feature/auth-v2
feature/listings
feature/notifications
feature/google-oauth
```

All development happens here.

---

# Daily Workflow

## 1. Create a Feature Branch

Starting from `develop`:

```text
Branch
→ New Branch
```

Example:

```text
feature/auth-v2
```

Publish the branch to GitHub.

---

## 2. Work Normally

Make code changes.

Example:

```text
Add emailVerified field
```

---

## 3. Test

Before committing:

* Project compiles
* Endpoint works
* Database updates correctly
* No obvious regressions

---

## 4. Commit

Example commit:

```text
Add email verification support to user model
```

Commit to:

```text
feature/auth-v2
```

---

## 5. Push

After each meaningful commit:

```text
Push Origin
```

Benefits:

* Cloud backup
* Work visible on GitHub
* Easy rollback if something breaks

---

# Repeat

Example sequence:

```text
Commit 1:
Add emailVerified field

Commit 2:
Create OTP verification entity

Commit 3:
Add verify-email endpoint

Commit 4:
Enforce email verification during login

Commit 5:
Add refresh token support
```

Each commit should represent a logical piece of work.

---

# When a Feature is Complete

Example:

```text
✓ Email verification
✓ OTP flow
✓ Login
✓ Refresh tokens
✓ Logout
```

Merge:

```text
feature/auth-v2
        ↓
      develop
```

### GitHub Desktop

1. Switch to:

```text
develop
```

2. Click:

```text
Branch
→ Merge into Current Branch
```

3. Select:

```text
feature/auth-v2
```

4. Push Origin

Now `develop` contains the completed feature.

---

# When a Major Milestone is Complete

Example:

```text
✓ Chat System
✓ Sessions
✓ Notifications
✓ Auth V2
```

Merge:

```text
develop
    ↓
   main
```

### GitHub Desktop

1. Switch to:

```text
main
```

2. Click:

```text
Branch
→ Merge into Current Branch
```

3. Select:

```text
develop
```

4. Push Origin

Now `main` contains the latest stable version.

---

# Quick Rule

## During Development

```text
feature/*
```

Commit often.
Push often.

---

## Feature Finished

```text
feature/*
    ↓
 develop
```

---

## Major Milestone Finished

```text
develop
    ↓
   main
```

---

# CampusSkills Example

Current:

```text
main
└── develop
    └── feature/auth-v2
```

Workflow:

```text
Work
↓
Test
↓
Commit
↓
Push
↓
Repeat
↓
Feature Complete
↓
Merge → develop
↓
Big Milestone Complete
↓
Merge develop → main
```

This keeps:

* main = stable
* develop = current project state
* feature branches = active work
