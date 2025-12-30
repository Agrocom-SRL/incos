import express from 'express';
import {
  getCarreras,
  getGestiones,
  getPaises,
  getDepartamentos,
  getProvincias,
  getMunicipios,
  getIdiomas,
  getTiposDiscapacidad,
  getEstadosCiviles,
  getTiposParentesco,
  getDocumentacionInscripcion,
} from '../controllers/catalogs.controller.js';

const router = express.Router();

/**
 * @swagger
 * /catalogs/carreras:
 *   get:
 *     summary: Obtener lista de carreras activas
 *     description: Retorna todas las carreras disponibles en el sistema
 *     tags: [Catálogos]
 *     responses:
 *       200:
 *         description: Lista de carreras
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       nombre:
 *                         type: string
 *                         example: Ingeniería de Sistemas
 *                       codigo:
 *                         type: string
 *                         example: IS
 *                       activo:
 *                         type: boolean
 *                         example: true
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/carreras', getCarreras);

/**
 * GET /api/v1/catalogs/gestiones
 * Obtener lista de gestiones activas
 */
router.get('/gestiones', getGestiones);

/**
 * GET /api/v1/catalogs/paises
 * Obtener lista de países activos
 */
router.get('/paises', getPaises);

/**
 * GET /api/v1/catalogs/departamentos
 * Obtener lista de departamentos activos
 * Query params: ?paisId=1 (opcional) - Filtrar por país
 */
router.get('/departamentos', getDepartamentos);

/**
 * GET /api/v1/catalogs/provincias
 * Obtener lista de provincias activas
 * Query params: ?departamentoId=1 (opcional) - Filtrar por departamento
 */
router.get('/provincias', getProvincias);

/**
 * GET /api/v1/catalogs/municipios
 * Obtener lista de municipios activos
 * Query params: ?provinciaId=1 (opcional) - Filtrar por provincia
 */
router.get('/municipios', getMunicipios);

/**
 * GET /api/v1/catalogs/idiomas
 * Obtener lista de idiomas activos
 */
router.get('/idiomas', getIdiomas);

/**
 * GET /api/v1/catalogs/tipos-discapacidad
 * Obtener lista de tipos de discapacidad activos
 */
router.get('/tipos-discapacidad', getTiposDiscapacidad);

/**
 * GET /api/v1/catalogs/estados-civiles
 * Obtener lista de estados civiles activos
 */
router.get('/estados-civiles', getEstadosCiviles);

/**
 * GET /api/v1/catalogs/tipos-parentesco
 * Obtener lista de tipos de parentesco activos
 */
router.get('/tipos-parentesco', getTiposParentesco);

/**
 * GET /api/v1/catalogs/documentacion-inscripcion
 * Obtener lista de documentos requeridos para inscripción
 * Query params: ?tipo=INSCRIPCION (opcional, default: INSCRIPCION)
 */
router.get('/documentacion-inscripcion', getDocumentacionInscripcion);

export default router;

