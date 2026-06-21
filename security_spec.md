# Security Specification - Bao Exit Readiness Platform

This specification maps the firestore security rules to data invariants and test vectors to secure user assessments.

## Data Invariants
1. **User Ownership**: A user can only read, create, or update assessments inside their own subcollection (`/users/{userId}/assessments/{assessmentId}`).
2. **Read Control**: Only the creator (authenticated user matching `{userId}`) can read their assessment list and individual assessments to protect intellectual property and company financials.
3. **Write Control**: An user can only write assessments where the incoming `createdAt` corresponds strictly to `request.time` (server timestamp), preventing timestamp spoofing.
4. **Valid Score limits**: Scores must be between 0 and 100.
5. **Id Protection**: All IDs must strictly match legal Firestore strings representing alphanumeric characters, avoiding ID pollution or path injection attacks.

## The Dirty Dozen Payloads

These 12 scenarios represent malicious attacks that must be blocked by the Firestore rules:

1. **Attempting to read another user's assessment list** (Identity Spoofing).
2. **Attempting to read another user's specific assessment document** (Identity Spoofing).
3. **Attempting to create an assessment under another user's UID** (Identity Spoofing).
4. **Attempting to create an assessment with a pre-dated `createdAt` timestamp** (Temp Integrity).
5. **Attempting to create an assessment with an out-of-bounds score (e.g., -10 or 150)** (Schema Validation).
6. **Attempting to update an existing assessment's `score` or `createdAt`** (Immutability Violation).
7. **Attempting to inject a huge ghost key (extra system fields) during creation** (Shadow Update).
8. **Attempting to write an assessment while unauthenticated** (No Auth).
9. **Attempting to read assessments while unauthenticated** (No Auth).
10. **Attempting to delete a record without authentication** (Unauthorized Delete).
11. **Attempting to update another user's audit score** (Privilege Escalation).
12. **Attempting to create a document with an ID exceeding 128 characters or containing illegal punctuation** (Resource Poisoning).

## Hardened Security Rules Draft (`DRAFT_firestore.rules`)

We define these principles in our draft security rules, which we will compile into real Firestore rules.
