-- Enable pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Recreate the decrypt_value function to ensure it uses available functions
CREATE OR REPLACE FUNCTION decrypt_value(
    p_encrypted_value text,
    p_key_name text default 'app_key'
) RETURNS text AS $$
DECLARE
    v_key bytea;
    v_decoded bytea;
    v_iv bytea;
    v_data bytea;
BEGIN
    -- Get encryption key
    SELECT key_value INTO v_key 
    FROM encryption_keys 
    WHERE key_name = p_key_name;
    
    -- Decode the complete value
    v_decoded := decode(p_encrypted_value, 'base64');
    
    -- Extract IV and encrypted data
    v_iv := substring(v_decoded from 1 for 16);
    v_data := substring(v_decoded from 17);
    
    -- Check if decrypt_iv is available, otherwise use pgp_sym_decrypt as fallback
    BEGIN
        -- Try using decrypt_iv
        RETURN convert_from(
            decrypt_iv(
                v_data,
                v_key,
                v_iv,
                'aes-cbc/pad:pkcs'
            ),
            'utf8'
        );
    EXCEPTION WHEN undefined_function THEN
        -- Fallback to pgp_sym_decrypt
        RETURN pgp_sym_decrypt(
            v_data,
            encode(v_key, 'hex')
        );
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

-- Recreate the encrypt_value function to ensure it uses available functions
CREATE OR REPLACE FUNCTION encrypt_value(
    p_value text,
    p_key_name text default 'app_key'
) RETURNS text AS $$
DECLARE
    v_key bytea;
    v_iv bytea;
BEGIN
    -- Get encryption key
    SELECT key_value INTO v_key 
    FROM encryption_keys 
    WHERE key_name = p_key_name;
    
    -- Generate IV
    v_iv := gen_random_bytes(16);
    
    -- Check if encrypt_iv is available, otherwise use pgp_sym_encrypt as fallback
    BEGIN
        -- Try using encrypt_iv
        RETURN encode(
            v_iv || 
            encrypt_iv(
                p_value::bytea,
                v_key,
                v_iv,
                'aes-cbc/pad:pkcs'
            ),
            'base64'
        );
    EXCEPTION WHEN undefined_function THEN
        -- Fallback to pgp_sym_encrypt
        RETURN encode(
            v_iv || 
            pgp_sym_encrypt(
                p_value,
                encode(v_key, 'hex')
            ),
            'base64'
        );
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

-- Recreate the content-specific functions
CREATE OR REPLACE FUNCTION encrypt_content(p_content text) 
RETURNS text AS $$
BEGIN
    RETURN encrypt_value(p_content, 'app_key');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION decrypt_content(p_encrypted_content text) 
RETURNS text AS $$
BEGIN
    RETURN decrypt_value(p_encrypted_content, 'app_key');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

-- Recreate the email-specific functions
CREATE OR REPLACE FUNCTION encrypt_email(p_email text) 
RETURNS text AS $$
BEGIN
    RETURN encrypt_value(p_email, 'app_key');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION decrypt_email(p_encrypted_email text) 
RETURNS text AS $$
BEGIN
    RETURN decrypt_value(p_encrypted_email, 'app_key');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;