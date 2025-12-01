-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "min_raise_amount" REAL NOT NULL DEFAULT 0,
    "target_raise_amount" REAL NOT NULL DEFAULT 0,
    "raise_end_date" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
