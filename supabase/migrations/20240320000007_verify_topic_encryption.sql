-- Create trigger function for topic content encryption
create or replace function encrypt_topic_content() returns trigger as $$
begin
    if NEW.content is not null then
        NEW.encrypted_content := encrypt_content(NEW.content);
    end if;
    return NEW;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

-- Drop the existing trigger if it exists
drop trigger if exists encrypt_topic_content_trigger on topics;

-- Create the trigger
create trigger encrypt_topic_content_trigger
    before insert or update of content
    on topics
    for each row
    execute function encrypt_topic_content();
