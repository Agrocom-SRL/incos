import express from 'express';
import catalogsRoutes from './catalogs.routes.js';
import carrerasRoutes from './carreras.routes.js';
import materiasRoutes from './materias.routes.js';
import discapacidadRoutes from './discapacidad.routes.js';
import container from '../../infrastructure/container/index.js';
import { TOKENS } from '../../infrastructure/container/tokens.js';

const router = express.Router();

// ============================================
// RUTA BASE - Información de la API
// ============================================
/**
 * @swagger
 * /:
 *   get:
 *     summary: Información de la API
 *     description: Retorna información general sobre la API v1
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Información de la API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: API Instituto INCOS v1
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 endpoints:
 *                   type: object
 *                   properties:
 *                     estudiantes:
 *                       type: string
 *                       example: /api/v1/estudiantes
 *                     catalogs:
 *                       type: string
 *                       example: /api/v1/catalogs
 */
router.get('/', (req, res) => {
    res.json({
        message: 'API Instituto INCOS v1',
        version: '1.0.0',
        endpoints: {
            estudiantes: '/api/v1/estudiantes',
            catalogs: '/api/v1/catalogs',
            carreras: '/api/v1/carreras',
            materias: '/api/v1/materias',
            discapacidad: '/api/v1/discapacidad',
        },
    });
});

// ============================================
// MÓDULOS - Rutas organizadas por dominio
// ============================================
// IMPORTANTE: Solo descomentar cuando el módulo esté implementado

// Módulo: Gestión de Estudiantes (EST)
router.use('/estudiantes', container.resolve(TOKENS.est_router));

// Catálogos: Endpoints para obtener datos de catálogos
router.use('/catalogs', catalogsRoutes);

// Configuración Académica: Carreras y Materias
router.use('/carreras', carrerasRoutes);
router.use('/materias', materiasRoutes);

// Configuración: Datos Complementarios
router.use('/discapacidad', discapacidadRoutes);

// Para agregar un nuevo módulo:
// 1. Crear archivo: routes/{modulo}.routes.js
// 2. Importar: import {modulo}Routes from './{modulo}.routes.js';
// 3. Montar: router.use('/{modulo}', {modulo}Routes);
// 4. Agregar endpoint en la ruta base '/'

export default router;
