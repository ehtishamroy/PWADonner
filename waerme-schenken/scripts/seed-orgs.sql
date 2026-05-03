INSERT INTO "public"."SocialCardOrg" (id, name, "sortOrder", "createdAt")
VALUES
  (gen_random_uuid(), 'Caritas',     0, now()),
  (gen_random_uuid(), 'Rotes Kreuz', 1, now()),
  (gen_random_uuid(), 'Heilsarmee',  2, now()),
  (gen_random_uuid(), 'Diakonie',    3, now()),
  (gen_random_uuid(), 'Andere',      4, now())
ON CONFLICT (name) DO NOTHING;
