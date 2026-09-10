CREATE TABLE "custom_photos" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"recipe_id" text NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_items" (
	"item_id" text PRIMARY KEY,
	"event_id" text NOT NULL,
	"recipe_id" text,
	"name" text NOT NULL,
	"category" text DEFAULT 'Cocktails' NOT NULL,
	"image_url" text,
	"garnish" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"date" text,
	"vibe" text,
	"guest_count" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"user_id" text,
	"recipe_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "favorites_pkey" PRIMARY KEY("user_id","recipe_id")
);
--> statement-breakpoint
CREATE TABLE "garnishes" (
	"id" text PRIMARY KEY,
	"title" text NOT NULL,
	"image_url" text DEFAULT '' NOT NULL,
	"tip" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipes" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"image_url" text DEFAULT '' NOT NULL,
	"glass" text,
	"base_spirit" text,
	"ingredients" text[] DEFAULT '{}'::text[] NOT NULL,
	"steps" text[] DEFAULT '{}'::text[] NOT NULL,
	"garnish" text,
	"difficulty" text DEFAULT 'Easy' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "syrups" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"color" text,
	"base_yield_oz" double precision DEFAULT 0 NOT NULL,
	"shelf_life" text,
	"ingredients" text[] DEFAULT '{}'::text[] NOT NULL,
	"steps" text[] DEFAULT '{}'::text[] NOT NULL,
	"tip" text
);
--> statement-breakpoint
CREATE TABLE "uploads" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"recipe_id" text,
	"storage_path" text NOT NULL,
	"url" text NOT NULL,
	"content_type" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY,
	"email" text NOT NULL UNIQUE,
	"name" text,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "custom_photos" ADD CONSTRAINT "custom_photos_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "event_items" ADD CONSTRAINT "event_items_event_id_events_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "uploads" ADD CONSTRAINT "uploads_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;