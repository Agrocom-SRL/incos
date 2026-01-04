import express from 'express';
import container from '../../infrastructure/container/index.js';
import { TOKENS } from '../../infrastructure/container/tokens.js';

const router = express.Router();

// ============================================
// RUTA BASE - Información de la API
// ============================================
router.get('/', (req, res) => {
    res.json({
        message: 'API Instituto INCOS v1',
        version: '1.0.0',
        endpoints: {
            // Módulo: Estudiantes
            estudiantes: '/api/v1/estudiantes',
            // Módulo: Configuración
            carreras: '/api/v1/carreras',
            materias: '/api/v1/materias',
            // Módulo: Geográficos
            paises: '/api/v1/paises',
            departamentos: '/api/v1/departamentos',
            provincias: '/api/v1/provincias',
            municipios: '/api/v1/municipios',
            // Módulo: Referencia
            idiomas: '/api/v1/idiomas',
            estadosCiviles: '/api/v1/estados-civiles',
            tiposParentesco: '/api/v1/tipos-parentesco',
            documentacion: '/api/v1/documentacion',
            discapacidad: '/api/v1/discapacidad',
        },
    });
});

// ============================================
// MÓDULOS - Rutas organizadas por dominio
// ============================================
// Estructura basada en frontend/src/infrastructure/api/endpoints.js

// ============================================
// 1. MÓDULO: ESTUDIANTES
// ============================================
router.use('/estudiantes', container.resolve(TOKENS.est_estudiantesRouter));

// ============================================
// 2. MÓDULO: CONFIGURACIÓN
// ============================================
// 2.1. Académico
router.use('/carreras', container.resolve(TOKENS.cfg_carrerasRouter));
router.use('/materias', container.resolve(TOKENS.cfg_materiasRouter));

// ============================================
// 3. MÓDULO: GEOGRÁFICOS
// ============================================
router.use('/paises', container.resolve(TOKENS.geo_paisesRouter));
router.use('/departamentos', container.resolve(TOKENS.geo_departamentosRouter));
router.use('/provincias', container.resolve(TOKENS.geo_provinciasRouter));
router.use('/municipios', container.resolve(TOKENS.geo_municipiosRouter));

// ============================================
// 4. MÓDULO: REFERENCIA
// ============================================
router.use('/idiomas', container.resolve(TOKENS.ref_idiomasRouter));
router.use('/estados-civiles', container.resolve(TOKENS.ref_estadosCivilesRouter));
router.use('/tipos-parentesco', container.resolve(TOKENS.ref_tiposParentescoRouter));
router.use('/documentacion', container.resolve(TOKENS.ref_documentacionRouter));
router.use('/discapacidad', container.resolve(TOKENS.ref_discapacidadRouter));

// Para agregar un nuevo módulo:
// 1. Crear archivo: routes/{modulo}.routes.js
// 2. Importar: import {modulo}Routes from './{modulo}.routes.js';
// 3. Montar: router.use('/{modulo}', {modulo}Routes);
// 4. Agregar endpoint en la ruta base '/'

export default router;
