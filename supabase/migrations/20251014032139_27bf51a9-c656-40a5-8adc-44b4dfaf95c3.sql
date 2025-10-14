-- Fix payment records exposure - restrict to admins only
DROP POLICY IF EXISTS "Users can view all payments" ON public.payments;

CREATE POLICY "Admins can view all payments"
ON public.payments FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix user roles exposure - restrict to admins and own role
DROP POLICY IF EXISTS "Users can view all roles" ON public.user_roles;

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own role"
ON public.user_roles FOR SELECT
USING (user_id = auth.uid());

-- Fix notes exposure - restrict to project members and note creators
DROP POLICY IF EXISTS "Users can view all notes" ON public.notes;

CREATE POLICY "Users can view own notes"
ON public.notes FOR SELECT
USING (created_by = auth.uid());

CREATE POLICY "Admins can view all notes"
ON public.notes FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view notes for assigned projects"
ON public.notes FOR SELECT
USING (
  project_id IS NULL
  OR EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = notes.project_id
    AND (projects.responsible_person = auth.uid() OR projects.created_by = auth.uid())
  )
);

-- Fix tasks exposure - restrict to assigned users, project members, and admins
DROP POLICY IF EXISTS "Users can view all tasks" ON public.tasks;

CREATE POLICY "Users can view assigned tasks"
ON public.tasks FOR SELECT
USING (
  assigned_to = auth.uid()
  OR created_by = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
  OR project_id IS NULL
  OR EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = tasks.project_id
    AND (projects.responsible_person = auth.uid() OR projects.created_by = auth.uid())
  )
);