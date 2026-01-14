import express from 'express';
import container from '../../infrastructure/container/index.js';
import {
    ESTUDIANTES_TOKENS,
    CONFIGURACION_TOKENS,
    ACADEMICO_TOKENS,
    GEOGRAFICOS_TOKENS,
    REFERENCIA_TOKENS,
    INSCRIPCIONES_TOKENS,
} from '../../infrastructure/container/tokens/index.js';

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
            // Módulo: Académico
            paralelos: '/api/v1/paralelos',
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
            // Módulo: Inscripciones
            inscripciones: '/api/v1/inscripciones',
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
router.use('/estudiantes', container.resolve(ESTUDIANTES_TOKENS.estudiantesRouter));

// ============================================
// 2. MÓDULO: CONFIGURACIÓN
// ============================================
router.use('/carreras', container.resolve(CONFIGURACION_TOKENS.carrerasRouter));
router.use('/materias', container.resolve(CONFIGURACION_TOKENS.materiasRouter));

// ============================================
// 3. MÓDULO: ACADÉMICO
// ============================================
router.use('/paralelos', container.resolve(ACADEMICO_TOKENS.paralelosRouter));

// ============================================
// 4. MÓDULO: GEOGRÁFICOS
// ============================================
router.use('/paises', container.resolve(GEOGRAFICOS_TOKENS.paisesRouter));
router.use('/departamentos', container.resolve(GEOGRAFICOS_TOKENS.departamentosRouter));
router.use('/provincias', container.resolve(GEOGRAFICOS_TOKENS.provinciasRouter));
router.use('/municipios', container.resolve(GEOGRAFICOS_TOKENS.municipiosRouter));

// ============================================
// 5. MÓDULO: REFERENCIA
// ============================================
router.use('/idiomas', container.resolve(REFERENCIA_TOKENS.idiomasRouter));
router.use('/estados-civiles', container.resolve(REFERENCIA_TOKENS.estadosCivilesRouter));
router.use('/tipos-parentesco', container.resolve(REFERENCIA_TOKENS.tiposParentescoRouter));
router.use('/documentacion', container.resolve(REFERENCIA_TOKENS.documentacionRouter));
router.use('/discapacidad', container.resolve(REFERENCIA_TOKENS.discapacidadRouter));

// ============================================
// 6. MÓDULO: INSCRIPCIONES
// ============================================
router.use('/inscripciones', container.resolve(INSCRIPCIONES_TOKENS.inscripcionesRouter));

// Para agregar un nuevo módulo:
// 1. Crear archivo: routes/{modulo}.routes.js
// 2. Importar: import {modulo}Routes from './{modulo}.routes.js';
// 3. Montar: router.use('/{modulo}', {modulo}Routes);
// 4. Agregar endpoint en la ruta base '/'

export default router;
