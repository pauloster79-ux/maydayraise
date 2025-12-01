-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "shareholder_id" TEXT NOT NULL,
    "application_id" TEXT,
    "message_text" TEXT NOT NULL,
    "display_name_preference" TEXT NOT NULL DEFAULT 'FIRST_NAME_ONLY',
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" DATETIME,
    "deleted_by" TEXT,
    "deletion_reason" TEXT,
    CONSTRAINT "messages_shareholder_id_fkey" FOREIGN KEY ("shareholder_id") REFERENCES "shareholders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "messages_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_messages" ("created_at", "deleted_at", "deleted_by", "deletion_reason", "display_name_preference", "id", "is_visible", "message_text", "shareholder_id", "updated_at") SELECT "created_at", "deleted_at", "deleted_by", "deletion_reason", "display_name_preference", "id", "is_visible", "message_text", "shareholder_id", "updated_at" FROM "messages";
DROP TABLE "messages";
ALTER TABLE "new_messages" RENAME TO "messages";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
