-- Order status updates in Telegram.
-- After checkout the customer can tap "GET_UPDATES_IN_TELEGRAM", which opens
-- @metallurgTm_bot with the order number; the bot links that chat to the
-- order. The bot's order-notify loop then messages the chat whenever the
-- order's status or TTN changes, using notified_state to remember what it
-- already sent (format: "<status>|<tracking_number>").
alter table public.orders
  add column if not exists customer_chat_id bigint,   -- Telegram chat subscribed to this order
  add column if not exists notified_state text;       -- last "<status>|<ttn>" sent to that chat

create index if not exists idx_orders_customer_chat
  on public.orders (customer_chat_id)
  where customer_chat_id is not null;
