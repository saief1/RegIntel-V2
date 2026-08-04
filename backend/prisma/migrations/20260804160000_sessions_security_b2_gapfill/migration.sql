-- CreateEnum
CREATE TYPE "SecurityEventSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "LoginAttemptResult" AS ENUM ('SUCCESS', 'FAILURE', 'MFA_REQUIRED', 'MFA_FAILURE', 'BLOCKED');

-- AlterEnum: AppRole aliases / new roles (v2.2.1)
ALTER TYPE "AppRole" ADD VALUE 'REVIEWER';
ALTER TYPE "AppRole" ADD VALUE 'EMPLOYEE';
ALTER TYPE "AppRole" ADD VALUE 'GUEST';

-- AlterTable RefreshToken session metadata
ALTER TABLE "refresh_tokens" ADD COLUMN IF NOT EXISTS "last_active_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "refresh_tokens" ADD COLUMN IF NOT EXISTS "device_label" TEXT;
ALTER TABLE "refresh_tokens" ADD COLUMN IF NOT EXISTS "trusted_device_id" UUID;

-- CreateTable TrustedDevice
CREATE TABLE "trusted_devices" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "fingerprint_hash" TEXT,
    "name" TEXT NOT NULL,
    "user_agent" TEXT,
    "ip_address" TEXT,
    "trusted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "trusted_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable SecurityEvent
CREATE TABLE "security_events" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "organization_id" UUID,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "severity" "SecurityEventSeverity" NOT NULL DEFAULT 'LOW',
    "detail" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable PasswordHistory
CREATE TABLE "password_history" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable LoginAttempt
CREATE TABLE "login_attempts" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "email" TEXT NOT NULL,
    "result" "LoginAttemptResult" NOT NULL,
    "reason" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "trusted_devices_user_id_idx" ON "trusted_devices"("user_id");
CREATE INDEX "trusted_devices_token_hash_idx" ON "trusted_devices"("token_hash");
CREATE INDEX "security_events_user_id_created_at_idx" ON "security_events"("user_id", "created_at");
CREATE INDEX "security_events_organization_id_created_at_idx" ON "security_events"("organization_id", "created_at");
CREATE INDEX "security_events_action_created_at_idx" ON "security_events"("action", "created_at");
CREATE INDEX "password_history_user_id_created_at_idx" ON "password_history"("user_id", "created_at");
CREATE INDEX "login_attempts_user_id_created_at_idx" ON "login_attempts"("user_id", "created_at");
CREATE INDEX "login_attempts_email_created_at_idx" ON "login_attempts"("email", "created_at");
CREATE INDEX "login_attempts_result_created_at_idx" ON "login_attempts"("result", "created_at");
CREATE INDEX "refresh_tokens_trusted_device_id_idx" ON "refresh_tokens"("trusted_device_id");

-- FKs
ALTER TABLE "trusted_devices" ADD CONSTRAINT "trusted_devices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "security_events" ADD CONSTRAINT "security_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "password_history" ADD CONSTRAINT "password_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "login_attempts" ADD CONSTRAINT "login_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_trusted_device_id_fkey" FOREIGN KEY ("trusted_device_id") REFERENCES "trusted_devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;
