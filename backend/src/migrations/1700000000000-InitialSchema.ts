import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "user_role_enum" AS ENUM ('ADMIN', 'STAFF', 'VIEWER')
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "username" character varying NOT NULL,
        "password_hash" character varying NOT NULL,
        "role" "user_role_enum" NOT NULL DEFAULT 'VIEWER',
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_username" UNIQUE ("username"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "room_type_enum" AS ENUM ('SINGLE', 'DOUBLE', 'SUITE', 'DELUXE')
    `);

    await queryRunner.query(`
      CREATE TABLE "rooms" (
        "id" SERIAL NOT NULL,
        "room_number" character varying NOT NULL,
        "type" "room_type_enum" NOT NULL,
        "capacity" integer NOT NULL,
        "price_per_night" numeric(10,2) NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        CONSTRAINT "UQ_rooms_room_number" UNIQUE ("room_number"),
        CONSTRAINT "PK_rooms" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "guests" (
        "id" SERIAL NOT NULL,
        "first_name" character varying NOT NULL,
        "last_name" character varying NOT NULL,
        "email" character varying,
        "phone" character varying,
        CONSTRAINT "PK_guests" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "booking_status_enum" AS ENUM ('PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED')
    `);

    await queryRunner.query(`
      CREATE TABLE "bookings" (
        "id" SERIAL NOT NULL,
        "room_id" integer NOT NULL,
        "guest_id" integer NOT NULL,
        "check_in_date" date NOT NULL,
        "check_out_date" date NOT NULL,
        "status" "booking_status_enum" NOT NULL DEFAULT 'PENDING',
        "notes" text,
        "total_price" numeric(10,2),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_bookings" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "bookings"
      ADD CONSTRAINT "FK_bookings_room"
      FOREIGN KEY ("room_id") REFERENCES "rooms"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "bookings"
      ADD CONSTRAINT "FK_bookings_guest"
      FOREIGN KEY ("guest_id") REFERENCES "guests"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_bookings_guest"`);
    await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_bookings_room"`);
    await queryRunner.query(`DROP TABLE "bookings"`);
    await queryRunner.query(`DROP TYPE "booking_status_enum"`);
    await queryRunner.query(`DROP TABLE "guests"`);
    await queryRunner.query(`DROP TABLE "rooms"`);
    await queryRunner.query(`DROP TYPE "room_type_enum"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "user_role_enum"`);
  }
}
