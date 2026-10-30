-- CreateTable
CREATE TABLE "Foto" (
    "miembroId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "datos" BLOB NOT NULL,
    "tipo" TEXT NOT NULL,
    CONSTRAINT "Foto_miembroId_fkey" FOREIGN KEY ("miembroId") REFERENCES "Miembro" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Miembro" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'miembro',
    "pinHash" TEXT NOT NULL,
    "conFoto" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Miembro" ("avatar", "creadoEn", "id", "nombre", "pinHash", "rol") SELECT "avatar", "creadoEn", "id", "nombre", "pinHash", "rol" FROM "Miembro";
DROP TABLE "Miembro";
ALTER TABLE "new_Miembro" RENAME TO "Miembro";
CREATE UNIQUE INDEX "Miembro_nombre_key" ON "Miembro"("nombre");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
