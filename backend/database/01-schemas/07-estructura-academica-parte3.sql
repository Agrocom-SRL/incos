-- ============================================
-- ESTRUCTURA ACADÉMICA - PARTE 3
-- Sistema de Gestión Académica - Instituto INCOS
-- 6 Tablas: gestiones, gestiones_planes, actividades, periodos_academicos, actividades_calendario, asignaciones_docentes
-- ============================================

USE instituto_incos;

-- ============================================
-- FASE 1: ELIMINACIÓN DE TABLAS
-- Deshabilitamos foreign key checks para poder eliminar en cualquier orden
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar todas las tablas (orden no importa con foreign key checks deshabilitado)
DROP TABLE IF EXISTS asignaciones_docentes;
DROP TABLE IF EXISTS actividades_calendario;
DROP TABLE IF EXISTS periodos_academicos;
DROP TABLE IF EXISTS gestiones_planes;
DROP TABLE IF EXISTS gestiones;
DROP TABLE IF EXISTS actividades;

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
-- Las foreign key checks siguen deshabilitadas durante la creación
-- ============================================
-- IMPORTANTE: Orden de creación para resolver dependencias:
-- 1. gestiones (base, no depende de PARTE 2)
-- 2. gestiones_planes (depende de gestiones, no de PARTE 2)
-- 3. actividades (no depende de PARTE 2)
-- 4. periodos_academicos (depende de gestiones, no de PARTE 2)
-- 5. actividades_calendario (depende de horarios y aulas de PARTE 2)
-- 6. asignaciones_docentes (depende de gestiones_planes, cursos y docentes de PARTE 2)
--
-- EJECUCIÓN: Este archivo debe ejecutarse DESPUÉS de PARTE 2
-- porque actividades_calendario y asignaciones_docentes dependen de tablas de PARTE 2

-- ============================================
-- TABLA: gestiones
-- ============================================
-- Gestiones académicas por año
-- Permite múltiples gestiones por año: regular, verano, nivelación, etc.
-- Ejemplo: 2025-REG (regular), 2025-VER (verano), 2025-NIV (nivelación)

CREATE TABLE gestiones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL COMMENT 'Código único de la gestión (ej: 2025-REG, 2025-VER, 2025-NIV)',
    nombre VARCHAR(100) NOT NULL COMMENT 'Nombre descriptivo de la gestión (ej: Gestión Regular 2025, Curso de Verano 2025)',
    anio INT NOT NULL COMMENT 'Año académico principal',
    
    tipo ENUM(
        'REGULAR',
        'VERANO',
        'INVIERNO',
        'NIVELACION',
        'EXTRAORDINARIA'
    ) NOT NULL DEFAULT 'REGULAR' COMMENT 'Tipo de gestión',
    
    fecha_inicio DATE NOT NULL COMMENT 'Fecha de inicio de la gestión',
    fecha_fin DATE NOT NULL COMMENT 'Fecha de fin de la gestión',
    vigente BOOLEAN DEFAULT FALSE COMMENT 'Si la gestión está actualmente vigente',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- NOTA: Las Foreign Keys a usuarios se omiten para evitar dependencias circulares
    -- Los campos created_by, updated_by, deleted_by se mantienen para auditoría
    
    INDEX idx_codigo (codigo) COMMENT 'Búsqueda por código',
    INDEX idx_anio (anio) COMMENT 'Búsqueda por año',
    INDEX idx_tipo (tipo) COMMENT 'Búsqueda por tipo de gestión',
    INDEX idx_vigente (vigente) COMMENT 'Búsqueda por gestión vigente',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_anio_tipo (anio, tipo, activo, deleted_at) COMMENT 'Búsqueda por año y tipo',
    INDEX idx_fechas (fecha_inicio, fecha_fin) COMMENT 'Búsqueda por rango de fechas',
    INDEX idx_vigente_activo (vigente, activo, deleted_at) COMMENT 'Búsqueda de gestiones vigentes'
 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Gestiones académicas. Permite múltiples gestiones por año (regular, verano, nivelación, extraordinaria)';

-- ============================================
-- TABLA: gestiones_planes
-- Habilitación de planes de estudio por gestión
-- ============================================
-- Define qué planes de estudio están habilitados en cada gestión académica.
-- Es la "autorización oficial" para ofertar las materias de un plan.
-- Tabla pequeña: ~3-10 registros por gestión (uno por carrera/plan activo).

CREATE TABLE gestiones_planes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gestion_id INT NULL COMMENT 'Gestión académica donde se habilita el plan',
    plan_estudio_id INT NULL COMMENT 'Plan de estudios habilitado',
    nombre VARCHAR(200) NOT NULL COMMENT 'Nombre descriptivo (ej: Oferta Gestión 2025 - Plan 2023 Sistemas Informáticos)',
    
    -- Estado de habilitación
    estado ENUM('PROPUESTO', 'APROBADO', 'VIGENTE', 'CERRADO', 'CANCELADO') DEFAULT 'PROPUESTO'
        COMMENT 'Estado de habilitación del plan en esta gestión',
    motivo_cancelacion TEXT COMMENT 'Motivo si fue cancelado',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Indica si la habilitación está activa',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación del registro',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Fecha de eliminación lógica (soft delete)',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',
    
    -- NOTA: Las Foreign Keys a usuarios se omiten para evitar dependencias circulares
    -- Los campos created_by, updated_by, deleted_by se mantienen para auditoría
    
    FOREIGN KEY (gestion_id) REFERENCES gestiones(id) ON DELETE SET NULL,
    FOREIGN KEY (plan_estudio_id) REFERENCES planes_estudios(id) ON DELETE SET NULL,
    
    INDEX idx_gestion_id (gestion_id) COMMENT 'Búsqueda por gestión',
    INDEX idx_plan_estudio_id (plan_estudio_id) COMMENT 'Búsqueda por plan',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_gestion_plan (gestion_id, plan_estudio_id, deleted_at) COMMENT 'Búsqueda combinada'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Habilitación de planes de estudio por gestión. Define qué planes están autorizados para ofertar en cada año académico. Tabla pequeña: ~3-10 registros por gestión';

-- ============================================
-- TABLA: actividades
-- ============================================
-- Catálogo maestro de actividades académicas reutilizables entre gestiones
-- Ejemplo: "Inscripción de estudiantes", "Feriado Estado Plurinacional", "Inauguración"

CREATE TABLE actividades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL COMMENT 'Nombre de la actividad',
    descripcion TEXT COMMENT 'Descripción detallada de la actividad',
    
    -- Clasificación (OPCIONAL - puede ser NULL)
    tipo ENUM(
        'INSCRIPCION',
        'PLANIFICACION',
        'ACADEMICA',
        'EVALUACION',
        'ADMINISTRATIVA',
        'FERIADO',
        'EVENTO_INSTITUCIONAL',
        'FERIA',
        'MODALIDAD_GRADO',
        'OTRO'
    ) COMMENT 'Tipo de actividad (opcional, NULL si no aplica clasificación)',
    es_destacada BOOLEAN DEFAULT FALSE COMMENT 'Si es una actividad importante/destacada en el calendario',
    icono VARCHAR(50) COMMENT 'Nombre del icono para UI (opcional)',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- NOTA: Las Foreign Keys a usuarios se omiten para evitar dependencias circulares
    -- Los campos created_by, updated_by, deleted_by se mantienen para auditoría
    
    INDEX idx_tipo (tipo) COMMENT 'Búsqueda por tipo',
    INDEX idx_destacada (es_destacada) COMMENT 'Filtrado por actividades destacadas',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_nombre (nombre) COMMENT 'Búsqueda por nombre'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Catálogo maestro de actividades académicas reutilizables entre gestiones. El código se genera en actividades_calendario.';

-- ============================================
-- TABLA: periodos_academicos
-- ============================================
-- Periodos académicos temporales dentro de una gestión
-- Son contenedores de tiempo que agrupan actividades
-- Los periodos NO se solapan entre sí

CREATE TABLE periodos_academicos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gestion_id INT NULL COMMENT 'Gestión académica (NULL permite flexibilidad)',
    codigo VARCHAR(50) COMMENT 'Código del periodo autogenerado (ej: 2025-PLAN, 2025-BIM1, 2025-CLAU)',
    nombre VARCHAR(100) NOT NULL COMMENT 'Nombre del periodo (ej: Planificación, Primer Bimestre, Clausura)',
    
    division ENUM(
        'PLANIFICACION',
        'MENSUAL',
        'BIMESTRE',
        'TRIMESTRE',
        'CUATRIMESTRE',
        'SEMESTRE',
        'CLAUSURA',
        'OTRO'
    ) NOT NULL COMMENT 'División/tipo de periodo académico',
    
    numero_orden INT COMMENT 'Orden del periodo (1, 2, 3, 4 para bimestres; NULL para periodos únicos como planificación/clausura)',
    fecha_inicio DATE NOT NULL COMMENT 'Fecha de inicio del periodo',
    fecha_fin DATE NOT NULL COMMENT 'Fecha de fin del periodo',
    color_hex VARCHAR(7) COMMENT 'Color para mostrar en calendario (ej: #4CAF50 planificación, #2196F3 bimestres, #9E9E9E clausura)',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- NOTA: Las Foreign Keys a usuarios se omiten para evitar dependencias circulares
    -- Los campos created_by, updated_by, deleted_by se mantienen para auditoría
    
    FOREIGN KEY (gestion_id) REFERENCES gestiones(id) ON DELETE SET NULL,
    
    INDEX idx_gestion_id (gestion_id) COMMENT 'Búsqueda por gestión',
    INDEX idx_codigo (codigo) COMMENT 'Búsqueda por código',
    INDEX idx_division (division) COMMENT 'Búsqueda por división',
    INDEX idx_numero_orden (numero_orden) COMMENT 'Búsqueda por orden',
    INDEX idx_fecha_inicio (fecha_inicio) COMMENT 'Búsqueda por fecha de inicio',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_gestion_orden (gestion_id, numero_orden, activo, deleted_at) COMMENT 'Periodos ordenados por gestión',
    INDEX idx_gestion_division (gestion_id, division, activo) COMMENT 'Búsqueda por gestión y división',
    INDEX idx_fechas (fecha_inicio, fecha_fin) COMMENT 'Búsqueda por rango de fechas'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Periodos académicos temporales (contenedores de actividades). Los periodos NO se solapan. Incluye: Planificación, Bimestres, Clausura.';

-- ============================================
-- TABLA: actividades_calendario
-- Instancias de actividades del calendario académico
-- ============================================
-- Vincula actividades del catálogo a periodos con fechas concretas.
-- Usa la tabla horarios para definir horarios de clases, eventos y feriados.
-- Permite asignar aulas a actividades que requieren espacio físico.

CREATE TABLE actividades_calendario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    periodo_academico_id INT NULL COMMENT 'Periodo académico al que pertenece',
    actividad_id INT NULL COMMENT 'Referencia a la actividad del catálogo (NULL si es actividad única sin catálogo)',
    
    -- Código autogenerado y alcance de la actividad
    codigo VARCHAR(50) COMMENT 'Código autogenerado (ej: 2025-BIM1-001, 2025-PLAN-005)',
    nombre_personalizado VARCHAR(200) COMMENT 'Nombre personalizado para esta instancia (NULL usa el del catálogo). Incluye detalles como año de carrera si aplica',
    carreras_ids JSON COMMENT 'Array de IDs de carreras específicas a las que aplica esta actividad (NULL = todas las carreras). Ej: [1,2] para Contaduría y Administración',
    
    -- Fechas
    fecha_inicio DATE NOT NULL COMMENT 'Fecha de inicio de la actividad',
    fecha_fin DATE COMMENT 'Fecha de fin (NULL si es actividad de un solo día)',
    
    -- Horario y aula
    horario_id INT NULL COMMENT 'Horario de la actividad (clases, evento o feriado) de la tabla horarios (NULL = sin horario específico)',
    aula_id INT NULL COMMENT 'Aula asignada a la actividad (NULL si no requiere aula o es virtual)',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- NOTA: Las Foreign Keys a usuarios se omiten para evitar dependencias circulares
    -- Los campos created_by, updated_by, deleted_by se mantienen para auditoría
    
    FOREIGN KEY (periodo_academico_id) REFERENCES periodos_academicos(id) ON DELETE SET NULL,
    FOREIGN KEY (actividad_id) REFERENCES actividades(id) ON DELETE SET NULL,
    FOREIGN KEY (horario_id) REFERENCES horarios(id) ON DELETE SET NULL,
    FOREIGN KEY (aula_id) REFERENCES aulas(id) ON DELETE SET NULL,
    
    -- Índices para optimización
    INDEX idx_periodo_academico_id (periodo_academico_id) COMMENT 'Búsqueda por periodo académico',
    INDEX idx_actividad_id (actividad_id) COMMENT 'Búsqueda por actividad',
    INDEX idx_horario_id (horario_id) COMMENT 'Búsqueda por horario',
    INDEX idx_aula_id (aula_id) COMMENT 'Búsqueda por aula',
    INDEX idx_codigo (codigo) COMMENT 'Búsqueda por código',
    INDEX idx_fecha_inicio (fecha_inicio) COMMENT 'Búsqueda por fecha de inicio',
    INDEX idx_fecha_fin (fecha_fin) COMMENT 'Búsqueda por fecha de fin',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_periodo_fechas (periodo_academico_id, fecha_inicio, activo) COMMENT 'Búsqueda por periodo y fechas'
 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Calendario académico: instancias de actividades con fechas específicas. Usa tabla horarios para clases, eventos y feriados';

-- ============================================
-- TABLA: asignaciones_docentes
-- Asignación de docentes a cursos por plan habilitado
-- ============================================
-- Vincula QUÉ curso se dicta EN QUÉ plan habilitado CON QUÉ docente.
-- Preserva historial de asignaciones por gestión para auditoría.
-- El plan habilitado (gestiones_planes) garantiza coherencia entre curso y plan.
--
-- Cambios sincronizados desde servidor/phpMyAdmin:
-- - practico_override
-- - teorico_override
-- - politica_asistencia
-- - minimo_asistencia
-- - nota_reprobada
-- - peso_asistencia
-- - índice idx_politica_asistencia
--
-- Reglas mantenidas:
-- - Todas las FKs permiten NULL
-- - Todas las FKs usan ON DELETE SET NULL
-- - Sin UNIQUE
-- - Sin CHECK
-- - Auditoría estándar conservada
-- ============================================

CREATE TABLE asignaciones_docentes (
    id INT AUTO_INCREMENT PRIMARY KEY,

    gestion_plan_id INT NULL COMMENT 'Plan habilitado en la gestión (garantiza que curso pertenece al plan correcto)',
    curso_id INT NULL COMMENT 'Curso (paralelo + materia) que se dicta',
    docente_id INT NULL COMMENT 'Docente asignado (NULL = pendiente de asignación)',

    -- Carga horaria
    carga_horaria INT NULL COMMENT 'Horas de docencia por semana en este curso (hereda de asignaturas_plan.horas_semanales si NULL)',

    -- Overrides económicos por docente/asignación
    practico_override DECIMAL(5,2) NULL COMMENT 'Override de la cuota práctica institucional (cuota_teorico_practico). NULL = usar la cuota institucional de la gestión.',
    teorico_override DECIMAL(5,2) NULL COMMENT 'Override de la cuota teórica institucional (cuota_teorico_practico). NULL = usar la cuota institucional de la gestión.',

    -- Política de asistencia definida para esta asignación docente
    politica_asistencia ENUM('NO_AFECTA','COMPUTA_NOTA','CAUSA_REPROBACION')
        DEFAULT 'NO_AFECTA'
        COMMENT 'Política del docente sobre asistencia: NO_AFECTA (no influye en la nota), COMPUTA_NOTA (es componente de la nota), CAUSA_REPROBACION (si baja del mínimo, reprueba sin importar las notas)',

    minimo_asistencia DECIMAL(5,2) NULL COMMENT 'Porcentaje mínimo de asistencia exigido (0-100). Solo aplica si politica_asistencia = CAUSA_REPROBACION. Si el estudiante baja de este porcentaje, se aplica nota_si_reprueba_por_asistencia.',
    nota_reprobada DECIMAL(5,2) NULL COMMENT 'Nota final asignada al estudiante si reprueba por asistencia (ej: 0 o 50). Solo aplica si politica_asistencia = CAUSA_REPROBACION.',
    peso_asistencia DECIMAL(5,2) NULL COMMENT 'Peso de la asistencia en la nota_final (0-100). Solo aplica si politica_asistencia = COMPUTA_NOTA.',

    -- Estado de la asignación
    fecha_asignacion DATE NULL COMMENT 'Fecha en que se asignó el docente',
    motivo TEXT COMMENT 'Motivo de cancelación o rechazo (solo si vigente=FALSE)',
    vigente BOOLEAN DEFAULT TRUE COMMENT 'Si la asignación está vigente (FALSE = cancelada o rechazada)',

    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Indica si el registro está activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación del registro',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Fecha de eliminación lógica (soft delete)',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    -- NOTA: Las Foreign Keys a usuarios se omiten para evitar dependencias circulares
    -- Los campos created_by, updated_by, deleted_by se mantienen para auditoría

    FOREIGN KEY (gestion_plan_id) REFERENCES gestiones_planes(id) ON DELETE SET NULL,
    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE SET NULL,
    FOREIGN KEY (docente_id) REFERENCES docentes(id) ON DELETE SET NULL,

    INDEX idx_gestion_plan_id (gestion_plan_id) COMMENT 'Búsqueda por plan habilitado',
    INDEX idx_curso_id (curso_id) COMMENT 'Búsqueda por curso',
    INDEX idx_docente_id (docente_id) COMMENT 'Búsqueda por docente',
    INDEX idx_vigente (vigente) COMMENT 'Filtrado por asignaciones vigentes',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_gestion_plan_curso (gestion_plan_id, curso_id, deleted_at) COMMENT 'Búsqueda por plan y curso',
    INDEX idx_gestion_plan_docente (gestion_plan_id, docente_id, vigente, deleted_at) COMMENT 'Carga horaria del docente por gestión',
    INDEX idx_curso_vigente (curso_id, vigente, deleted_at) COMMENT 'Asignaciones vigentes por curso',
    INDEX idx_politica_asistencia (politica_asistencia) COMMENT 'Filtrado por política de asistencia'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Asignación de docentes a cursos por plan habilitado. Vincula curso + plan_habilitado + docente. Preserva historial para auditoría académica. El docente puede ser NULL (pendiente).';


-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

