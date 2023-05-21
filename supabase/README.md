# Generate migrations

To maintain declarative SQL migrations in `supabase/migrations`, follow the
following steps:

1. Add new database changes to existing files in `supabase/migrations`
1. Test / develop
1. Apply the new schema with `supabase db reset`
1. Stash your changes
1. Run `supabase db diff -f <name for changes>`
1. Move the new migration to `squashed_migrations` if there are changes
1. Pop the stash
1. Git commit
1. Manually modify the remote migrations table
   `supabase_migrations.schema_migrations` if there are changes in the migration list
1. Run new migration(s) on the remote with `psql -f`
1. If there is an issue, edit the new migration(s) & ammend the commit
1. Git push
