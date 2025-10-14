-- Fix: Restrict access to projects table with client contact information
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all projects" ON public.projects;

-- Create admin-only policy for full project access
CREATE POLICY "Admins can view all projects"
ON public.projects FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Allow users to view projects they created or are responsible for
CREATE POLICY "Users can view assigned projects"
ON public.projects FOR SELECT
USING (
  responsible_person = auth.uid() OR
  created_by = auth.uid()
);