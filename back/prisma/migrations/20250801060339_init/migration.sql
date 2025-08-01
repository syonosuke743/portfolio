-- CreateEnum
CREATE TYPE "AdventureStatus" AS ENUM ('planned', 'in_progress', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "WaypointType" AS ENUM ('start', 'intermediate', 'destination');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "provider" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adventures" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "status" "AdventureStatus" NOT NULL DEFAULT 'planned',
    "failure_reason" TEXT,
    "planned_distance_meters" DOUBLE PRECISION NOT NULL,
    "waypoint_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "adventures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adventures_waypoints" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "adventure_id" UUID NOT NULL,
    "sequence" INTEGER NOT NULL,
    "waypoint_type" "WaypointType" NOT NULL,
    "poi_category" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "location_name" TEXT,
    "poi_source_id" TEXT,
    "poi_source" TEXT,
    "address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "adventures_waypoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "adventure_id" UUID NOT NULL,
    "from_waypoint_id" UUID,
    "to_waypoint_id" UUID NOT NULL,
    "route_json" JSONB NOT NULL,
    "distance_meters" DOUBLE PRECISION NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "transportation_mode" TEXT NOT NULL DEFAULT 'walking',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "adventures_waypoints_adventure_id_sequence_key" ON "adventures_waypoints"("adventure_id", "sequence");

-- AddForeignKey
ALTER TABLE "adventures" ADD CONSTRAINT "adventures_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adventures_waypoints" ADD CONSTRAINT "adventures_waypoints_adventure_id_fkey" FOREIGN KEY ("adventure_id") REFERENCES "adventures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_adventure_id_fkey" FOREIGN KEY ("adventure_id") REFERENCES "adventures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_from_waypoint_id_fkey" FOREIGN KEY ("from_waypoint_id") REFERENCES "adventures_waypoints"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_to_waypoint_id_fkey" FOREIGN KEY ("to_waypoint_id") REFERENCES "adventures_waypoints"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
