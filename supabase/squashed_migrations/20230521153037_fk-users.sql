alter table "public"."edge" drop constraint "edge_user_id_fkey";

alter table "public"."node" drop constraint "node_user_id_fkey";

alter table "public"."user_role" drop constraint "user_role_user_id_fkey";

alter table "public"."edge" add constraint "edge_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."edge" validate constraint "edge_user_id_fkey";

alter table "public"."node" add constraint "node_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."node" validate constraint "node_user_id_fkey";

alter table "public"."user_role" add constraint "user_role_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_role" validate constraint "user_role_user_id_fkey";


