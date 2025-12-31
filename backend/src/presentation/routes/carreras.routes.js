import express from 'express';
import { ListCarrerasController } from '../controllers/carreras/index.js';

const router = express.Router();

// Instanciar controllers
const listCarrerasController = new ListCarrerasController();

/**
 * GET /api/v1/carreras
 * Listar todas las carreras con filtros y paginación
 */
router.get(
  '/',
  (req, res, next) => listCarrerasController.handle(req, res, next)
);

export default router;

