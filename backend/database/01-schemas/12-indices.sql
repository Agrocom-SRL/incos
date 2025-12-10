-- ============================================
-- ÍNDICES ADICIONALES DE OPTIMIZACIÓN
-- Sistema de Gestión Académica - Instituto INCOS
-- Índices compuestos para mejorar performance de queries frecuentes
-- ============================================

USE instituto_incos;

-- ============================================
-- ÍNDICES COMPUESTOS PARA ESTUDIANTES
-- ============================================

-- Búsqueda de estudiantes por carrera y estado
ALTER TABLE estudiantes 
ADD INDEX idx_carrera_estado (carrera_id, estado_academico, deleted_at);

-- Búsqueda de estudiantes por gestión de ingreso
ALTER TABLE estudiantes
ADD INDEX idx_gestion_carrera (gestion_ingreso_id, carrera_id, deleted_at);

-- Búsqueda de estudiantes activos por carrera
ALTER TABLE estudiantes
ADD INDEX idx_carrera_activo_deleted (carrera_id, activo, deleted_at);

-- Full-text search en nombres (para búsqueda rápida)
ALTER TABLE estudiantes
ADD FULLTEXT INDEX idx_ft_nombres (nombres, apellido_paterno, apellido_materno);

-- ============================================
-- ÍNDICES COMPUESTOS PARA INSCRIPCIONES
-- ============================================

-- Inscripciones por gestión, carrera y estado
ALTER TABLE inscripciones
ADD INDEX idx_gestion_carrera_estado (gestion_id, carrera_id, estado, deleted_at);

-- Inscripciones de un estudiante por gestión
ALTER TABLE inscripciones
ADD INDEX idx_estudiante_gestion_estado (estudiante_id, gestion_id, estado, deleted_at);

-- Inscripciones por turno y gestión
ALTER TABLE inscripciones
ADD INDEX idx_gestion_turno (gestion_id, turno, deleted_at);

-- ============================================
-- ÍNDICES COMPUESTOS PARA CALIFICACIONES
-- ============================================

-- Calificaciones por inscripción y estado
ALTER TABLE inscripciones_materias
ADD INDEX idx_inscripcion_estado (inscripcion_id, estado, deleted_at);

-- Calificaciones por docente y curso
ALTER TABLE inscripciones_materias
ADD INDEX idx_docente_curso (docente_id, curso_id, deleted_at);

-- Materias por estado y acta cerrada
ALTER TABLE inscripciones_materias
ADD INDEX idx_estado_acta (estado, acta_cerrada, deleted_at);

-- Calificaciones reprobadas (para nivelación)
ALTER TABLE inscripciones_materias
ADD INDEX idx_reprobadas (estado, deleted_at) 
WHERE estado = 'REPROBADO';

-- Calificaciones con recuperatorio pendiente
ALTER TABLE inscripciones_materias
ADD INDEX idx_recuperatorio_pendiente (nota_final, nota_recuperatorio, deleted_at);

-- ============================================
-- ÍNDICES COMPUESTOS PARA CURSOS
-- ============================================

-- Cursos por materia, gestión y estado
ALTER TABLE cursos
ADD INDEX idx_materia_gestion_estado (materia_id, gestion_id, estado, deleted_at);

-- Cursos con cupo disponible
ALTER TABLE cursos
ADD INDEX idx_cupo_disponible (cupo_actual, cupo_maximo, estado, deleted_at);

-- ============================================
-- ÍNDICES COMPUESTOS PARA DOCENTES
-- ============================================

-- Docentes activos por estado laboral
ALTER TABLE docentes
ADD INDEX idx_estado_laboral_activo (estado_laboral, activo, deleted_at);

-- Asignaciones docentes por gestión y estado
ALTER TABLE asignaciones_docentes
ADD INDEX idx_gestion_estado (gestion_id, estado, deleted_at);

-- Asignaciones por docente y gestión
ALTER TABLE asignaciones_docentes
ADD INDEX idx_docente_gestion (docente_id, gestion_id, deleted_at);

-- ============================================
-- ÍNDICES COMPUESTOS PARA PAGOS
-- ============================================

-- Pagos pendientes por estudiante
ALTER TABLE pagos_aranceles
ADD INDEX idx_estudiante_estado_fecha (estudiante_id, estado, fecha_vencimiento, deleted_at);

-- Pagos por gestión y concepto
ALTER TABLE pagos_aranceles
ADD INDEX idx_gestion_concepto (gestion_id, concepto, estado, deleted_at);

-- Pagos vencidos (para reportes de morosidad)
ALTER TABLE pagos_aranceles
ADD INDEX idx_vencidos (fecha_vencimiento, estado, deleted_at)
WHERE estado IN ('PENDIENTE', 'PAGADO_PARCIAL');

-- Detalle de pagos por fecha
ALTER TABLE detalle_pagos
ADD INDEX idx_fecha_metodo (fecha_pago, metodo_pago, deleted_at);

-- ============================================
-- ÍNDICES COMPUESTOS PARA BECAS
-- ============================================

-- Becas activas por estudiante y gestión
ALTER TABLE estudiantes_becas
ADD INDEX idx_estudiante_gestion_estado (estudiante_id, gestion_id, estado, deleted_at);

-- Becas por tipo y estado
ALTER TABLE estudiantes_becas
ADD INDEX idx_beca_estado (beca_descuento_id, estado, deleted_at);

-- ============================================
-- ÍNDICES COMPUESTOS PARA PASANTÍAS
-- ============================================

-- Pasantías por estudiante y estado
ALTER TABLE pasantias_asignaciones
ADD INDEX idx_estudiante_estado (estudiante_id, estado, deleted_at);

-- Pasantías por empresa y gestión
ALTER TABLE pasantias_asignaciones
ADD INDEX idx_empresa_gestion (empresa_id, gestion_id, estado, deleted_at);

-- Pasantías por supervisor
ALTER TABLE pasantias_asignaciones
ADD INDEX idx_supervisor_estado (docente_supervisor_id, estado, deleted_at);

-- ============================================
-- ÍNDICES COMPUESTOS PARA SUPERVISIONES
-- ============================================

-- Supervisiones por docente y fecha
ALTER TABLE supervisiones_programadas
ADD INDEX idx_docente_fecha (docente_id, fecha_programada, estado, deleted_at);

-- Supervisiones por supervisor y mes
ALTER TABLE supervisiones_programadas
ADD INDEX idx_supervisor_fecha (supervisor_id, fecha_programada, deleted_at);

-- ============================================
-- ÍNDICES COMPUESTOS PARA LICENCIAS
-- ============================================

-- Licencias por estudiante y gestión
ALTER TABLE licencias_solicitudes
ADD INDEX idx_estudiante_gestion_estado (estudiante_id, gestion_id, estado, deleted_at);

-- Licencias pendientes de aprobación
ALTER TABLE licencias_solicitudes
ADD INDEX idx_pendientes (estado, fecha_solicitud, deleted_at)
WHERE estado = 'PENDIENTE';

-- ============================================
-- ÍNDICES COMPUESTOS PARA NIVELACIONES
-- ============================================

-- Nivelaciones por estudiante y materia
ALTER TABLE historial_nivelaciones
ADD INDEX idx_estudiante_materia_estado (estudiante_id, materia_id, estado, deleted_at);

-- Nivelaciones por gestión y estado
ALTER TABLE historial_nivelaciones
ADD INDEX idx_gestion_estado (gestion_nivelacion_id, estado, deleted_at);

-- ============================================
-- ÍNDICES COMPUESTOS PARA HISTORIAL ACADÉMICO
-- ============================================

-- Folios por libro
ALTER TABLE folios_estudiantes
ADD INDEX idx_libro_folio (libro_id, numero_folio, deleted_at);

-- Folios por estado final
ALTER TABLE folios_estudiantes
ADD INDEX idx_estado_libro (estado_final, libro_id, deleted_at);

-- ============================================
-- ÍNDICES COMPUESTOS PARA AUDITORÍA
-- ============================================

-- Auditoría por usuario y fecha
ALTER TABLE auditoria
ADD INDEX idx_usuario_fecha_accion (usuario_id, created_at, accion);

-- Auditoría por tabla y registro
ALTER TABLE auditoria
ADD INDEX idx_tabla_registro_fecha (tabla, registro_id, created_at);

-- Auditoría por módulo
ALTER TABLE auditoria
ADD INDEX idx_modulo_fecha (modulo, created_at);

-- ============================================
-- ÍNDICES COMPUESTOS PARA SEGURIDAD
-- ============================================

-- Usuarios por rol y estado
ALTER TABLE usuarios
ADD INDEX idx_rol_estado (rol_id, estado, deleted_at);

-- Usuarios activos
ALTER TABLE usuarios
ADD INDEX idx_activo_estado_deleted (activo, estado, deleted_at);

-- ============================================
-- ÍNDICES PARA BÚSQUEDAS DE TEXTO
-- ============================================

-- Full-text para búsqueda en empresas
ALTER TABLE pasantias_empresas
ADD FULLTEXT INDEX idx_ft_empresa (nombre_empresa, razon_social, rubro);

-- Full-text para búsqueda en materias
ALTER TABLE materias
ADD FULLTEXT INDEX idx_ft_materia (nombre, descripcion);

-- ============================================
-- ÍNDICES DE FECHAS PARA REPORTES
-- ============================================

-- Índice por fecha de inscripción
ALTER TABLE inscripciones
ADD INDEX idx_fecha_inscripcion_gestion (fecha_inscripcion, gestion_id, deleted_at);

-- Índice por fecha de pago
ALTER TABLE pagos_aranceles
ADD INDEX idx_fecha_emision_estado (fecha_emision, estado, deleted_at);

-- Índice por fecha de pasantía
ALTER TABLE pasantias_asignaciones
ADD INDEX idx_fecha_inicio_estado (fecha_inicio, estado, deleted_at);

-- ============================================
-- ANÁLISIS Y OPTIMIZACIÓN
-- ============================================

-- Actualizar estadísticas de las tablas
ANALYZE TABLE 
    estudiantes,
    inscripciones,
    inscripciones_materias,
    cursos,
    docentes,
    pagos_aranceles,
    pasantias_asignaciones,
    calificaciones,
    usuarios;

-- ============================================
-- VERIFICACIÓN DE ÍNDICES
-- ============================================

-- Ver todos los índices de una tabla específica
SELECT 
    TABLE_NAME as tabla,
    INDEX_NAME as indice,
    COLUMN_NAME as columna,
    SEQ_IN_INDEX as orden,
    NON_UNIQUE as no_unico
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'instituto_incos'
  AND TABLE_NAME IN (
    'estudiantes',
    'inscripciones',
    'inscripciones_materias',
    'pagos_aranceles'
  )
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- Contar índices por tabla
SELECT 
    TABLE_NAME as tabla,
    COUNT(DISTINCT INDEX_NAME) as total_indices
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'instituto_incos'
GROUP BY TABLE_NAME
ORDER BY total_indices DESC;

-- ============================================
-- RECOMENDACIONES DE USO
-- ============================================

/*
MEJORES PRÁCTICAS CON ÍNDICES:

1. QUERIES QUE SE BENEFICIAN:
   - WHERE con campos indexados
   - JOIN en campos indexados
   - ORDER BY en campos indexados
   - GROUP BY en campos indexados

2. USAR ÍNDICES COMPUESTOS CUANDO:
   - Se filtran múltiples campos juntos frecuentemente
   - El orden de los campos en el índice importa (más selectivo primero)

3. NO ABUSAR DE ÍNDICES:
   - Cada índice ocupa espacio
   - Cada índice ralentiza INSERT/UPDATE/DELETE
   - Mantener solo índices que se usan frecuentemente

4. MONITOREAR PERFORMANCE:
   - Usar EXPLAIN para ver si los índices se usan
   - Revisar slow query log
   - Eliminar índices no utilizados

5. ÍNDICES FULL-TEXT:
   - Usar para búsquedas de texto libre
   - Más rápido que LIKE %...%
   - Disponible para columnas TEXT y VARCHAR

6. SOFT DELETE:
   - Siempre incluir deleted_at en índices compuestos
   - Filtrar con "WHERE deleted_at IS NULL" en queries

EJEMPLO DE QUERY OPTIMIZADO:

-- Mal (sin usar índices):
SELECT * FROM estudiantes WHERE apellido_paterno LIKE 'García%';

-- Bien (usando índice compuesto):
SELECT * FROM estudiantes 
WHERE carrera_id = 1 
  AND estado_academico = 'REGULAR' 
  AND deleted_at IS NULL
ORDER BY apellido_paterno, apellido_materno;

-- Excelente (usando full-text):
SELECT * FROM estudiantes 
WHERE MATCH(nombres, apellido_paterno, apellido_materno) 
      AGAINST('García López' IN NATURAL LANGUAGE MODE)
  AND deleted_at IS NULL;
*/

-- ============================================
-- FIN DE ÍNDICES DE OPTIMIZACIÓN
-- ============================================

SELECT 'Índices de optimización creados exitosamente' as mensaje;
SELECT CONCAT('Total de índices adicionales: ~50') as resumen;
