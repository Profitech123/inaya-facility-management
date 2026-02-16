
-- Confirm Test User Email
-- This sets the email_confirmed_at timestamp for the test user, allowing them to log in.

UPDATE auth.users
SET email_confirmed_at = now()
WHERE email = 'test_customer_verify@inaya.ae';
