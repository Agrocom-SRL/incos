import express from 'express';
import container from '../../infrastructure/container/index.js';
import {
    AUTH_TOKENS,
    SEGURIDAD_TOKENS,
    ESTUDIANTES_TOKENS,
    CONFIGURACION_TOKENS,
    ACADEMICO_TOKENS,
    GEOGRAFICOS_TOKENS,
    REFERENCIA_TOKENS,
    INSCRIPCIONES_TOKENS,
    PAGOS_TOKENS,
    DASHBOARD_TOKENS,
} from '../../infrastructure/container/tokens/index.js';

const router = express.Router();

// ============================================
// RUTA BASE - Información de la API
// ============================================
router.get('/', (req, res) => {
    res.json({
        message: 'API Instituto INCOS',
        version: '1.2.0',
        endpoints: {
            auth: '/api/v1/auth',
            usuarios: '/api/v1/usuarios',
            roles: '/api/v1/roles',
            permisos: '/api/v1/permisos',
            // Módulo: Estudiantes
            estudiantes: '/api/v1/estudiantes',
            becasDescuentos: '/api/v1/becas-descuentos',
            // Módulo: Configuración
            carreras: '/api/v1/carreras',
            materias: '/api/v1/materias',
            // Módulo: Académico
            paralelos: '/api/v1/paralelos',
            gestiones: '/api/v1/gestiones',
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
            // Módulo: Pagos
            metodosPago: '/api/v1/metodos-pago',
            bancosAutorizados: '/api/v1/bancos-autorizados',
            cuentasPago: '/api/v1/cuentas-pago',
            configuracionAportes: '/api/v1/configuracion-aportes',
            pagosAportes: '/api/v1/pagos-aportes',
            dashboard: '/api/v1/dashboard',
        },
    });
});

// ============================================
// MÓDULOS - Rutas organizadas por dominio
// ============================================
// Estructura basada en frontend/src/infrastructure/api/endpoints.js

// ============================================
// 0. MÓDULO: AUTH
// ============================================
router.use('/auth', container.resolve(AUTH_TOKENS.authRouter));

// ============================================
// 0b. MÓDULO: SEGURIDAD (usuarios, roles, catálogo permisos)
// ============================================
router.use('/usuarios', container.resolve(SEGURIDAD_TOKENS.usuariosRouter));
router.use('/roles', container.resolve(SEGURIDAD_TOKENS.rolesRouter));
router.use('/permisos', container.resolve(SEGURIDAD_TOKENS.permisosRouter));

// ============================================
// 1. MÓDULO: ESTUDIANTES
// ============================================
router.use('/estudiantes', container.resolve(ESTUDIANTES_TOKENS.estudiantesRouter));
router.use('/becas-descuentos', container.resolve(ESTUDIANTES_TOKENS.becasDescuentosRouter));

// ============================================
// 2. MÓDULO: CONFIGURACIÓN
// ============================================
router.use('/carreras', container.resolve(CONFIGURACION_TOKENS.carrerasRouter));
router.use('/materias', container.resolve(CONFIGURACION_TOKENS.materiasRouter));

// ============================================
// 3. MÓDULO: ACADÉMICO
// ============================================
router.use('/paralelos', container.resolve(ACADEMICO_TOKENS.paralelosRouter));
router.use('/gestiones', container.resolve(ACADEMICO_TOKENS.gestionesRouter));

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

// ============================================
// 7. MÓDULO: PAGOS
// ============================================
router.use('/metodos-pago', container.resolve(PAGOS_TOKENS.metodosPagoRouter));
router.use('/bancos-autorizados', container.resolve(PAGOS_TOKENS.bancosAutorizadosRouter));
router.use('/cuentas-pago', container.resolve(PAGOS_TOKENS.cuentasPagoRouter));
router.use('/configuracion-aportes', container.resolve(PAGOS_TOKENS.configuracionAportesRouter));
router.use('/pagos-aportes', container.resolve(PAGOS_TOKENS.pagosAportesRouter));

// ============================================
// 8. MÓDULO: DASHBOARD
// ============================================
router.use('/dashboard', container.resolve(DASHBOARD_TOKENS.dashboardRouter));

// Para agregar un nuevo módulo:
// 1. Crear archivo: routes/{modulo}.routes.js
// 2. Importar: import {modulo}Routes from './{modulo}.routes.js';
// 3. Montar: router.use('/{modulo}', {modulo}Routes);
// 4. Agregar endpoint en la ruta base '/'

export default router;
