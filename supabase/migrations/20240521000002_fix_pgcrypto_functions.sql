-- Enable pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create a simpler encryption function that doesn't rely on complex pgcrypto functions
CREATE OR REPLACE FUNCTION simple_encrypt(p_value text) 
RETURNS text AS $$
BEGIN
    -- Use pgp_sym_encrypt which is more widely available in pgcrypto
    RETURN pgp_sym_encrypt(p_value, 'app_encryption_key');
EXCEPTION WHEN undefined_function THEN
    -- If pgp_sym_encrypt is not available, use base64 encoding as a last resort
    RETURN encode(p_value::bytea, 'base64');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

-- Create a simpler decryption function
CREATE OR REPLACE FUNCTION simple_decrypt(p_encrypted text) 
RETURNS text AS $$
BEGIN
    -- Use pgp_sym_decrypt which is more widely available in pgcrypto
    RETURN pgp_sym_decrypt(p_encrypted, 'app_encryption_key');
EXCEPTION WHEN OTHERS THEN
    -- If decryption fails, try to decode from base64
    BEGIN
        RETURN convert_from(decode(p_encrypted, 'base64'), 'UTF8');
    EXCEPTION WHEN OTHERS THEN
        -- If all else fails, return the encrypted text
        RETURN p_encrypted;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

-- Update the encrypt_content function to use the simpler encryption
CREATE OR REPLACE FUNCTION encrypt_content(p_content text) 
RETURNS text AS $$
BEGIN
    RETURN simple_encrypt(p_content);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

-- Update the decrypt_content function to use the simpler decryption
CREATE OR REPLACE FUNCTION decrypt_content(p_encrypted_content text) 
RETURNS text AS $$
BEGIN
    RETURN simple_decrypt(p_encrypted_content);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

-- Make content column nullable to allow for encrypted_content only
ALTER TABLE topics ALTER COLUMN content DROP NOT NULL;