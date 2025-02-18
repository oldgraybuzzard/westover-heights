-- First drop the view that depends on the column
drop view if exists decrypted_topics;

-- Add encrypted content column to replies
alter table replies 
add column if not exists encrypted_content text;

-- Encrypt existing replies
update replies
set encrypted_content = encrypt_content(content)
where encrypted_content is null;

-- Create trigger for reply content encryption
create or replace function encrypt_reply_content() returns trigger as $$
begin
    if NEW.content is not null then
        NEW.encrypted_content := encrypt_content(NEW.content);
    end if;
    return NEW;
end;
$$ language plpgsql security definer;

create trigger encrypt_reply_content_trigger
    before insert or update of content
    on replies
    for each row
    execute function encrypt_reply_content();

-- Recreate the view with all columns
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

-- Create index for performance
create index if not exists idx_replies_topic_id_created_at 
on replies(topic_id, created_at);

-- Grant permissions
grant select on decrypted_topics to authenticated; 