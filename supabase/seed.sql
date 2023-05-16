-- test@example.com password

insert into auth.users (instance_id,id,aud,"role",email,encrypted_password,email_confirmed_at,last_sign_in_at,raw_app_meta_data,raw_user_meta_data,is_super_admin,created_at,updated_at,phone,phone_confirmed_at,confirmation_token,email_change,email_change_token_new,recovery_token) values
	('00000000-0000-0000-0000-000000000000'::uuid,'f76629c5-a070-4bbc-9918-64beaea48848'::uuid,'authenticated','authenticated','test@example.com','$2a$10$q4VfrgQUrGNAKI2irn943eWk9hWhbRB8eU0gVtv569BMQLV0WJRWu','2022-02-11 21:02:04.547','2022-02-11 22:53:12.520','{"provider": "email", "providers": ["email"]}','{}',FALSE,'2022-02-11 21:02:04.542','2022-02-11 21:02:04.542',NULL,NULL,'','','','');

insert into auth.identities (id,user_id,identity_data,provider,last_sign_in_at,created_at,updated_at) values
	('f76629c5-a070-4bbc-9918-64beaea48848','f76629c5-a070-4bbc-9918-64beaea48848'::uuid,'{"sub": "f76629c5-a070-4bbc-9918-64beaea48848"}','email','2022-02-11 21:02:04.545','2022-02-11 21:02:04.545','2022-02-11 21:02:04.545');

insert into profile (id, username) values
    ('f76629c5-a070-4bbc-9918-64beaea48848', 'zak');

insert into user_role (user_id, role) values
    ('f76629c5-a070-4bbc-9918-64beaea48848', 'admin');

insert into node_type (name, icon, top_level) values
    ('chemical', 'atom', true),
    ('synonym', 'arrowRightArrowLeft', true);

insert into node (id, type, data, user_id, public) values
    (1, 'chemical', '{"name": "water"}', 'f76629c5-a070-4bbc-9918-64beaea48848', true),
    (2, 'synonym', '{"value": "h2o"}', 'f76629c5-a070-4bbc-9918-64beaea48848', true),
    (3, 'chemical', '{"name": "hydrogen"}', 'f76629c5-a070-4bbc-9918-64beaea48848', true);

insert into edge (source, destination, user_id, public) values
    (1, 2, 'f76629c5-a070-4bbc-9918-64beaea48848', true);

