import express from 'express';
import { ListMateriasController } from '../controllers/materias/index.js';

const router = express.Router();

// Instanciar controllers
const listMateriasController = new ListMateriasController();

/**
 * GET /api/v1/materias
 * Listar todas las materias con filtros y paginación
 */
router.get(
  '/',
  (req, res, next) => listMateriasController.handle(req, res, next)
);

export default router;

