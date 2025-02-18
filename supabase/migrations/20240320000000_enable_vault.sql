-- Enable the vault extension if not already enabled
create extension if not exists vault with schema extensions;

-- Create an encryption key with a specific name for our application
select vault.create_key('app_encryption_key');

-- Verify the key was created
select * from vault.decrypted_secrets where name = 'app_encryption_key'; 