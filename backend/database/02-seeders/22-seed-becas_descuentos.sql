-- ============================================
-- SEEDER: becas_descuentos (VERSIÓN OFICIAL)
-- Sistema de Gestión Académica - Instituto INCOS
-- Datos iniciales: Catálogo de Becas y Descuentos
-- Basado en: Resolución Ministerial Nº 434/2019
-- D.D.E. SANTA CRUZ - Exclusión de Aportes Voluntarios Anuales
-- ============================================
-- NOTA IMPORTANTE: 
-- - Estos descuentos se aplican sobre el aporte VOLUNTARIO anual de 400 Bs
-- - Solo se benefician estudiantes que NO hayan reprobado ninguna asignatura
-- - Algunos descuentos requieren aprobación del Rector
-- - El aporte anual es para mantenimiento de infraestructura, mobiliario y equipamiento
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- SECCIÓN A: EXCLUSIÓN POR RAZÓN SOCIAL
-- Dirigido a sectores vulnerables y organizaciones sociales
-- ============================================

INSERT INTO becas_descuentos (
    id,
    nombre,
    codigo,
    porcentaje,
    descripcion,
    requiere_documentacion,
    requiere_aprobacion_rector,
    es_automatica,
    tipo_automatica,
    promedio_minimo
) VALUES (
    1,
    'Exclusión 100% - Razón Social',
    'EXCL_100_SOCIAL',
    100.00,
    'Beneficio destinado a sectores vulnerables de la sociedad cruceña y/u organizaciones sociales. El estudiante o la organización social debe presentar carta dirigida al Rector justificando la razón para la exclusión. Incluye datos del estudiante o estudiantes beneficiarios. Para mantenimiento en cursos superiores requiere aprovechamiento mínimo de 90 puntos como promedio anual. Condición: No haber reprobado ninguna asignatura.',
    TRUE,
    TRUE,
    FALSE,
    'MANUAL',
    90.00
);

-- ============================================
-- SECCIÓN B: EXCLUSIÓN POR PROMOCIÓN INSTITUCIONAL
-- Para promover el acceso a la formación superior
-- ============================================

INSERT INTO becas_descuentos (
    id,
    nombre,
    codigo,
    porcentaje,
    descripcion,
    requiere_documentacion,
    requiere_aprobacion_rector,
    es_automatica,
    tipo_automatica,
    promedio_minimo
) VALUES (
    2,
    'Exclusión 100% - Promoción Institucional',
    'EXCL_100_PROMOCION',
    100.00,
    'Beneficio para promocionar el acceso a la formación superior. Se materializa a través de inscripción gratuita o descuentos para estudiantes de primer año en todas las carreras, previa autorización del Rector. Conforme a campañas de difusión mediante medios de comunicación y redes sociales para completar cupos restantes. Para mantenimiento en cursos superiores requiere aprovechamiento mínimo de 90 puntos como promedio anual. Condición: No haber reprobado ninguna asignatura.',
    TRUE,
    TRUE,
    FALSE,
    'MANUAL',
    90.00
);

-- ============================================
-- SECCIÓN C: EXCLUSIÓN POR RENDIMIENTO ESTUDIANTIL
-- Para nuevos estudiantes con excelencia académica en secundaria
-- ============================================

INSERT INTO becas_descuentos (
    id,
    nombre,
    codigo,
    porcentaje,
    descripcion,
    requiere_documentacion,
    requiere_aprobacion_rector,
    es_automatica,
    tipo_automatica,
    promedio_minimo
) VALUES (
    3,
    'Exclusión 100% - Rendimiento Estudiantil (Nuevos)',
    'EXCL_100_REND_NUEVOS',
    100.00,
    'Beneficio para promover educación gratuita de acuerdo a leyes vigentes. Exclusión de aporte a nuevos estudiantes con promedio igual o superior a 90 puntos en el último curso del nivel secundario o Centro de Educación Alternativa. Para mantenimiento en cursos superiores requiere aprovechamiento mínimo de 90 puntos como promedio anual. Condición: No haber reprobado ninguna asignatura.',
    TRUE,
    FALSE,
    FALSE,
    'MANUAL',
    90.00
);

-- ============================================
-- SECCIÓN D: EXCLUSIÓN A ESTUDIANTES DEL INSTITUTO
-- Por rendimiento académico y participación en ferias
-- ============================================

-- D.1: Ganadores de Feria Interna - Primer Lugar
INSERT INTO becas_descuentos (
    id,
    nombre,
    codigo,
    porcentaje,
    descripcion,
    requiere_documentacion,
    requiere_aprobacion_rector,
    es_automatica,
    tipo_automatica,
    promedio_minimo
) VALUES (
    4,
    'Exclusión 100% - Feria Interna 1er Lugar',
    'EXCL_100_FERIA_1ER',
    100.00,
    'Exclusión de aporte anual a estudiantes del instituto que hayan logrado el 1er lugar en la Feria Interna del Instituto. Requiere certificado o reconocimiento oficial. Condición: No haber reprobado ninguna asignatura.',
    TRUE,
    FALSE,
    FALSE,
    'MANUAL',
    NULL
);

-- D.2: Excelencia Académica - Promedio >= 90 (Automática)
INSERT INTO becas_descuentos (
    id,
    nombre,
    codigo,
    porcentaje,
    descripcion,
    requiere_documentacion,
    requiere_aprobacion_rector,
    es_automatica,
    tipo_automatica,
    promedio_minimo
) VALUES (
    5,
    'Exclusión 100% - Excelencia Académica',
    'EXCL_100_PROMEDIO_90',
    100.00,
    'Exclusión de aporte anual a estudiantes con promedio igual o superior a 90 puntos en su Historial Académico. Se otorga automáticamente. Condición: No haber reprobado ninguna asignatura.',
    TRUE,
    FALSE,
    TRUE,
    'PROMEDIO_90',
    90.00
);

-- D.3: Buen Rendimiento - Promedio >= 80 y < 90
INSERT INTO becas_descuentos (
    id,
    nombre,
    codigo,
    porcentaje,
    descripcion,
    requiere_documentacion,
    requiere_aprobacion_rector,
    es_automatica,
    tipo_automatica,
    promedio_minimo
) VALUES (
    6,
    'Descuento 25% - Buen Rendimiento Académico',
    'DESC_25_PROMEDIO_80',
    25.00,
    'Descuento del 25% a estudiantes que tienen un promedio igual o superior a 80 puntos en su Historial Académico. Se otorga automáticamente. Condición: No haber reprobado ninguna asignatura.',
    TRUE,
    FALSE,
    TRUE,
    'PROMEDIO_80',
    80.00
);

-- ============================================
-- SECCIÓN E: DESCUENTOS POR INSCRIPCIÓN MÚLTIPLE
-- Estudiantes antiguos que inscriben nuevos estudiantes
-- ============================================

-- E.1: Un nuevo estudiante inscrito (25%)
INSERT INTO becas_descuentos (
    id,
    nombre,
    codigo,
    porcentaje,
    descripcion,
    requiere_documentacion,
    requiere_aprobacion_rector,
    es_automatica,
    tipo_automatica,
    promedio_minimo
) VALUES (
    7,
    'Descuento 25% - Inscripción de 1 Nuevo Estudiante',
    'DESC_25_INSCRIBE_1',
    25.00,
    'Descuento del 25% a estudiantes antiguos que inscriban a 1 nuevo estudiante. Beneficia al estudiante antiguo que refiere. Requiere verificación de inscripción del nuevo estudiante. Condición: No haber reprobado ninguna asignatura.',
    TRUE,
    FALSE,
    FALSE,
    'MANUAL',
    NULL
);

-- E.2: Dos nuevos estudiantes inscritos (50%)
INSERT INTO becas_descuentos (
    id,
    nombre,
    codigo,
    porcentaje,
    descripcion,
    requiere_documentacion,
    requiere_aprobacion_rector,
    es_automatica,
    tipo_automatica,
    promedio_minimo
) VALUES (
    8,
    'Descuento 50% - Inscripción de 2 Nuevos Estudiantes',
    'DESC_50_INSCRIBE_2',
    50.00,
    'Descuento del 50% a estudiantes antiguos que inscriban a 2 nuevos estudiantes. Beneficia al estudiante antiguo que refiere. Requiere verificación de inscripción de los nuevos estudiantes. Condición: No haber reprobado ninguna asignatura.',
    TRUE,
    FALSE,
    FALSE,
    'MANUAL',
    NULL
);

-- E.3: Tres nuevos estudiantes inscritos (75%)
INSERT INTO becas_descuentos (
    id,
    nombre,
    codigo,
    porcentaje,
    descripcion,
    requiere_documentacion,
    requiere_aprobacion_rector,
    es_automatica,
    tipo_automatica,
    promedio_minimo
) VALUES (
    9,
    'Descuento 75% - Inscripción de 3 Nuevos Estudiantes',
    'DESC_75_INSCRIBE_3',
    75.00,
    'Descuento del 75% a estudiantes antiguos que inscriban a 3 nuevos estudiantes. Beneficia al estudiante antiguo que refiere. Requiere verificación de inscripción de los nuevos estudiantes. Condición: No haber reprobado ninguna asignatura.',
    TRUE,
    FALSE,
    FALSE,
    'MANUAL',
    NULL
);

-- E.4: Cuatro o más nuevos estudiantes inscritos (100%)
INSERT INTO becas_descuentos (
    id,
    nombre,
    codigo,
    porcentaje,
    descripcion,
    requiere_documentacion,
    requiere_aprobacion_rector,
    es_automatica,
    tipo_automatica,
    promedio_minimo
) VALUES (
    10,
    'Descuento 100% - Inscripción de 4+ Nuevos Estudiantes',
    'DESC_100_INSCRIBE_4',
    100.00,
    'Descuento del 100% (exclusión total) a estudiantes antiguos que inscriban a 4 o más nuevos estudiantes. Beneficia al estudiante antiguo que refiere. Requiere verificación de inscripción de los nuevos estudiantes. Condición: No haber reprobado ninguna asignatura.',
    TRUE,
    FALSE,
    FALSE,
    'MANUAL',
    NULL
);

-- ============================================
-- SECCIÓN F: DESCUENTOS POR HERMANOS
-- Cuando existen 2 o más hermanos inscritos en el instituto
-- ============================================

-- F.1: Dos hermanos inscritos (50%)
INSERT INTO becas_descuentos (
    id,
    nombre,
    codigo,
    porcentaje,
    descripcion,
    requiere_documentacion,
    requiere_aprobacion_rector,
    es_automatica,
    tipo_automatica,
    promedio_minimo
) VALUES (
    11,
    'Descuento 50% - Dos Hermanos Inscritos',
    'DESC_50_HERMANOS_2',
    50.00,
    'En caso de existir dos hermanos inscritos en el instituto, se otorgará descuento del 50% a uno de ellos. Requiere documentación que acredite parentesco (certificado de nacimiento). Condición: No haber reprobado ninguna asignatura.',
    TRUE,
    TRUE,
    FALSE,
    'MANUAL',
    NULL
);

-- F.2: Tres hermanos inscritos (100% a uno)
INSERT INTO becas_descuentos (
    id,
    nombre,
    codigo,
    porcentaje,
    descripcion,
    requiere_documentacion,
    requiere_aprobacion_rector,
    es_automatica,
    tipo_automatica,
    promedio_minimo
) VALUES (
    12,
    'Descuento 100% - Tres Hermanos Inscritos',
    'DESC_100_HERMANOS_3',
    100.00,
    'En caso de existir tres hermanos inscritos en el instituto, uno será beneficiado con el 100% del descuento del aporte voluntario anual. Requiere documentación que acredite parentesco (certificado de nacimiento). Condición: No haber reprobado ninguna asignatura.',
    TRUE,
    TRUE,
    FALSE,
    'MANUAL',
    NULL
);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================

/*
REGLAS DE NEGOCIO IMPORTANTES:

1. CONDICIÓN GENERAL:
   - Solo se benefician estudiantes que NO hayan reprobado ninguna asignatura
   - Requiere solicitud autorizada por la máxima autoridad del instituto

2. BECAS AUTOMÁTICAS:
   - 100%: Promedio >= 90 puntos (PROMEDIO_90)
   - 25%: Promedio >= 80 y < 90 puntos (PROMEDIO_80)
   - Se verifican en el Historial Académico de la gestión anterior

3. BECAS POR INSCRIPCIÓN MÚLTIPLE:
   - Benefician al estudiante ANTIGUO que inscribe nuevos estudiantes
   - 25%: 1 nuevo inscrito
   - 50%: 2 nuevos inscritos
   - 75%: 3 nuevos inscritos
   - 100%: 4 o más nuevos inscritos

4. BECAS POR HERMANOS:
   - Requieren documentación (certificado de nacimiento)
   - 50%: 2 hermanos (se beneficia 1)
   - 100%: 3 hermanos (se beneficia 1)
   - Requieren aprobación del Rector

5. EXCLUSIONES ESPECIALES:
   - Razón Social: Sectores vulnerables (requiere carta al Rector)
   - Promoción Institucional: Campañas de difusión
   - Rendimiento Nuevos: Promedio >= 90 en secundaria
   - Feria Interna: 1er lugar en feria del instituto

6. MANTENIMIENTO DEL BENEFICIO:
   - Para cursos superiores: mantener aprovechamiento mínimo de 90 puntos
   - Aplicable a: Razón Social, Promoción, Rendimiento Nuevos

7. APORTE VOLUNTARIO:
   - Monto: 400 Bs anuales
   - Destino: Infraestructura, mobiliario y equipamiento
   - Es VOLUNTARIO según resolución ministerial

8. DOCUMENTACIÓN:
   - Todas las becas requieren documentación de respaldo
   - Gestionar en tabla: documentos_estudiante
   - tipo_referencia = 'estudiantes_becas'
*/

-- ============================================
-- FIN DEL SEEDER OFICIAL
-- Basado en Resolución Ministerial Nº 434/2019
-- Instituto Técnico INCOS Santa Cruz
-- Total de becas/descuentos: 12
-- ============================================