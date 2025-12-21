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
  getDocumentacionInscripcion,
} from '../controllers/catalogs.controller.js';

const router = express.Router();

/**
 * GET /api/v1/catalogs/carreras
 * Obtener lista de carreras activas
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
 * GET /api/v1/catalogs/documentacion-inscripcion
 * Obtener lista de documentos requeridos para inscripción
 * Query params: ?tipo=INSCRIPCION (opcional, default: INSCRIPCION)
 */
router.get('/documentacion-inscripcion', getDocumentacionInscripcion);

export default router;

