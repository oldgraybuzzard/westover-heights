-- First, ensure all replies are encrypted
update replies
set encrypted_content = encrypt_content(content)
where encrypted_content is null;

-- Create a separate view for decrypted replies
create or replace view decrypted_replies as
select 
    r.*,
    decrypt_content(r.encrypted_content) as decrypted_content,
    p.display_name as author_display_name,
    p.roles as author_roles
from replies r
join profiles p on r.author_id = p.id;

-- Update the decrypted_topics view to use the decrypted_replies view
create or replace view decrypted_topics as
select 
    t.*,
    decrypt_content(t.encrypted_content) as decrypted_content,
    coalesce(
        (
            select jsonb_agg(
                reply_data order by reply_data->>'created_at'
            )
            from (
                select jsonb_build_object(
                    'id', dr.id,
                    'content', dr.decrypted_content,
                    'author_id', dr.author_id,
                    'author_display_name', dr.author_display_name,
                    'author_roles', dr.author_roles,
                    'created_at', dr.created_at,
                    'updated_at', dr.updated_at
                ) as reply_data
                from decrypted_replies dr
                where dr.topic_id = t.id
            ) subq
        ),
        '[]'::jsonb
    ) as replies
from topics t;

-- Grant permissions
grant select on decrypted_replies to authenticated;
grant select on decrypted_topics to authenticated; 