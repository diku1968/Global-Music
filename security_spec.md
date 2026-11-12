# Security Specification for Global Music Jam

## 1. Data Invariants
- Users can only read and create/update their own musician profile (`userId == request.auth.uid`). Public read is allowed for musician profiles so musicians can be discovered, but email modifications and account impersonations are strictly forbidden.
- Follow documents must have `followerId == request.auth.uid`. A user cannot forge a follow on behalf of another user.
- Projects can be created by any authenticated user who sets `ownerId == request.auth.uid`. Projects can only be updated or deleted by their owner. Public projects can be read by any authenticated user; private projects only by owner.
- Invitations can only be created with `senderId == request.auth.uid`. Status updates on invitations can only be performed by the `receiverId` (accept or reject) or `senderId` (cancel).
- Messages can only be created with `senderId == request.auth.uid`. Only the sender or receiver can read the message. Only receiver can update the `read` flag.

## 2. The "Dirty Dozen" Invalidation Vectors
1. **User Identity Spoofing**: Attempt to create a user profile with `userId` mismatching `request.auth.uid`.
2. **Profile Ghost Field Injection**: Injecting arbitrary extra fields or modifying `userId`.
3. **Project Impersonation**: Creating a project with another musician's `ownerId`.
4. **Project Modification Hijack**: Non-owner updating song BPM or title.
5. **Project Malicious Deletion**: Non-owner deleting someone else's project.
6. **Follow Fraud**: Creating a follow record where `followerId` is someone else.
7. **Invitation Status Forgery**: Non-recipient changing invitation status to 'accepted'.
8. **Message Eavesdropping**: Third party querying messages where neither sender nor receiver matches auth UID.
9. **Message Text Tampering**: Recipient or third party editing the text of a message after receipt.
10. **Denial of Wallet Injection**: Over-sized strings (e.g. 500KB text in displayName, bio, or message).
11. **Malicious ID Path Poisoning**: Attempting path injection with invalid ID characters.
12. **Unauthenticated Access**: Guest accessing private projects or writing profiles.
