# Database Setup Instructions

There are two ways to set up your database for the OBD Logger application:

## Method 1: Using the schema.sql file directly

This method is recommended if you're setting up a fresh database.

1. Run the script to apply the entire schema:

```bash
node scripts/apply-schema.js
```

This will:
- Create all tables if they don't exist, including the users table with all necessary columns
- Set up the proper schema structure as defined in schema.sql

## Method 2: Update existing database

If you already have a database with data, but are missing certain columns:

1. Run the TypeScript update script:

```bash
# First, compile the TypeScript file
npx tsc --skipLibCheck scripts/update-schema.ts

# Then run the compiled JavaScript
node scripts/update-schema.js
```

Alternatively, use the convenience script:

```bash
node scripts/run-update-schema.js
```

This will:
- Add any missing columns to the users table (role, status, last_login)
- Create the user_projects table if it doesn't exist

## Troubleshooting

If you're still experiencing issues with the user management page, try the following:

1. Check the database structure by visiting the debug endpoint:
   - Navigate to `/api/debug/database` in your browser

2. Examine the response to see if:
   - The users table exists and has the right columns
   - There are any users in the database
   - The user_projects table exists

3. Common problems:
   - Missing role, status, or last_login columns in the users table
   - User_projects table doesn't exist
   - MySQL user doesn't have sufficient privileges to modify tables

If you're seeing the "No users found" message, it might be that:
1. There are no users in the database
2. The API is returning an empty array due to errors accessing the required columns
3. There's a connection issue with the database 