-- Additive RBAC schema, safe to run repeatedly on existing installations.
CREATE TABLE IF NOT EXISTS roles (
  id serial PRIMARY KEY,
  name varchar NOT NULL,
  description varchar,
  permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz(3) NOT NULL DEFAULT now(),
  created_at timestamptz(3) NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS roles_name_idx ON roles (name);
CREATE INDEX IF NOT EXISTS roles_updated_at_idx ON roles (updated_at);
CREATE INDEX IF NOT EXISTS roles_created_at_idx ON roles (created_at);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_super_admin boolean DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id integer;
CREATE INDEX IF NOT EXISTS users_role_idx ON users(role_id);
DO $$ BEGIN
  ALTER TABLE users ADD CONSTRAINT users_role_id_roles_id_fk FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
ALTER TABLE payload_locked_documents_rels ADD COLUMN IF NOT EXISTS roles_id integer;
CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_roles_id_idx ON payload_locked_documents_rels(roles_id);
DO $$ BEGIN
  ALTER TABLE payload_locked_documents_rels ADD CONSTRAINT payload_locked_documents_rels_roles_fk FOREIGN KEY (roles_id) REFERENCES roles(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- A persistent receipt prevents re-promoting this address on later restarts.
CREATE TABLE IF NOT EXISTS rbac_bootstrap (version integer PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now());
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM rbac_bootstrap WHERE version = 1)
     AND EXISTS (SELECT 1 FROM users WHERE lower(email) = 'abir@yopmail.com') THEN
    UPDATE users SET is_super_admin = true, active = true WHERE lower(email) = 'abir@yopmail.com';
    INSERT INTO rbac_bootstrap(version) VALUES (1) ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Serialize removals of Super Admin access, including concurrent requests.
CREATE OR REPLACE FUNCTION protect_last_super_admin() RETURNS trigger AS $$
BEGIN
  IF OLD.is_super_admin IS TRUE AND OLD.active IS TRUE THEN
    IF TG_OP = 'DELETE' OR NEW.is_super_admin IS NOT TRUE OR NEW.active IS NOT TRUE THEN
      PERFORM pg_advisory_xact_lock(740231901);
      IF NOT EXISTS (SELECT 1 FROM users WHERE id <> OLD.id AND is_super_admin IS TRUE AND active IS TRUE) THEN
        RAISE EXCEPTION 'The last active Super Admin cannot be removed or disabled.';
      END IF;
    END IF;
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS users_protect_last_super_admin ON users;
CREATE TRIGGER users_protect_last_super_admin BEFORE UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION protect_last_super_admin();
