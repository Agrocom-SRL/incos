-- ============================================
-- SEEDER: becas_descuentos
-- Sistema de Gestión Académica - Instituto INCOS
-- Datos iniciales: Catálogo de Becas y Descuentos
-- ============================================
-- NOTA: Estos descuentos se aplican sobre el aporte anual de matrícula (400 Bs)

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE becas_descuentos;

-- ============================================
-- INSERTAR BECAS Y DESCUENTOS
-- ============================================

-- BECA 25% - Escasos recursos económicos
INSERT INTO becas_descuentos (
    nombre, 
    codigo, 
    porcentaje, 
    descripcion, 
    requiere_documentacion, 
    requiere_aprobacion_rector
) VALUES (
    'Beca 25% - Escasos Recursos',
    'BECA_25_RECURSOS',
    25.00,
    'Descuento del 25% por escasos recursos económicos. Requiere documentación que acredite la situación económica del estudiante o su familia (certificado de ingresos, declaración jurada, etc.).',
    TRUE,
    FALSE
);

-- BECA 50% - Estudiante con discapacidad
INSERT INTO becas_descuentos (
    nombre, 
    codigo, 
    porcentaje, 
    descripcion, 
    requiere_documentacion, 
    requiere_aprobacion_rector
) VALUES (
    'Beca 50% - Estudiante con Discapacidad',
    'BECA_50_DISCAPACIDAD',
    50.00,
    'Descuento del 50% para estudiantes con discapacidad. Requiere carnet de discapacidad vigente emitido por el SENADIS (Servicio Nacional de Discapacidad) o certificado médico oficial.',
    TRUE,
    FALSE
);

-- BECA 50% - Pueblos indígenas y originarios
INSERT INTO becas_descuentos (
    nombre, 
    codigo, 
    porcentaje, 
    descripcion, 
    requiere_documentacion, 
    requiere_aprobacion_rector
) VALUES (
    'Beca 50% - Pueblos Indígenas',
    'BECA_50_INDIGENA',
    50.00,
    'Descuento del 50% para estudiantes pertenecientes a pueblos indígenas u originarios. Requiere certificado de pertenencia a comunidad indígena u originaria.',
    TRUE,
    FALSE
);

-- BECA 75% - Situación socioeconómica crítica
INSERT INTO becas_descuentos (
    nombre, 
    codigo, 
    porcentaje, 
    descripcion, 
    requiere_documentacion, 
    requiere_aprobacion_rector
) VALUES (
    'Beca 75% - Situación Crítica',
    'BECA_75_CRITICA',
    75.00,
    'Descuento del 75% para estudiantes en situación socioeconómica crítica. Requiere informe social, visita domiciliaria y aprobación del Rector.',
    TRUE,
    TRUE
);

-- BECA 100% - Excelencia académica (Promedio >= 90)
INSERT INTO becas_descuentos (
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
    'Beca 100% - Excelencia Académica',
    'BECA_100_EXCELENCIA',
    100.00,
    'Descuento del 100% por excelencia académica. Se otorga automáticamente a estudiantes con promedio anual igual o mayor a 90 puntos en la gestión anterior.',
    TRUE,
    FALSE,
    TRUE,
    'PROMEDIO_90',
    90.00
);

-- BECA 100% - Madre/Padre soltero(a) en situación de vulnerabilidad
INSERT INTO becas_descuentos (
    nombre, 
    codigo, 
    porcentaje, 
    descripcion, 
    requiere_documentacion, 
    requiere_aprobacion_rector
) VALUES (
    'Beca 100% - Madre/Padre Soltero(a)',
    'BECA_100_MADRE_SOLTERA',
    100.00,
    'Descuento del 100% para madres o padres solteros en situación de vulnerabilidad económica. Requiere certificado de nacimiento del hijo(a), declaración jurada de maternidad/paternidad única y documentación de situación económica. Requiere aprobación del Rector.',
    TRUE,
    TRUE
);

-- BECA 100% - Orfandad
INSERT INTO becas_descuentos (
    nombre, 
    codigo, 
    porcentaje, 
    descripcion, 
    requiere_documentacion, 
    requiere_aprobacion_rector
) VALUES (
    'Beca 100% - Orfandad',
    'BECA_100_ORFANDAD',
    100.00,
    'Descuento del 100% para estudiantes huérfanos de padre y madre. Requiere certificado de defunción de ambos progenitores y documentación del tutor legal. Requiere aprobación del Rector.',
    TRUE,
    TRUE
);

-- BECA 100% - Deportista destacado
INSERT INTO becas_descuentos (
    nombre, 
    codigo, 
    porcentaje, 
    descripcion, 
    requiere_documentacion, 
    requiere_aprobacion_rector
) VALUES (
    'Beca 100% - Deportista Destacado',
    'BECA_100_DEPORTISTA',
    100.00,
    'Descuento del 100% para deportistas que representan al instituto o al departamento en competencias nacionales o internacionales. Requiere certificación de la Federación Deportiva correspondiente y mantener rendimiento académico mínimo de 70 puntos. Requiere aprobación del Rector.',
    TRUE,
    TRUE
);

-- BECA 100% - Convenio institucional
INSERT INTO becas_descuentos (
    nombre, 
    codigo, 
    porcentaje, 
    descripcion, 
    requiere_documentacion, 
    requiere_aprobacion_rector
) VALUES (
    'Beca 100% - Convenio Institucional',
    'BECA_100_CONVENIO',
    100.00,
    'Descuento del 100% por convenio con instituciones públicas o privadas (Alcaldía, Gobernación, empresas, ONGs, etc.). Requiere carta de compromiso de la institución auspiciadora. Requiere aprobación del Rector.',
    TRUE,
    TRUE
);

-- BECA 100% - Víctima de violencia o conflicto social
INSERT INTO becas_descuentos (
    nombre, 
    codigo, 
    porcentaje, 
    descripcion, 
    requiere_documentacion, 
    requiere_aprobacion_rector
) VALUES (
    'Beca 100% - Víctima de Violencia',
    'BECA_100_VIOLENCIA',
    100.00,
    'Descuento del 100% para estudiantes víctimas de violencia intrafamiliar, violencia de género o desplazamiento por conflictos sociales. Requiere denuncia formal ante autoridades competentes (FELCV, DNA, SLIM) o informe de trabajo social. Requiere aprobación del Rector.',
    TRUE,
    TRUE
);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- Este seeder incluye todos los becas y descuentos del sistema.
-- ============================================