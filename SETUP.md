# Smart Bookmark App Setup Guide

## Step 1: Create a Supabase Project
1. Go to https://supabase.com
2. Sign up or log in to your account
3. Click "New project"
4. Fill in project details:
   - Name: smart-bookmark-app (or any name you prefer)
   - Database Password: Choose a strong password
   - Region: Select the closest region to you
5. Click "Create new project"
6. Wait for the project to be fully initialized (this may take a few minutes)

## Step 2: Configure Google OAuth
1. In your Supabase dashboard, go to Authentication > Providers
2. Find "Google" in the list and click to enable it
3. You'll need Google OAuth credentials:
   - Go to https://console.developers.google.com/
   - Create a new project or select existing one
   - Enable Google+ API
   - Go to Credentials > Create Credentials > OAuth 2.0 Client IDs
   - Set authorized redirect URIs to: `https://your-project.supabase.co/auth/v1/callback`
   - Copy the Client ID and Client Secret
4. Back in Supabase, paste the Client ID and Client Secret
5. Click "Save"

## Step 3: Create Bookmarks Table
1. In Supabase dashboard, go to Table Editor
2. Click "New table"
3. Table name: `bookmarks`
4. Add columns:
   - `id`: uuid, primary key, default: `gen_random_uuid()`
   - `user_id`: uuid, foreign key to `auth.users(id)`
   - `url`: text, not null
   - `title`: text, not null
   - `created_at`: timestamptz, default: `now()`
5. Click "Save"

## Step 4: Set Up Row Level Security (RLS)
1. In the bookmarks table, go to "RLS Policies"
2. Enable RLS
3. Create a policy for SELECT:
   - Name: "Users can view own bookmarks"
   - Using: `(auth.uid() = user_id)`
4. Create a policy for INSERT:
   - Name: "Users can insert own bookmarks"
   - Using: `(auth.uid() = user_id)`
5. Create a policy for DELETE:
   - Name: "Users can delete own bookmarks"
   - Using: `(auth.uid() = user_id)`

## Step 5: Enable Realtime
1. In Supabase dashboard, go to Database > Replication
2. Enable replication for the `bookmarks` table

## Step 6: Get Project Credentials
1. In Supabase dashboard, go to Settings > API
2. Copy the "Project URL" (e.g., https://your-project.supabase.co)
3. Copy the "anon public" key

## Step 7: Set Up Environment Variables
1. In your project root, create a `.env.local` file
2. Add these lines:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```
3. Replace with your actual values from Step 6

## Step 8: Provide Credentials to Continue
Once you've completed all steps above, reply with your:
- Project URL
- Anon key

The app implementation will continue after you provide these credentials.
