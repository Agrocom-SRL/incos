import express from 'express';
import { ListDiscapacidadesController } from '../controllers/discapacidad/index.js';

const router = express.Router();

// Instanciar controllers
const listDiscapacidadesController = new ListDiscapacidadesController();

/**
 * GET /api/v1/discapacidad
 * Listar todos los tipos de discapacidad con filtros y paginación
 */
router.get(
  '/',
  (req, res, next) => listDiscapacidadesController.handle(req, res, next)
);

export default router;

