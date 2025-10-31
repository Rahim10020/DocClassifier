-- Script pour supprimer les sessions de test avec des chemins invalides
-- Exécutez ce script avec: npx prisma db execute --file ./scripts/delete-test-sessions.sql --schema ./prisma/schema.prisma

-- Supprimer les documents qui ont des chemins de fichiers invalides (contenant des slashes)
DELETE FROM "Document" WHERE "fileName" LIKE '%/%' OR "fileName" LIKE '%\%';

-- Supprimer les sessions qui n'ont plus de documents
DELETE FROM "Session" WHERE id NOT IN (SELECT DISTINCT "sessionId" FROM "Document");
