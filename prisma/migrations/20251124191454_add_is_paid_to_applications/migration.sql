-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_applications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "shareholder_id" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "shares" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "is_paid" BOOLEAN NOT NULL DEFAULT false,
    "paid_at" DATETIME,
    "payment_method" TEXT,
    "payment_reference" TEXT,
    "risk_acknowledgments" TEXT NOT NULL,
    "beneficiary_details" TEXT,
    CONSTRAINT "applications_shareholder_id_fkey" FOREIGN KEY ("shareholder_id") REFERENCES "shareholders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_applications" ("amount", "beneficiary_details", "created_at", "id", "payment_method", "payment_reference", "risk_acknowledgments", "shareholder_id", "shares", "status", "updated_at") SELECT "amount", "beneficiary_details", "created_at", "id", "payment_method", "payment_reference", "risk_acknowledgments", "shareholder_id", "shares", "status", "updated_at" FROM "applications";
DROP TABLE "applications";
ALTER TABLE "new_applications" RENAME TO "applications";
CREATE UNIQUE INDEX "applications_payment_reference_key" ON "applications"("payment_reference");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
