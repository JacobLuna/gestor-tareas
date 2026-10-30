-- CreateTable
CREATE TABLE "Miembro" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'miembro',
    "pinHash" TEXT NOT NULL,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Sesion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "miembroId" INTEGER NOT NULL,
    "expira" DATETIME NOT NULL,
    CONSTRAINT "Sesion_miembroId_fkey" FOREIGN KEY ("miembroId") REFERENCES "Miembro" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tarea" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "prioridad" TEXT NOT NULL DEFAULT 'media',
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "creadaEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "asignadoId" INTEGER,
    "creadorId" INTEGER,
    CONSTRAINT "Tarea_asignadoId_fkey" FOREIGN KEY ("asignadoId") REFERENCES "Miembro" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Tarea_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "Miembro" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Tarea" ("creadaEn", "estado", "id", "prioridad", "titulo") SELECT "creadaEn", "estado", "id", "prioridad", "titulo" FROM "Tarea";
DROP TABLE "Tarea";
ALTER TABLE "new_Tarea" RENAME TO "Tarea";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Miembro_nombre_key" ON "Miembro"("nombre");
