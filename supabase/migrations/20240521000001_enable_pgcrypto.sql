-- Enable the pgcrypto extension if it's not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Fix the encrypt_value function to use pgcrypto functions
CREATE OR REPLACE FUNCTION encrypt_value(
    p_value text,
    p_key_name text default 'app_key'
) RETURNS text AS $$
DECLARE
    v_key bytea;
    v_iv bytea;
BEGIN
    -- Get encryption key
    select key_value into v_key 
    from encryption_keys 
    where key_name = p_key_name;
    
    -- Generate IV using pgcrypto's gen_random_bytes
    v_iv := gen_random_bytes(16);
    
    -- Return IV concatenated with encrypted data
    -- Use pgcrypto's encrypt function
    RETURN encode(
        v_iv || 
        encrypt(
            p_value::bytea,
            v_key,
            'aes-cbc/pad:pkcs'
        ),
        'base64'
    );
EXCEPTION WHEN undefined_function THEN
    -- Fallback to pgp_sym_encrypt if encrypt is not available
    RETURN pgp_sym_encrypt(
        p_value,
        encode(v_key, 'hex')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

-- Update the encrypt_content function to use the fixed encrypt_value
CREATE OR REPLACE FUNCTION encrypt_content(p_content text) 
RETURNS text AS $$
BEGIN
    RETURN encrypt_value(p_content, 'app_key');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;