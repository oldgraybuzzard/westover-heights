-- Drop existing functions
drop function if exists encrypt_value cascade;
drop function if exists decrypt_value cascade;
drop function if exists encrypt_content cascade;
drop function if exists decrypt_content cascade;
drop function if exists encrypt_email cascade;
drop function if exists decrypt_email cascade;

-- Create improved encryption function that includes IV in output
create or replace function encrypt_value(
    p_value text,
    p_key_name text default 'app_key'
) returns text as $$
declare
    v_key bytea;
    v_iv bytea;
begin
    -- Get encryption key
    select key_value into v_key 
    from encryption_keys 
    where key_name = p_key_name;
    
    -- Generate IV
    v_iv := gen_random_bytes(16);
    
    -- Return IV concatenated with encrypted data
    return encode(
        v_iv || 
        encrypt_iv(
            p_value::bytea,
            v_key,
            v_iv,
            'aes-cbc/pad:pkcs'
        ),
        'base64'
    );
end;
$$ language plpgsql security definer;

-- Create improved decryption function that extracts IV from input
create or replace function decrypt_value(
    p_encrypted_value text,
    p_key_name text default 'app_key'
) returns text as $$
declare
    v_key bytea;
    v_decoded bytea;
    v_iv bytea;
    v_data bytea;
begin
    -- Get encryption key
    select key_value into v_key 
    from encryption_keys 
    where key_name = p_key_name;
    
    -- Decode the complete value
    v_decoded := decode(p_encrypted_value, 'base64');
    
    -- Extract IV and encrypted data
    v_iv := substring(v_decoded from 1 for 16);
    v_data := substring(v_decoded from 17);
    
    -- Decrypt and return
    return convert_from(
        decrypt_iv(
            v_data,
            v_key,
            v_iv,
            'aes-cbc/pad:pkcs'
        ),
        'utf8'
    );
end;
$$ language plpgsql security definer;

-- Recreate the content-specific functions
create or replace function encrypt_content(p_content text) returns text as $$
begin
    return encrypt_value(p_content, 'app_key');
end;
$$ language plpgsql security definer;

create or replace function decrypt_content(p_encrypted_content text) returns text as $$
begin
    return decrypt_value(p_encrypted_content, 'app_key');
end;
$$ language plpgsql security definer;

-- Recreate the email-specific functions
create or replace function encrypt_email(p_email text) returns text as $$
begin
    return encrypt_value(p_email, 'app_key');
end;
$$ language plpgsql security definer;

create or replace function decrypt_email(p_encrypted_email text) returns text as $$
begin
    return decrypt_value(p_encrypted_email, 'app_key');
end;
$$ language plpgsql security definer;

-- Test the encryption
do $$
declare
    test_content text := 'Test content';
    encrypted text;
    decrypted text;
begin
    -- Test content encryption
    encrypted := encrypt_content(test_content);
    decrypted := decrypt_content(encrypted);
    
    assert decrypted = test_content, 
        format('Encryption/decryption failed. Original: %s, Decrypted: %s', 
               test_content, decrypted);
               
    raise notice 'Encryption test passed. Original: %, Encrypted: %, Decrypted: %', 
        test_content, encrypted, decrypted;
end $$; 