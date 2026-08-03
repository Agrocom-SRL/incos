-- ============================================
-- MIGRACIÓN DDL: ALTER sobre tablas CON DATOS en el servidor
-- Sistema de Gestión Académica - Instituto INCOS
-- Fecha de redacción: 2026-07-29
--
-- Fuente de verdad (schemas ya corregidos en el repo):
--   01-schemas/04-sistema-seguridad.sql   (permisos: dominios CAP y TIT en comentarios;
--                                          TUT renombrado a TIT el 2026-07-31)
--   01-schemas/16-nivelaciones.sql        (historial_matricula: ancla alternativa,
--                                          REINCORPORACION, ARTICULO_18 reclasificado)
--   01-schemas/18-transitabilidades.sql   (transitabilidades: codigo_rude)
--   01-schemas/19-traspasos.sql           (traspasos: solo comentario de codigo_rude)
--   02-seeders/54-seed-configuracion-evaluacion.sql (fila ACOMPANAMIENTO_PEDAGOGICO)
--
-- Estas tablas NO pueden recrearse con DROP/CREATE porque ya tienen filas
-- (ver 05-migrations/23-migrate-traspasos.sql y 24-migrate-transitabilidades.sql).
-- Este script aplica solo el DELTA vía ALTER TABLE, preservando los datos.
--
-- ORDEN DE APLICACIÓN EN EL SERVIDOR:
--   0. Backup previo:
--      mysqldump instituto_incos permisos historial_matricula nivelaciones \
--        transitabilidades traspasos configuracion_evaluacion > backup-pre-26.sql
--   1. ESTE script (ALTERs sobre tablas con datos).
--   2. Schemas NUEVOS, sin datos en servidor, ejecución libre y EN ESTE ORDEN
--      (dependencias FK): 21-cursos-capacitacion → 22-modalidades-grado →
--      23-tutorias-acompanamiento → 24-pasantias → 25-libros-registro →
--      26-titulos-certificados → 27-supervision-docente.
--   3. Seeders nuevos: 66-seed-permisos-tut (RBAC TUT) →
--      67-seed-titulacion-modalidades-grado.
--      NO re-ejecutar el 54 completo: su delta (fila 3) ya lo cubre este script.
--   4. Vistas nuevas 03-views/156 a 163 (dependen del paso 2 y de la fila
--      ACOMPANAMIENTO_PEDAGOGICO del paso 1).
--
-- NOTAS TÉCNICAS:
--   - El ALTER de historial_matricula inserta 'REINCORPORACION' en medio del
--     ENUM: MySQL reconstruye la tabla (ALGORITHM=COPY) remapeando por VALOR,
--     no por índice, así que los datos quedan intactos; hay bloqueo breve de
--     escritura mientras se reconstruye (tabla pequeña, impacto mínimo).
--   - Los MODIFY de columnas que solo cambian COMMENT son de metadatos:
--     alinean la documentación del servidor con los schemas del repo.
--   - Script IDEMPOTENTE: puede re-ejecutarse completo sin error. Los ALTER
--     con ADD (secciones 2 y 3) van guardados con information_schema + SQL
--     dinámico y emiten un aviso si ya estaban aplicados; los MODIFY (1 y 4)
--     y el INSERT (5) son idempotentes por naturaleza.
-- ============================================

USE instituto_incos;

-- ============================================
-- 1) permisos — documentar los nuevos dominios CAPACITACION (CAP) y
--    TITULACION (TIT) en los comentarios de dominio/modulo (solo metadatos).
--    Nota (2026-07-31): el dominio/módulo se llamaba TUTORIAS/TUT — el rename
--    a TITULACION/TIT es solo texto de documentación (COMMENT), no afecta
--    datos existentes.
-- ============================================

ALTER TABLE permisos
    MODIFY COLUMN dominio VARCHAR(50) NOT NULL COMMENT 'Dominio de negocio estable. Valores: MATRICULA, ACADEMICO, DOCENTES, FINANZAS, INSTITUCIONAL, CAPACITACION, TITULACION, CONFIGURACION, REPORTES, SEGURIDAD.',
    MODIFY COLUMN modulo VARCHAR(50) NOT NULL COMMENT 'Subdominio técnico. Coincide con menu.module del frontend: MAT, ACA, DOC, FIN, INST, CAP, TIT, CFG, REP, SEG.';

-- ============================================
-- 2) historial_matricula — ancla alternativa para eventos SIN matrícula
--    (inscripcion_id + asignatura_plan_id), nuevo tipo REINCORPORACION y
--    reclasificación de ARTICULO_18 como intento académico (examen)
--    IDEMPOTENTE: el ALTER es atómico (todo o nada) y solo corre si la
--    columna inscripcion_id no existe todavía. El texto va en comillas
--    dobles (literal de cadena en sql_mode por defecto) para no escapar
--    las comillas simples de los COMMENT.
-- ============================================

SET @hm_aplicado := (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = 'instituto_incos'
      AND table_name = 'historial_matricula'
      AND column_name = 'inscripcion_id'
);

SET @hm_ddl := IF(@hm_aplicado = 0,
"ALTER TABLE instituto_incos.historial_matricula
    ADD COLUMN inscripcion_id INT NULL COMMENT 'Inscripción del estudiante en la gestión (referencia a inscripciones). Se usa junto a asignatura_plan_id cuando el evento describe una materia que el estudiante NO cursa (VENCIDA, CHOQUE_HORARIO, PRE_REQUISITO, NO_LLEVA_POR_VOLUNTAD, HOMOLOGACION, REINCORPORACION) y no existe matricula_materia_id.' AFTER matricula_materia_id,
    ADD COLUMN asignatura_plan_id INT NULL COMMENT 'Materia del plan a la que se refiere el evento sin matrícula (referencia a asignaturas_plan). Junto a inscripcion_id identifica estudiante-gestión-materia cuando matricula_materia_id es NULL.' AFTER inscripcion_id,
    MODIFY COLUMN matricula_materia_id INT NULL COMMENT 'Matrícula a la que pertenece este evento (referencia a matriculas_materia). Estudiante y gestión derivables vía matricula → inscripcion. NULL cuando el evento describe una materia NO cursada: en ese caso el ancla es inscripcion_id + asignatura_plan_id.',
    MODIFY COLUMN tipo_estado ENUM(
        'NIVELACION_1RA',
        'NIVELACION_2DA',
        'PRUEBA_EXCEPCIONAL',
        'RECUPERATORIO_ANUAL',
        'VENCIDA',
        'CHOQUE_HORARIO',
        'PRE_REQUISITO',
        'NO_LLEVA_POR_VOLUNTAD',
        'HOMOLOGACION',
        'REINCORPORACION',
        'LLEVA_EN_GESTION',
        'ARTICULO_18',
        'ABANDONO',
        'RETIRADO',
        'OTRO'
    ) NOT NULL COMMENT 'Naturaleza del proceso según reglamento INCOS. Para intentos académicos distingue RECUPERATORIO_ANUAL (preventivo, misma gestión) de NIVELACION_1RA/2DA/PRUEBA_EXCEPCIONAL/ARTICULO_18 (recuperación posterior; ARTICULO_18 es examen, libros reales «NIVELA ART. 18»). REINCORPORACION: retorno del estudiante, aparece junto a HOMOLOGACION en los libros reales. La nota del examen vive en nivelaciones.',
    MODIFY COLUMN nota_resultante DECIMAL(5,2) NULL COMMENT 'Nota fijada por decisión administrativa (0-100). Solo ABANDONO o RETIRADO.',
    ADD FOREIGN KEY (inscripcion_id) REFERENCES instituto_incos.inscripciones(id) ON DELETE SET NULL,
    ADD FOREIGN KEY (asignatura_plan_id) REFERENCES instituto_incos.asignaturas_plan(id) ON DELETE SET NULL,
    ADD INDEX idx_inscripcion_id (inscripcion_id) COMMENT 'Eventos sin matrícula de una inscripción',
    ADD INDEX idx_asignatura_plan_id (asignatura_plan_id) COMMENT 'Eventos sin matrícula de una materia del plan',
    ADD INDEX idx_inscripcion_asignatura (inscripcion_id, asignatura_plan_id, vigente, activo, deleted_at) COMMENT 'Evento vigente de una materia no cursada del estudiante',
    COMMENT='Bitácora operativa de matrículas. Intentos académicos (incluye ARTICULO_18): tipo_estado aquí, hecho del examen en nivelaciones vía historial_matricula_id. Administrativos (ABANDONO/RETIRADO): nota_resultante + nota_forzada. Eventos de materia NO cursada: ancla inscripcion_id + asignatura_plan_id con matricula_materia_id NULL.'",
"SELECT '2) historial_matricula: ya estaba aplicado, sin cambios' AS aviso");

PREPARE hm_stmt FROM @hm_ddl;
EXECUTE hm_stmt;
DEALLOCATE PREPARE hm_stmt;

-- DIAGNÓSTICO (solo lectura): filas ARTICULO_18 registradas bajo el modelo
-- anterior (decisión administrativa con nota forzada). Bajo el modelo nuevo,
-- ARTICULO_18 es un EXAMEN: la nota debe vivir en nivelaciones (vía
-- historial_matricula_id) y nota_resultante/nota_forzada quedar NULL/FALSE.
-- Si esta consulta devuelve filas, revisarlas caso por caso ANTES de crear
-- las filas espejo en nivelaciones (requiere gestión y fecha del examen,
-- datos que no se pueden inferir automáticamente).
SELECT id, matricula_materia_id, nota_resultante, nota_forzada, fecha_transicion
FROM instituto_incos.historial_matricula
WHERE tipo_estado = 'ARTICULO_18'
  AND (nota_forzada = TRUE OR nota_resultante IS NOT NULL)
  AND deleted_at IS NULL;

-- ============================================
-- 3) transitabilidades — codigo_rude (sección 1 del ANEXO 2; espejo de
--    traspasos.codigo_rude, sin columna en estudiantes)
--    IDEMPOTENTE: solo corre si la columna codigo_rude no existe todavía.
-- ============================================

SET @tr_aplicado := (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = 'instituto_incos'
      AND table_name = 'transitabilidades'
      AND column_name = 'codigo_rude'
);

SET @tr_ddl := IF(@tr_aplicado = 0,
"ALTER TABLE instituto_incos.transitabilidades
    MODIFY COLUMN estudiante_id INT NULL COMMENT 'Estudiante postulante (referencia a estudiantes). Sus datos personales, CI, domicilio, teléfono y correo están en la tabla estudiantes; el código RUDE/RUDEAL se guarda aquí (codigo_rude).',
    ADD COLUMN codigo_rude VARCHAR(50) NULL COMMENT 'Código RUDE o RUDEAL del postulante (registro único en el sistema educativo boliviano). El ANEXO 2 de transitabilidad lo solicita igual que el formulario de traspaso.' AFTER estudiante_id,
    COMMENT='Solicitudes de transitabilidad: postulantes con Técnico Medio (UETHP/CEA) que solicitan ingresar a un ITT. Cubre los 5 puntos del Formulario Anexo 2 de Transitabilidad. Los datos personales del postulante están en la tabla estudiantes; el código RUDE/RUDEAL se guarda aquí (codigo_rude).'",
"SELECT '3) transitabilidades: ya estaba aplicado, sin cambios' AS aviso");

PREPARE tr_stmt FROM @tr_ddl;
EXECUTE tr_stmt;
DEALLOCATE PREPARE tr_stmt;

-- ============================================
-- 4) traspasos — codigo_rude deja de ser "exclusivo de traspaso"
--    (solo cambia el comentario; la columna ya existe con datos)
-- ============================================

ALTER TABLE traspasos
    MODIFY COLUMN codigo_rude VARCHAR(50) NULL COMMENT 'Código RUDE o RUDEAL del postulante (registro único en el sistema educativo boliviano).';

-- ============================================
-- 5) configuracion_evaluacion — fila ACOMPANAMIENTO_PEDAGOGICO
--    (delta del seeder 54; umbral de riesgo del módulo TUT, vista 156)
--    Idempotente: ancla la gestión a la de la POLITICA_INSTITUCIONAL vigente
--    (en el seeder local es gestion_id=1, gestión 2026) y no duplica la clave.
-- ============================================

INSERT INTO configuracion_evaluacion (gestion_id, clave, valor, tipo, vigente, descripcion, activo)
SELECT ce.gestion_id,
       'ACOMPANAMIENTO_PEDAGOGICO',
       '{"umbralRiesgo":61,"criterio":"ULTIMO_BIMESTRE_O_ACUMULADO"}',
       'JSON', TRUE,
       'Umbral de riesgo pedagógico del módulo Tutorías (vista 156)',
       TRUE
FROM configuracion_evaluacion ce
WHERE ce.clave = 'POLITICA_INSTITUCIONAL'
  AND ce.vigente = TRUE AND ce.activo = TRUE AND ce.deleted_at IS NULL
  AND NOT EXISTS (
      SELECT 1 FROM configuracion_evaluacion x
      WHERE x.clave = 'ACOMPANAMIENTO_PEDAGOGICO'
        AND x.gestion_id = ce.gestion_id
        AND x.deleted_at IS NULL
  )
LIMIT 1;

-- ============================================
-- VERIFICACIÓN (solo lectura, ejecutar tras aplicar)
-- ============================================

-- a) Columnas nuevas presentes (espera 3 filas: inscripcion_id,
--    asignatura_plan_id, codigo_rude)
SELECT table_name, column_name
FROM information_schema.columns
WHERE table_schema = 'instituto_incos'
  AND ((table_name = 'historial_matricula' AND column_name IN ('inscripcion_id', 'asignatura_plan_id'))
    OR (table_name = 'transitabilidades' AND column_name = 'codigo_rude'));

-- b) ENUM con REINCORPORACION (espera 1 fila con el valor incluido)
SELECT column_type
FROM information_schema.columns
WHERE table_schema = 'instituto_incos'
  AND table_name = 'historial_matricula'
  AND column_name = 'tipo_estado'
  AND column_type LIKE '%REINCORPORACION%';

-- c) Fila de configuración del módulo TUT (espera 1 fila vigente)
--    Tablas calificadas con el schema: phpMyAdmin re-ejecuta la última SELECT
--    del script en el contexto de la BD seleccionada en el panel (tras las
--    consultas a information_schema puede ser information_schema → error 1109).
SELECT id, gestion_id, clave, valor, vigente
FROM instituto_incos.configuracion_evaluacion
WHERE clave = 'ACOMPANAMIENTO_PEDAGOGICO' AND deleted_at IS NULL;

-- d) Conteo de datos preservados (comparar con los conteos previos al ALTER)
SELECT 'historial_matricula' AS tabla, COUNT(*) AS filas FROM instituto_incos.historial_matricula
UNION ALL SELECT 'transitabilidades', COUNT(*) FROM instituto_incos.transitabilidades
UNION ALL SELECT 'traspasos', COUNT(*) FROM instituto_incos.traspasos
UNION ALL SELECT 'permisos', COUNT(*) FROM instituto_incos.permisos;
