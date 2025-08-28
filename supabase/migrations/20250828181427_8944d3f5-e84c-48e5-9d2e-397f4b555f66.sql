-- Phase 1: Completely remove the email column from workflows table
ALTER TABLE public.workflows DROP COLUMN email;