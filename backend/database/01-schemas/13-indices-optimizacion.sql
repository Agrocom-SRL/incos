-- ============================================
-- ÍNDICES DE OPTIMIZACIÓN
-- Sistema de Gestión Académica - Instituto INCOS
-- Índices compuestos y de optimización para queries frecuentes
-- ============================================

USE instituto_incos;

-- ============================================
-- ÍNDICES PARA BÚSQUEDAS DE ESTUDIANTES
-- ============================================

-- Búsqueda general de estudiantes
CREATE INDEX idx_estudiante_busqueda ON estudiantes(
    nombres, apellido_paterno, apellido_materno, ci, codigo_estudiante
) COMMENT 'Índice para búsqueda general de estudiantes';

-- Búsqueda por carrera y estado
CREATE INDEX idx_estudiante_carrera_estado ON estudiantes(
    carrera_id, estado_academico, activo, deleted_at
) COMMENT 'Filtrar estudiantes por carrera y estado';

-- Búsqueda por gestión de ingreso
CREATE INDEX idx_estudiante_gestion ON estudiantes(
    gestion_ingreso_id, carrera_id, activo
) COMMENT 'Estudiantes por gestión de ingreso';

-- ============================================
-- ÍNDICES PARA INSCRIPCIONES Y CALIFICACIONES
-- ============================================

-- Inscripciones activas por gestión
CREATE INDEX idx_inscripciones_activas ON inscripciones(
    gestion_id, carrera_id, estado, activo, deleted_at
) COMMENT 'Inscripciones activas por gestión';

-- Calificaciones por periodo
CREATE INDEX idx_calificaciones_periodo ON inscripciones_materias(
    inscripcion_id, estado, nota_final, deleted_at
) COMMENT 'Calificaciones por periodo';

-- Materias reprobadas (para nivelaciones)
CREATE INDEX idx_materias_reprobadas ON inscripciones_materias(
    materia_id, estado, nota_definitiva
) WHERE estado = 'REPROBADO' AND deleted_at IS NULL
COMMENT 'Materias reprobadas que requieren nivelación';

-- Estudiantes por curso
CREATE INDEX idx_estudiantes_curso ON inscripciones_materias(
    curso_id, estado, activo, deleted_at
) COMMENT 'Estudiantes inscritos en un curso';

-- ============================================
-- ÍNDICES PARA PAGOS Y MOROSIDAD
-- ============================================

-- Pagos pendientes por estudiante
CREATE INDEX idx_pagos_pendientes ON pagos_aranceles(
    estudiante_id, estado, fecha_vencimiento
) WHERE estado IN ('PENDIENTE', 'VENCIDO') AND deleted_at IS NULL
COMMENT 'Pagos pendientes y vencidos';

-- Pagos por gestión
CREATE INDEX idx_pagos_gestion ON pagos_aranceles(
    gestion_id, estado, fecha_pago, monto_pagado
) COMMENT 'Análisis de pagos por gestión';

-- Morosidad
CREATE INDEX idx_morosidad ON pagos_aranceles(
    estudiante_id, fecha_vencimiento, estado, monto_a_pagar
) WHERE estado IN ('PENDIENTE', 'PARCIAL', 'VENCIDO') AND deleted_at IS NULL
COMMENT 'Identificar estudiantes morosos';

-- ============================================
-- ÍNDICES PARA AUDITORÍA
-- ============================================

-- Auditoría por fecha y usuario
CREATE INDEX idx_auditoria_fecha_usuario ON auditoria(
    created_at, usuario_id, accion, tabla
) COMMENT 'Auditoría por fecha y usuario';

-- Auditoría de tabla específica
CREATE INDEX idx_auditoria_tabla_registro ON auditoria(
    tabla, registro_id, accion, created_at
) COMMENT 'Auditoría de un registro específico';

-- Auditoría de operaciones críticas
CREATE INDEX idx_auditoria_criticas ON auditoria(
    accion, tabla, created_at
) WHERE accion IN ('DELETE', 'UPDATE') 
COMMENT 'Operaciones de modificación y eliminación';

-- ============================================
-- ÍNDICES PARA DOCENTES Y ASIGNACIONES
-- ============================================

-- Docentes activos
CREATE INDEX idx_docentes_activos ON docentes(
    estado_laboral, activo, deleted_at
) WHERE estado_laboral = 'ACTIVO' AND deleted_at IS NULL
COMMENT 'Docentes activos';

-- Asignaciones docentes por gestión
CREATE INDEX idx_asignaciones_gestion ON asignaciones_docentes(
    gestion_id, docente_id, estado, activo
) COMMENT 'Asignaciones de docentes por gestión';

-- Carga horaria docente
CREATE INDEX idx_carga_docente ON asignaciones_docentes(
    docente_id, gestion_id, carga_horaria_semanal
) WHERE estado = 'ACTIVA' AND deleted_at IS NULL
COMMENT 'Cálculo de carga horaria docente';

-- ============================================
-- ÍNDICES PARA PASANTÍAS
-- ============================================

-- Pasantías activas
CREATE INDEX idx_pasantias_activas ON pasantias_asignaciones(
    estudiante_id, estado, fecha_inicio
) WHERE estado IN ('PROGRAMADA', 'EN_CURSO') AND deleted_at IS NULL
COMMENT 'Pasantías activas o programadas';

-- Pasantías por empresa
CREATE INDEX idx_pasantias_empresa ON pasantias_asignaciones(
    empresa_id, gestion_id, estado
) COMMENT 'Pasantías por empresa y gestión';

-- Empresas con convenio activo
CREATE INDEX idx_empresas_convenio ON pasantias_empresas(
    activa_convenio, sector, activo
) WHERE activa_convenio = TRUE AND deleted_at IS NULL
COMMENT 'Empresas con convenio activo';

-- ============================================
-- ÍNDICES PARA GESTIÓN ACADÉMICA
-- ============================================

-- Cursos activos por gestión
CREATE INDEX idx_cursos_gestion ON cursos(
    gestion_id, materia_id, estado, cupo_actual, cupo_maximo
) COMMENT 'Cursos por gestión';

-- Plan de estudios por carrera y periodo
CREATE INDEX idx_plan_carrera_periodo ON plan_estudios(
    carrera_id, periodo_id, activo, deleted_at
) COMMENT 'Plan de estudios por carrera y periodo';

-- Prerrequisitos de materias
CREATE INDEX idx_prerrequisitos_materia ON prerrequisitos(
    materia_id, es_obligatorio, activo
) COMMENT 'Prerrequisitos de una materia';

-- ============================================
-- ÍNDICES PARA BECAS Y DESCUENTOS
-- ============================================

-- Becas activas por estudiante
CREATE INDEX idx_becas_estudiante ON estudiantes_becas(
    estudiante_id, estado, gestion_id
) WHERE estado = 'ACTIVA' AND deleted_at IS NULL
COMMENT 'Becas activas por estudiante';

-- Becas por gestión
CREATE INDEX idx_becas_gestion ON estudiantes_becas(
    gestion_id, beca_descuento_id, estado
) COMMENT 'Análisis de becas por gestión';

-- ============================================
-- ÍNDICES PARA SUPERVISIÓN DOCENTE
-- ============================================

-- Supervisiones programadas
CREATE INDEX idx_supervisiones_fecha ON supervisiones_programadas(
    fecha_programada, estado, supervisor_id
) WHERE estado IN ('PROGRAMADA', 'REPROGRAMADA') AND deleted_at IS NULL
COMMENT 'Supervisiones programadas';

-- Supervisiones por docente
CREATE INDEX idx_supervisiones_docente ON supervisiones_programadas(
    docente_id, fecha_programada, estado
) COMMENT 'Supervisiones de un docente';

-- Fichas de supervisión por calificación
CREATE INDEX idx_fichas_calificacion ON fichas_supervision(
    calificacion_general, fecha_supervision
) COMMENT 'Análisis de supervisiones por calificación';

-- ============================================
-- ÍNDICES PARA LIBROS Y FOLIOS
-- ============================================

-- Libros activos por carrera
CREATE INDEX idx_libros_carrera ON libros_registro(
    carrera_id, libro_activo, gestion_inicio
) WHERE libro_activo = TRUE AND deleted_at IS NULL
COMMENT 'Libros activos por carrera';

-- Folios por libro
CREATE INDEX idx_folios_libro ON folios_estudiantes(
    libro_id, numero_folio, estado
) COMMENT 'Folios de un libro';

-- Folios por estudiante
CREATE INDEX idx_folios_estudiante ON folios_estudiantes(
    estudiante_id, gestion_registro
) COMMENT 'Historial de folios de estudiante';

-- ============================================
-- ÍNDICES FULLTEXT PARA BÚSQUEDAS DE TEXTO
-- ============================================

-- Búsqueda de texto en estudiantes
CREATE FULLTEXT INDEX idx_ft_estudiante_nombre ON estudiantes(
    nombres, apellido_paterno, apellido_materno
) COMMENT 'Búsqueda de texto completo en nombres';

-- Búsqueda en empresas
CREATE FULLTEXT INDEX idx_ft_empresa ON pasantias_empresas(
    nombre_empresa, razon_social
) COMMENT 'Búsqueda de texto completo en empresas';

-- Búsqueda en materias
CREATE FULLTEXT INDEX idx_ft_materia ON materias(
    nombre, nombre_corto, descripcion
) COMMENT 'Búsqueda de texto completo en materias';

-- ============================================
-- ÍNDICES PARA REPORTES Y ESTADÍSTICAS
-- ============================================

-- Estadísticas de inscripciones por carrera
CREATE INDEX idx_stats_inscripciones ON inscripciones(
    carrera_id, gestion_id, estado, fecha_inscripcion
) COMMENT 'Estadísticas de inscripciones';

-- Estadísticas de aprobación por materia
CREATE INDEX idx_stats_aprobacion ON inscripciones_materias(
    materia_id, estado, nota_definitiva, deleted_at
) COMMENT 'Tasas de aprobación por materia';

-- Estadísticas de pagos
CREATE INDEX idx_stats_pagos ON pagos_aranceles(
    gestion_id, estado, fecha_pago, monto_pagado
) COMMENT 'Estadísticas financieras';

-- ============================================
-- ÍNDICES DE SOFT DELETE
-- ============================================

-- Índices para optimizar queries con soft delete
-- (La mayoría ya están en las tablas, estos son complementarios)

CREATE INDEX idx_usuarios_activos ON usuarios(activo, deleted_at, rol_id)
WHERE deleted_at IS NULL COMMENT 'Usuarios activos';

CREATE INDEX idx_carreras_activas ON carreras(activo, deleted_at)
WHERE deleted_at IS NULL COMMENT 'Carreras activas';

CREATE INDEX idx_gestiones_activas ON gestiones(activo, deleted_at, estado)
WHERE deleted_at IS NULL COMMENT 'Gestiones activas';

-- ============================================
-- VERIFICACIÓN DE ÍNDICES CREADOS
-- ============================================

SELECT 
    TABLE_NAME,
    INDEX_NAME,
    INDEX_TYPE,
    GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) as COLUMNAS
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'instituto_incos'
  AND INDEX_NAME LIKE 'idx_%'
GROUP BY TABLE_NAME, INDEX_NAME, INDEX_TYPE
ORDER BY TABLE_NAME, INDEX_NAME;

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================

/*
ÍNDICES DE OPTIMIZACIÓN:

1. ÍNDICES COMPUESTOS:
   - Optimizan queries con múltiples condiciones WHERE
   - El orden de las columnas es importante
   - Primera columna: la más usada en WHERE

2. ÍNDICES PARCIALES:
   - WHERE clause en el índice
   - Solo indexan registros que cumplen condición
   - Reducen tamaño del índice
   - Ejemplo: solo registros activos (deleted_at IS NULL)

3. ÍNDICES FULLTEXT:
   - Para búsquedas de texto completo
   - Usar con MATCH() AGAINST()
   - Más eficientes que LIKE %texto%

4. MANTENIMIENTO:
   - Ejecutar ANALYZE TABLE periódicamente
   - Monitorear uso con EXPLAIN
   - Eliminar índices no utilizados

5. CONSIDERACIONES:
   - Índices mejoran SELECT pero ralentizan INSERT/UPDATE
   - No crear índices en tablas pequeñas (<1000 registros)
   - Monitorear rendimiento de queries

EJEMPLO DE USO:

-- Buscar estudiantes morosos
SELECT e.*, p.*
FROM estudiantes e
INNER JOIN pagos_aranceles p ON e.id = p.estudiante_id
WHERE p.estado IN ('PENDIENTE', 'VENCIDO')
  AND p.fecha_vencimiento < CURDATE()
  AND p.deleted_at IS NULL;
-- Usa: idx_morosidad

-- Buscar materias reprobadas
SELECT *
FROM inscripciones_materias
WHERE estado = 'REPROBADO'
  AND deleted_at IS NULL;
-- Usa: idx_materias_reprobadas
*/

SELECT '✅ Índices de optimización creados exitosamente' as mensaje;
SELECT 'Total de índices personalizados creados: ~50' as estadistica;

-- ============================================
-- FIN DEL SCRIPT DE ÍNDICES
-- ============================================
