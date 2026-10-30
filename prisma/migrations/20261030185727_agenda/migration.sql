-- CreateTable
CREATE TABLE "Recurrente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "prioridad" TEXT NOT NULL DEFAULT 'media',
    "dias" TEXT NOT NULL,
    "horas" TEXT NOT NULL DEFAULT '',
    "desde" TEXT NOT NULL,
    "hasta" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "creadaEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "asignadoId" INTEGER,
    "creadorId" INTEGER,
    CONSTRAINT "Recurrente_asignadoId_fkey" FOREIGN KEY ("asignadoId") REFERENCES "Miembro" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Recurrente_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "Miembro" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Evento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "inicio" TEXT NOT NULL,
    "fin" TEXT NOT NULL,
    "fecha" TEXT,
    "dias" TEXT NOT NULL DEFAULT '',
    "desde" TEXT,
    "hasta" TEXT,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "miembroId" INTEGER,
    "creadorId" INTEGER,
    CONSTRAINT "Evento_miembroId_fkey" FOREIGN KEY ("miembroId") REFERENCES "Miembro" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Evento_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "Miembro" ("id") ON DELETE SET NULL ON UPDATE CASCADE
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
    "recurrenteId" INTEGER,
    "fecha" TEXT,
    "hora" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "Tarea_asignadoId_fkey" FOREIGN KEY ("asignadoId") REFERENCES "Miembro" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Tarea_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "Miembro" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Tarea_recurrenteId_fkey" FOREIGN KEY ("recurrenteId") REFERENCES "Recurrente" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Tarea" ("asignadoId", "creadaEn", "creadorId", "estado", "id", "prioridad", "titulo") SELECT "asignadoId", "creadaEn", "creadorId", "estado", "id", "prioridad", "titulo" FROM "Tarea";
DROP TABLE "Tarea";
ALTER TABLE "new_Tarea" RENAME TO "Tarea";
CREATE UNIQUE INDEX "Tarea_recurrenteId_fecha_hora_key" ON "Tarea"("recurrenteId", "fecha", "hora");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
