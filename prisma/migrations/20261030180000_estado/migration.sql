-- Reemplaza completada (bool) por estado, conservando las tareas ya hechas.
ALTER TABLE "Tarea" ADD COLUMN "estado" TEXT NOT NULL DEFAULT 'pendiente';
UPDATE "Tarea" SET "estado" = 'hecha' WHERE "completada" = 1;
ALTER TABLE "Tarea" DROP COLUMN "completada";
