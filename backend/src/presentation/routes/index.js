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
    DOCENTES_TOKENS,
    ASIGNACIONES_DOCENTES_TOKENS,
    AULAS_HORARIOS_TOKENS,
    CAPACITACION_TOKENS,
    TUTORIAS_TOKENS,
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
            planesEstudios: '/api/v1/planes-estudios',
            periodos: '/api/v1/periodos',
            asignaturasPlan: '/api/v1/asignaturas-plan',
            prerrequisitos: '/api/v1/prerrequisitos',
            actividades: '/api/v1/actividades',
            aulas: '/api/v1/aulas',
            tiposEvaluacion: '/api/v1/tipos-evaluacion',
            // Módulo: Académico
            paralelos: '/api/v1/paralelos',
            gestiones: '/api/v1/gestiones',
            gestionesPlanes: '/api/v1/gestiones-planes',
            paralelosGestion: '/api/v1/paralelos-gestion',
            ofertaCursos: '/api/v1/oferta-cursos',
            calificaciones: '/api/v1/calificaciones',
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
            docentes: '/api/v1/docentes',
            docentesAsignaciones: '/api/v1/docentes/asignaciones',
            docentesPlanesHabilitados: '/api/v1/docentes/planes-habilitados',
            docentesPeriodosDisponibles: '/api/v1/docentes/periodos-disponibles?gestionPlanId=',
            docentesParalelosDisponibles: '/api/v1/docentes/paralelos-disponibles',
            docentesCursosPorParalelo: '/api/v1/docentes/cursos-por-paralelo?paraleloId=',
            docentesCursosDisponibles: '/api/v1/docentes/cursos-disponibles?gestionPlanId=',
            docentesCursoHorarios: '/api/v1/docentes/cursos/:cursoId/horarios',
            aulasCatalogo: '/api/v1/aulas/catalogo',
            aulasHorarios: '/api/v1/aulas/horarios',
            // Módulo: Capacitación (CAP)
            cursosCapacitacion: '/api/v1/cursos-capacitacion',
            participantes: '/api/v1/participantes',
            inscripcionesCapacitacion: '/api/v1/inscripciones-capacitacion',
            // Módulo: Tutorías y Acompañamiento (TUT)
            proyectosGrado: '/api/v1/proyectos-grado',
            acompanamiento: '/api/v1/acompanamiento',
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
router.use('/planes-estudios', container.resolve(CONFIGURACION_TOKENS.planesEstudiosRouter));
router.use('/periodos', container.resolve(CONFIGURACION_TOKENS.periodosRouter));
router.use('/asignaturas-plan', container.resolve(CONFIGURACION_TOKENS.asignaturasPlanRouter));
router.use('/prerrequisitos', container.resolve(CONFIGURACION_TOKENS.prerrequisitosRouter));
router.use('/actividades', container.resolve(CONFIGURACION_TOKENS.actividadesRouter));
// Administración del catálogo Tipos de Evaluación (CRUD); distinto de
// GET /calificaciones/tipos-evaluacion (combo de solo lectura del cuaderno)
router.use('/tipos-evaluacion', container.resolve(CONFIGURACION_TOKENS.tiposEvaluacionRouter));
// Nota: la administración CRUD del catálogo Aulas (CONFIGURACION_TOKENS.aulasRouter)
// se monta más abajo, DESPUÉS de AULAS_HORARIOS_TOKENS.aulasHorariosRouter (módulo
// Docentes) — ambos comparten el prefijo '/aulas' y el picker tiene la ruta
// literal '/catalogo' que debe resolverse antes que el '/:id' genérico del CRUD.

// ============================================
// 3. MÓDULO: ACADÉMICO
// ============================================
router.use('/paralelos', container.resolve(ACADEMICO_TOKENS.paralelosRouter));
router.use('/gestiones', container.resolve(ACADEMICO_TOKENS.gestionesRouter));
router.use('/gestiones-planes', container.resolve(ACADEMICO_TOKENS.gestionesPlanesRouter));
router.use('/paralelos-gestion', container.resolve(ACADEMICO_TOKENS.paralelosGestionRouter));
router.use('/oferta-cursos', container.resolve(ACADEMICO_TOKENS.ofertaCursosRouter));
router.use('/calificaciones', container.resolve(ACADEMICO_TOKENS.calificacionesRouter));
router.use('/asistencia', container.resolve(ACADEMICO_TOKENS.asistenciaRouter));
router.use('/asistencia/licencias', container.resolve(ACADEMICO_TOKENS.licenciasRouter));
router.use('/asignacion-horarios', container.resolve(ACADEMICO_TOKENS.asignacionHorariosRouter));
router.use('/conflictos', container.resolve(ACADEMICO_TOKENS.conflictosRouter));
router.use('/horarios/docentes', container.resolve(ACADEMICO_TOKENS.horariosDocenteRouter));

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

// ============================================
// 9. MÓDULO: DOCENTES
// ============================================
router.use('/docentes', container.resolve(DOCENTES_TOKENS.docentesRouter));
router.use(
  '/asignaciones-docentes',
  container.resolve(ASIGNACIONES_DOCENTES_TOKENS.asignacionesDocentesRouter)
);
router.use('/aulas', container.resolve(AULAS_HORARIOS_TOKENS.aulasHorariosRouter));
// CRUD de administración del catálogo Aulas — montado DESPUÉS del router anterior
// a propósito: aulasHorariosRouter solo define GET '/catalogo' (ruta literal), y
// este router define GET '/:id' (genérico). Si se montara antes, '/:id' capturaría
// '/catalogo' como si fuera un id y rompería el picker de oferta académica.
router.use('/aulas', container.resolve(CONFIGURACION_TOKENS.aulasRouter));

// ============================================
// 10. MÓDULO: CAPACITACIÓN (CAP)
// ============================================
router.use('/cursos-capacitacion', container.resolve(CAPACITACION_TOKENS.cursosCapacitacionRouter));
router.use('/participantes', container.resolve(CAPACITACION_TOKENS.participantesRouter));
router.use(
  '/inscripciones-capacitacion',
  container.resolve(CAPACITACION_TOKENS.inscripcionesCapacitacionRouter)
);

// ============================================
// 11. MÓDULO: TUTORÍAS Y ACOMPAÑAMIENTO (TUT)
// ============================================
router.use('/proyectos-grado', container.resolve(TUTORIAS_TOKENS.proyectosGradoRouter));
router.use('/acompanamiento', container.resolve(TUTORIAS_TOKENS.acompanamientoRouter));

// Para agregar un nuevo módulo:
// 1. Crear archivo: routes/{modulo}.routes.js
// 2. Importar: import {modulo}Routes from './{modulo}.routes.js';
// 3. Montar: router.use('/{modulo}', {modulo}Routes);
// 4. Agregar endpoint en la ruta base '/'

export default router;
