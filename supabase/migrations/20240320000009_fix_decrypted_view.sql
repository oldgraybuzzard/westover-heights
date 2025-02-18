-- Drop the previous view
drop view if exists decrypted_topics;

-- Create improved view with proper grouping
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
                    'id', r.id,
                    'content', r.content,
                    'decrypted_content', decrypt_content(r.encrypted_content),
                    'author_id', r.author_id,
                    'created_at', r.created_at,
                    'updated_at', r.updated_at
                ) as reply_data
                from replies r
                where r.topic_id = t.id
            ) subq
        ),
        '[]'::jsonb
    ) as replies
from topics t;

-- Create an index to improve performance
create index if not exists idx_replies_topic_id_created_at 
on replies(topic_id, created_at);

-- Grant appropriate permissions
grant select on decrypted_topics to authenticated; 