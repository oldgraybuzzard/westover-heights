-- Create a safe decryption function that handles errors
CREATE OR REPLACE FUNCTION safe_decrypt_content(p_encrypted_content text)
RETURNS text AS $$
BEGIN
    RETURN decrypt_content(p_encrypted_content);
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

-- Update the views to use the safe function
DROP VIEW IF EXISTS decrypted_topics;

CREATE OR REPLACE VIEW decrypted_topics
WITH (security_barrier = true, security_invoker = true)
AS
SELECT 
    t.*,
    CASE 
        WHEN t.encrypted_content IS NOT NULL THEN 
            safe_decrypt_content(t.encrypted_content)
        ELSE 
            t.content
    END as decrypted_content,
    COALESCE(
        (
            SELECT jsonb_agg(
                reply_data ORDER BY reply_data->>'created_at'
            )
            FROM (
                SELECT jsonb_build_object(
                    'id', r.id,
                    'content', r.content,
                    'decrypted_content', 
                    CASE 
                        WHEN r.encrypted_content IS NOT NULL THEN 
                            safe_decrypt_content(r.encrypted_content)
                        ELSE 
                            r.content
                    END,
                    'author_id', r.author_id,
                    'created_at', r.created_at,
                    'updated_at', r.updated_at
                ) AS reply_data
                FROM replies r
                WHERE r.topic_id = t.id
            ) subq
        ),
        '[]'::jsonb
    ) AS replies
FROM topics t;

DROP VIEW IF EXISTS decrypted_replies;

CREATE OR REPLACE VIEW decrypted_replies
WITH (security_barrier = true)
AS
SELECT 
    r.*,
    CASE 
        WHEN r.encrypted_content IS NOT NULL THEN 
            safe_decrypt_content(r.encrypted_content)
        ELSE 
            r.content
    END AS decrypted_content,
    p.display_name AS author_display_name,
    p.roles AS author_roles
FROM replies r
JOIN profiles p ON r.author_id = p.id;

-- Grant appropriate permissions
GRANT SELECT ON decrypted_topics TO authenticated;
GRANT SELECT ON decrypted_replies TO authenticated;