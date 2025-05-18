-- To list all tables in the database
\dt

-- To describe the topics table structure
\d topics

-- To describe the profiles table structure
\d profiles

-- Alternative SQL command to get column information for topics
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'topics';

-- Alternative SQL command to get column information for profiles
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles';