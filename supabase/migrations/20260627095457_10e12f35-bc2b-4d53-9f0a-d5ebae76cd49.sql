-- Family kids: each child linked to owner (parent) auth user
CREATE TABLE public.family_kids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id text NOT NULL,
  name text NOT NULL,
  avatar_index integer NOT NULL DEFAULT 0,
  total_stars integer NOT NULL DEFAULT 0,
  last_synced_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(owner_id, child_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.family_kids TO authenticated;
GRANT ALL ON public.family_kids TO service_role;

ALTER TABLE public.family_kids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner reads kids" ON public.family_kids
  FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "owner inserts kids" ON public.family_kids
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "owner updates kids" ON public.family_kids
  FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "owner deletes kids" ON public.family_kids
  FOR DELETE TO authenticated USING (auth.uid() = owner_id);

CREATE TRIGGER family_kids_set_updated_at
BEFORE UPDATE ON public.family_kids
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX family_kids_owner_idx ON public.family_kids(owner_id);

-- Family members: optional shared access (e.g. second parent) per owner
CREATE TYPE public.family_role AS ENUM ('owner', 'viewer');

CREATE TABLE public.family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.family_role NOT NULL DEFAULT 'viewer',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(owner_id, member_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.family_members TO authenticated;
GRANT ALL ON public.family_members TO service_role;

ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner manages members" ON public.family_members
  FOR ALL TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "member reads own access" ON public.family_members
  FOR SELECT TO authenticated USING (auth.uid() = member_id);
