/**
 * Catálogo de aulas (CFG / Oferta académica).
 * La asignación de aula base vive en paralelos_gestion, no en asignacion_horarios.
 */
import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';

export function buildAulasHorariosRouter({ controllers }) {
  const router = express.Router();

  const verCatalogoAulas = [
    authenticate,
    verificarPermiso('institucional.oferta.paralelo-gestion', 'LISTAR'),
  ];

  router.get(
    '/catalogo',
    ...verCatalogoAulas,
    (req, res, next) => controllers.listAulasCatalogController.handle(req, res, next)
  );

  return router;
}
