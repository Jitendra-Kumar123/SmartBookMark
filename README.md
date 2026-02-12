Problems Encountered and How I Solved Them
1. Google OAuth Redirect Issues (auth-code-error)

Problem:
After successful Google login, the app redirected to /auth/auth-code-error. Although OAuth was configured correctly in Supabase and Google Cloud Console, the session was not being established in Next.js App Router.

Cause:
In App Router, Supabase requires a dedicated callback route to exchange the authorization code for a session. Without this handler, authentication fails after redirect.

Solution:

Created a dedicated route at app/auth/callback/route.ts

Used exchangeCodeForSession from @supabase/ssr

Configured redirectTo: ${window.location.origin}/auth/callback to support both localhost and production

Ensured environment-specific redirect handling

This resolved the authentication flow completely.

2. Realtime Not Triggering Across Tabs

Problem:
Bookmarks were inserting successfully, but updates were not appearing in other browser tabs.

Cause:
The bookmarks table was not added to the supabase_realtime publication.

Solution:
Manually enabled realtime replication using:

alter publication supabase_realtime add table bookmarks;


Verified with:

select * from pg_publication_tables where tablename = 'bookmarks';


After this, realtime events started working correctly.

3. Row Level Security Blocking Inserts

Problem:
Insert operations failed silently due to RLS restrictions.

Cause:
INSERT policy requires WITH CHECK, not USING.

Solution:
Configured policies properly:

SELECT → USING (auth.uid() = user_id)

INSERT → WITH CHECK (auth.uid() = user_id)

DELETE → USING (auth.uid() = user_id)

This ensured users could only manage their own bookmarks.

4. Production OAuth vs Localhost Differences

Problem:
Login worked locally but failed on Vercel.

Cause:
Production URL was not added in:

Google Cloud Console → Authorized JavaScript Origins

Supabase → URL Configuration

Solution:

Added Vercel URL in both systems

Avoided hardcoding redirect URLs

Used dynamic location.origin based redirect

This ensured consistent authentication behavior across environments.