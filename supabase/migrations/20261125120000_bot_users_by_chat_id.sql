-- Telegram bot: key bot_users on the chat id, drop-alert opt-out, loop state.
--
-- Until now bot_users was keyed by @username, so people without a username
-- never got drop alerts and a renamed account could hand its row to someone
-- else. Now chat_id (= the Telegram user id in a private chat) is the key and
-- the username is optional.
--
-- Backward compatible: the current bot's "ON CONFLICT (tg_username)" keeps
-- working through the unique constraint below, so this can run before the
-- new bot is deployed.

alter table public.bot_users drop constraint if exists bot_users_pkey;
alter table public.bot_users alter column tg_username drop not null;

-- One row per chat (keep the newest).
delete from public.bot_users a
 using public.bot_users b
 where a.chat_id = b.chat_id
   and (a.created_at, a.ctid) < (b.created_at, b.ctid);

alter table public.bot_users add constraint bot_users_pkey primary key (chat_id);
alter table public.bot_users add constraint bot_users_tg_username_key unique (tg_username);

alter table public.bot_users
  add column if not exists drop_alerts boolean not null default true,  -- wants "new in archive" messages
  add column if not exists blocked_at timestamp with time zone;        -- user blocked the bot (cleared when they write again)

-- Key/value store for the bot's loops (e.g. when products were last checked),
-- so a restart doesn't re-send or miss a drop alert.
create table if not exists public.bot_state (
  key text primary key,
  value text not null,
  updated_at timestamp with time zone not null default now()
);
alter table public.bot_state enable row level security;
