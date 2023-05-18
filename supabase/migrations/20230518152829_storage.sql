create policy "Authenticated user can create files"
    on storage.objects for insert to authenticated
    with check ( bucket_id = 'files' );

create policy "Authenticated user can manage their own files"
    on storage.objects for all
    using ( bucket_id = 'files' and auth.uid() = owner );
