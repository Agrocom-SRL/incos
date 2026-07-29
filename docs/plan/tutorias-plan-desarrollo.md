# Módulo Tutorías y Acompañamiento Académico (TUT) — plan de desarrollo

> Documento maestro consolidado por el orquestador (2026-07-24) a partir de los
> informes de `datos`, `arquitecto` y `planificador`. Es el CONTRATO entre los
> agentes backend y frontend: rutas y `dataFieldName` son literales.
> **Nada de este plan se ejecuta en la BD sin aprobación explícita del usuario.**

## Decisiones cerradas

- **Dominio propio `TUT`** (menú "Tutorías", `path: '/tutorias'`, order 9; CFG pasa a 10, SEG a 11 en `frontend/src/presentation/modules/dominios/routes.jsx`).
- **Raíz de titulación = tablas existentes** `modalidades_grado` + `proyectos_grado` (`01-schemas/22-modalidades-grado.sql`). NO se duplican; el módulo añade 6 tablas satélite (schema 23).
- **Riesgo pedagógico = vista calculada** (156, sobre la vista 135 centralizador), NO tabla. Umbral parametrizable en `configuracion_evaluacion` clave `ACOMPANAMIENTO_PEDAGOGICO` (fallback 61).
- **`proyectos_grado.estudiante_id` queda legacy**: titular en proyectos individuales, NULL en grupales; los consumidores nuevos leen `tutoria_integrantes`.
- **PDFs en backend** con `IncosPDFLibBase` + `infrastructure/external/templates/Plantilla.pdf` (patrón `ActaCompromisoPdfGenerator`); pdfkit/pdf-lib ya instalados. PDF generado se registra en `tutoria_dictamenes`.
- **Uploads** con multer existente (pdf/doc/docx ya permitidos): nuevo export `uploadAvanceProyecto` en `presentation/middleware/upload.middleware.js`, destino `uploads/documentos/proyectos-grado/:proyectoId/`. Descarga SOLO por endpoint autenticado (`res.download`); NUNCA URL estática `/uploads`.
- **Dashboard sin librería de gráficos nueva**: stat-cards + `Progress` AntD + tabla de casos críticos.
- **T17 (confirmar bitácora por estudiante)**: acción `LISTAR` + guard de pertenencia en servidor (integrante ACTIVO vía `resolveEstudianteIdForUsuario`). Decisión del orquestador.
- **Grupalidad de modalidad**: la tabla `modalidades_grado` no tiene flag grupal; criterio = `codigo='PSP'` en `domain/constants/tutorias.constants.js`.
- Helpers reales: `backend/src/application/utils/resolveDocenteIdForUsuario.js` (+ `tryResolveDocenteIdForUsuario`) y `resolveEstudianteIdForUsuario.js`. Las rutas `mis-*` JAMÁS aceptan `estudianteId`/`docenteId` del cliente.
- No existe rol "jefe de carrera". Roles: DIR_ACADEMICO, RECTOR, SEC_ACADEMICA, DOCENTE, ESTUDIANTE (ADMIN_SISTEMA hereda por vista, no se siembra).

## Fase A — SQL (solo escribir archivos; ejecución requiere aprobación)

### A1. `backend/database/01-schemas/23-tutorias-acompanamiento.sql`

DDL propuesto por `datos` (estilo del 25; el agente backend lo copia y puede pulir comentarios, no la estructura):

```sql
-- ============================================
-- MÓDULO DE TUTORÍAS Y ACOMPAÑAMIENTO ACADÉMICO
-- Sistema de Gestión Académica - Instituto INCOS
-- 6 Tablas: tutoria_integrantes, tutoria_avances, tutoria_bitacora,
--           tutoria_dictamenes, sesiones_reforzamiento,
--           sesion_reforzamiento_participantes
-- Raíz del sub-módulo de titulación: proyectos_grado (22-modalidades-grado.sql).
-- No se duplica el proyecto: estas tablas son satélites con prefijo tutoria_.
-- Sub-módulo de acompañamiento: ancla en asignaciones_docentes (curso) y
-- matriculas_materia (estudiante en la materia). El riesgo pedagógico NO es
-- tabla: es vista calculada (156) con umbral en configuracion_evaluacion
-- (clave ACOMPANAMIENTO_PEDAGOGICO, seeder 54).
-- NORMALIZACIÓN: Estructura normalizada según 3FN
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS sesion_reforzamiento_participantes;
DROP TABLE IF EXISTS sesiones_reforzamiento;
DROP TABLE IF EXISTS tutoria_dictamenes;
DROP TABLE IF EXISTS tutoria_bitacora;
DROP TABLE IF EXISTS tutoria_avances;
DROP TABLE IF EXISTS tutoria_integrantes;

CREATE TABLE tutoria_integrantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_grado_id INT NULL COMMENT 'Proyecto de grado (referencia a proyectos_grado)',
    estudiante_id INT NULL COMMENT 'Estudiante integrante (referencia a estudiantes)',
    rol ENUM('TITULAR', 'INTEGRANTE') DEFAULT 'INTEGRANTE'
        COMMENT 'TITULAR: responsable/contacto del proyecto | INTEGRANTE: miembro del grupo',
    estado ENUM('ACTIVO', 'RETIRADO') DEFAULT 'ACTIVO'
        COMMENT 'ACTIVO en el proyecto o RETIRADO (abandonó el grupo)',
    fecha_incorporacion DATE NULL COMMENT 'Fecha en que se incorporó al proyecto',
    observaciones TEXT NULL COMMENT 'Observaciones del integrante',

    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    FOREIGN KEY (proyecto_grado_id) REFERENCES proyectos_grado(id) ON DELETE SET NULL,
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE SET NULL,

    INDEX idx_proyecto_grado_id (proyecto_grado_id) COMMENT 'Integrantes de un proyecto',
    INDEX idx_estudiante_id (estudiante_id) COMMENT 'Proyecto(s) de un estudiante',
    INDEX idx_estudiante_estado (estudiante_id, estado, activo, deleted_at) COMMENT 'Proyecto vigente del estudiante',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Integrantes (1..N estudiantes) de un proyecto de grado. Habilita proyectos comunitarios grupales sobre proyectos_grado.';

CREATE TABLE tutoria_avances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_grado_id INT NULL COMMENT 'Proyecto de grado al que pertenece el avance',
    subido_por_estudiante_id INT NULL COMMENT 'Estudiante que subió el archivo (debe ser integrante del proyecto — validación de aplicación)',
    numero_avance INT NULL COMMENT 'Número correlativo del avance dentro del proyecto (1, 2, 3...)',
    titulo VARCHAR(255) NULL COMMENT 'Título o etiqueta del avance (ej: Capítulo 2 - Marco teórico)',
    descripcion TEXT NULL COMMENT 'Descripción del contenido entregado',

    nombre_archivo VARCHAR(255) NOT NULL COMMENT 'Nombre del archivo digital',
    ruta_archivo VARCHAR(500) NOT NULL COMMENT 'Ruta del archivo en el servidor',
    extension VARCHAR(10) NULL COMMENT 'Extensión del archivo (pdf, doc, docx). Solo PDF/Word — validación de aplicación',
    tipo_mime VARCHAR(100) NULL COMMENT 'Tipo MIME del archivo',
    tamano_bytes BIGINT UNSIGNED NULL COMMENT 'Tamaño del archivo en bytes',

    estado_revision ENUM('PENDIENTE_REVISION', 'OBSERVADO', 'SUBSANADO', 'APROBADO') DEFAULT 'PENDIENTE_REVISION'
        COMMENT 'PENDIENTE_REVISION: subido, sin revisar | OBSERVADO: el tutor dejó observaciones | SUBSANADO: observaciones atendidas | APROBADO: avance aceptado',
    fecha_revision DATE NULL COMMENT 'Fecha de la última revisión del tutor',

    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación (fecha de subida)',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    FOREIGN KEY (proyecto_grado_id) REFERENCES proyectos_grado(id) ON DELETE SET NULL,
    FOREIGN KEY (subido_por_estudiante_id) REFERENCES estudiantes(id) ON DELETE SET NULL,

    INDEX idx_proyecto_grado_id (proyecto_grado_id) COMMENT 'Avances de un proyecto',
    INDEX idx_subido_por (subido_por_estudiante_id) COMMENT 'Avances subidos por un estudiante',
    INDEX idx_estado_revision (estado_revision) COMMENT 'Filtrado por estado de revisión',
    INDEX idx_proyecto_estado (proyecto_grado_id, estado_revision, activo, deleted_at) COMMENT 'Avances pendientes de un proyecto',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Archivos de avance del proyecto de grado subidos por estudiantes. Historial de observaciones en tutoria_bitacora.';

CREATE TABLE tutoria_bitacora (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_grado_id INT NULL COMMENT 'Proyecto de grado (referencia a proyectos_grado)',
    tutoria_avance_id INT NULL COMMENT 'Avance revisado en esta entrada (referencia a tutoria_avances). NULL si es reunión sin archivo',
    tipo ENUM('REUNION', 'REVISION_AVANCE') DEFAULT 'REUNION'
        COMMENT 'REUNION: sesión de tutoría | REVISION_AVANCE: observación sobre un archivo de avance',
    fecha DATE NULL COMMENT 'Fecha de la reunión/revisión (columna FECHA de la planilla)',
    actividad TEXT NULL COMMENT 'Avance revisado en relación al Cronograma de Tutoría (columna ACTIVIDAD de la planilla)',
    observaciones TEXT NULL COMMENT 'Observaciones del tutor (columna OBSERVACIONES de la planilla)',
    porcentaje_avance TINYINT UNSIGNED NULL COMMENT 'Porcentaje de avance del proyecto a la fecha (0-100, planilla de seguimiento DDE)',
    estado ENUM('PENDIENTE', 'SUBSANADO') DEFAULT 'PENDIENTE'
        COMMENT 'PENDIENTE: la observación sigue abierta | SUBSANADO: el estudiante atendió la observación',
    confirmado_estudiante BOOLEAN DEFAULT FALSE COMMENT 'Equivalente digital de FIRMA DEL ESTUDIANTE en la planilla',
    fecha_confirmacion DATE NULL COMMENT 'Fecha en que el estudiante confirmó la entrada',

    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    FOREIGN KEY (proyecto_grado_id) REFERENCES proyectos_grado(id) ON DELETE SET NULL,
    FOREIGN KEY (tutoria_avance_id) REFERENCES tutoria_avances(id) ON DELETE SET NULL,

    INDEX idx_proyecto_grado_id (proyecto_grado_id) COMMENT 'Bitácora de un proyecto',
    INDEX idx_tutoria_avance_id (tutoria_avance_id) COMMENT 'Historial de observaciones de un avance',
    INDEX idx_fecha (fecha) COMMENT 'Búsqueda por fecha (reporte mensual)',
    INDEX idx_proyecto_fecha (proyecto_grado_id, fecha, activo, deleted_at) COMMENT 'Bitácora cronológica del proyecto',
    INDEX idx_estado (estado) COMMENT 'Observaciones pendientes/subsanadas',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bitácora de reuniones y revisiones de tutoría de titulación. Fuente de la planilla de seguimiento y del reporte mensual a la Dirección Académica.';

CREATE TABLE tutoria_dictamenes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_grado_id INT NULL COMMENT 'Proyecto de grado (referencia a proyectos_grado)',
    tipo ENUM('VIABILIDAD_TECNICA', 'DESIGNACION_OFICIAL') NOT NULL
        COMMENT 'VIABILIDAD_TECNICA: informe de aprobación final del tutor | DESIGNACION_OFICIAL: informe de designación de tutor para la DDE',
    numero_informe VARCHAR(50) NULL COMMENT 'Número/cite del informe (ej: INF-DA-015/2026)',
    resultado ENUM('APROBADO', 'OBSERVADO', 'RECHAZADO') NULL
        COMMENT 'Resultado del dictamen (aplica a VIABILIDAD_TECNICA; NULL en DESIGNACION_OFICIAL)',
    fecha_emision DATE NULL COMMENT 'Fecha de emisión del informe',
    destinatario VARCHAR(150) NULL COMMENT 'Instancia destinataria (ej: DDE, Dirección Académica)',
    contenido TEXT NULL COMMENT 'Cuerpo/resumen del informe',

    nombre_archivo VARCHAR(255) NULL COMMENT 'Nombre del archivo PDF generado',
    ruta_archivo VARCHAR(500) NULL COMMENT 'Ruta del PDF en el servidor',
    extension VARCHAR(10) NULL COMMENT 'Extensión (pdf)',
    tipo_mime VARCHAR(100) NULL COMMENT 'Tipo MIME',

    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    FOREIGN KEY (proyecto_grado_id) REFERENCES proyectos_grado(id) ON DELETE SET NULL,

    INDEX idx_proyecto_grado_id (proyecto_grado_id) COMMENT 'Dictámenes de un proyecto',
    INDEX idx_tipo (tipo) COMMENT 'Filtrado por tipo de informe',
    INDEX idx_proyecto_tipo (proyecto_grado_id, tipo, activo, deleted_at) COMMENT 'Dictamen vigente por proyecto y tipo',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Informes formales de tutoría: Viabilidad Técnica (aprobación final) y Designación Oficial de tutor (PDF para la DDE).';

CREATE TABLE sesiones_reforzamiento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asignacion_docente_id INT NULL COMMENT 'Curso que refuerza (referencia a asignaciones_docentes). De aquí derivan docente, materia, paralelo y gestión',
    fecha DATE NULL COMMENT 'Fecha de la sesión',
    hora_inicio TIME NULL COMMENT 'Hora de inicio',
    hora_fin TIME NULL COMMENT 'Hora de fin',
    modalidad ENUM('PRESENCIAL', 'VIRTUAL') DEFAULT 'PRESENCIAL'
        COMMENT 'PRESENCIAL: en aula física (aula_id) | VIRTUAL: por enlace (enlace_virtual)',
    aula_id INT NULL COMMENT 'Aula física (referencia a aulas). NULL si es virtual',
    enlace_virtual VARCHAR(500) NULL COMMENT 'Enlace de la sesión virtual (Meet, Zoom, etc.). NULL si es presencial',
    tema VARCHAR(255) NULL COMMENT 'Tema o contenido a reforzar',
    estado ENUM('PROGRAMADA', 'REALIZADA', 'CANCELADA') DEFAULT 'PROGRAMADA'
        COMMENT 'PROGRAMADA: agendada | REALIZADA: ejecutada | CANCELADA: no se realizó',
    observaciones TEXT NULL COMMENT 'Observaciones generales de la sesión',

    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    FOREIGN KEY (asignacion_docente_id) REFERENCES asignaciones_docentes(id) ON DELETE SET NULL,
    FOREIGN KEY (aula_id) REFERENCES aulas(id) ON DELETE SET NULL,

    INDEX idx_asignacion_docente_id (asignacion_docente_id) COMMENT 'Sesiones de un curso',
    INDEX idx_fecha (fecha) COMMENT 'Búsqueda por fecha',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado',
    INDEX idx_aula_fecha (aula_id, fecha, activo, deleted_at) COMMENT 'Ocupación de aula por fecha',
    INDEX idx_asignacion_fecha (asignacion_docente_id, fecha, activo, deleted_at) COMMENT 'Agenda del curso',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Sesiones de reforzamiento pedagógico agendadas por el docente de la asignatura.';

CREATE TABLE sesion_reforzamiento_participantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sesion_reforzamiento_id INT NULL COMMENT 'Sesión (referencia a sesiones_reforzamiento)',
    matricula_materia_id INT NULL COMMENT 'Matrícula del estudiante en la materia reforzada (referencia a matriculas_materia)',
    origen ENUM('RIESGO', 'DOCENTE', 'VOLUNTARIO') DEFAULT 'RIESGO'
        COMMENT 'RIESGO: convocado por alerta de riesgo pedagógico | DOCENTE: invitado por el docente | VOLUNTARIO: asistencia voluntaria',
    asistio BOOLEAN NULL COMMENT 'NULL: sin registrar | TRUE: asistió | FALSE: faltó',
    progreso ENUM('SIN_EVALUAR', 'EN_PROGRESO', 'MEJORADO', 'SIN_MEJORA') DEFAULT 'SIN_EVALUAR'
        COMMENT 'Valoración del docente sobre el progreso del estudiante tras la sesión',
    observaciones TEXT NULL COMMENT 'Observaciones del docente sobre el participante',

    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    FOREIGN KEY (sesion_reforzamiento_id) REFERENCES sesiones_reforzamiento(id) ON DELETE SET NULL,
    FOREIGN KEY (matricula_materia_id) REFERENCES matriculas_materia(id) ON DELETE SET NULL,

    INDEX idx_sesion_id (sesion_reforzamiento_id) COMMENT 'Participantes de una sesión',
    INDEX idx_matricula_materia_id (matricula_materia_id) COMMENT 'Sesiones de un estudiante-materia',
    INDEX idx_sesion_matricula (sesion_reforzamiento_id, matricula_materia_id, activo, deleted_at) COMMENT 'Acceso directo al participante',
    INDEX idx_asistio (asistio) COMMENT 'Filtrado por asistencia',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Participantes de sesiones de reforzamiento con asistencia y valoración de progreso.';

SET FOREIGN_KEY_CHECKS = 1;
```

### A2. Vistas `backend/database/03-views/` (156–163)

IMPORTANTE para el implementador: ANTES de escribir cada archivo, verificar los
nombres REALES de columnas de las vistas base (135 `vista_base_calificacion_centralizador_paralelo_fila`,
130 `vista_base_asignacion_docente_detalle`) y ajustar los SELECT si difieren.
Documentar en cabecera de cada vista sus bases y consumidor (patrón de la 135).

- `156-vista-base-acompanamiento-riesgo-fila.sql` — `vista_base_acompanamiento_riesgo_fila`, grano estudiante×materia, sobre la 135 + JOIN cadena pg→gestiones_planes→planes_estudios→carreras + LEFT JOIN `configuracion_evaluacion` (clave `ACOMPANAMIENTO_PEDAGOGICO`, vigente). Columnas: ids de la cadena, datos estudiante/materia/docente, carrera (id/codigo/nombre/color_hex), bim1..4, promedio_anual, nota_final, matricula_estado, `nota_ultimo_bimestre = COALESCE(bim4,bim3,bim2,bim1)`, `umbral_riesgo = COALESCE(JSON umbralRiesgo, 61)`, `en_riesgo` (1 si nota_ultimo_bimestre < umbral OR promedio_anual < umbral; 0 si sin notas).
- `157-vista-acompanamiento-riesgo-carrera.sql` — agregado por gestión+carrera: total/en-riesgo matrículas y estudiantes distintos, `pct_estudiantes_riesgo`.
- `158-vista-acompanamiento-reprobacion-materia.sql` — agregado por gestión+carrera+oferta_curso: matriculados, en_riesgo, reprobados, `pct_riesgo`, `pct_reprobacion`.
- `159-vista-base-tutoria-proyecto-integrante-fila.sql` — proyectos_grado × tutoria_integrantes + estudiantes + modalidades_grado + carreras + docentes (tutor_nombre e integrante_nombre con orden APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES).
- `160-vista-tutoria-proyectos-listado.sql` — final por proyecto sobre la 159 + subconsultas de bitácora (ultima_fecha, total, pendientes, ultimo_porcentaje) y avances pendientes; cantidad_integrantes. Bandeja del tutor = `WHERE tutor_id = ?` en repositorio (no vista aparte).
- `161-vista-base-acompanamiento-sesion-fila.sql` — sesiones_reforzamiento + vista 130 + aulas + subconsulta participantes (total, asistieron, mejorados).
- `162-vista-acompanamiento-sesiones-resumen.sql` — agregado por gestión+carrera+mes: programadas, realizadas, participantes, asistencias, pct_asistencia.
- `163-vista-base-tutoria-bitacora-mensual-tutor.sql` — bitácora agregada por tutor+carrera+gestión+mes: tutorias_registradas, tutorias_confirmadas, proyectos_atendidos (cubre la planilla DDE "tutorías programadas/desarrolladas en el mes").

(Las definiciones SQL completas propuestas por `datos` están en el historial del orquestador; el implementador las reconstruye con las columnas verificadas.)

### A3. Seeders `backend/database/02-seeders/`

- `66-seed-permisos-tut.sql` — patrón LITERAL del 65 (grupos_ui → permisos → permiso_acciones → roles_permisos; sin ids, refs por código; ADMIN_SISTEMA no se siembra). Detalle en Fase D.
- `67-seed-titulacion-modalidades-grado.sql` (renombrado 2026-07-29, ver `docs/plan/titulacion-y-dominios-pendientes.md`) — 4 modalidades: `PSP` Proyecto Socio-comunitario Productivo (grupal), `PG` Proyecto de Grado, `PE` Proyecto de Emprendimiento, `TD` Trabajo Dirigido; flags requiere_tutor/requiere_proyecto/requiere_defensa = TRUE, requiere_examen = FALSE (ajustar a columnas reales de la tabla).
- EDITAR `54-seed-configuracion-evaluacion.sql` — fila nueva (sigue su formato con ids explícitos): clave `ACOMPANAMIENTO_PEDAGOGICO`, valor `{"umbralRiesgo":61,"criterio":"ULTIMO_BIMESTRE_O_ACUMULADO"}`, tipo JSON, vigente TRUE.

## Fases B/C/D — contrato de API y checklist

### Contrato Titulación — router `/api/v1/proyectos-grado`

| # | Método + Ruta | Permiso · Acción | Use case | Fuente | dataFieldName |
|---|---|---|---|---|---|
| T1 | GET `/proyectos-grado` | proyecto·LISTAR | ListProyectosGradoUseCase | vista 160 | `proyectosGrado` |
| T2 | GET `/proyectos-grado/modalidades` | proyecto·LISTAR | ListModalidadesGradoUseCase | modalidades_grado | `modalidadesGrado` |
| T3 | GET `/proyectos-grado/mis-tutorados` | proyecto·LISTAR | ListMisTutoradosUseCase (resolveDocenteIdForUsuario) | 160 WHERE tutor_id | `misTutorados` |
| T4 | GET `/proyectos-grado/mi-proyecto` | proyecto·DETALLE | GetMiProyectoGradoUseCase (resolveEstudianteIdForUsuario) | 160+159+satélites | `proyectoGrado` |
| T5 | GET `/proyectos-grado/reportes/bitacora-mensual?mes=&gestionId=` | proyecto·EXPORTAR | ExportBitacoraMensualTutorPdfUseCase | vista 163 | — (PDF res.download) |
| T6 | GET `/proyectos-grado/:id` | proyecto·DETALLE | GetProyectoGradoByIdUseCase | 160+159+resúmenes | `proyectoGrado` |
| T7 | POST `/proyectos-grado` | proyecto·CREAR | CreateProyectoGradoUseCase (crea TITULAR + integrantes si PSP) | proyectos_grado + tutoria_integrantes | `proyectoGrado` |
| T8 | PUT `/proyectos-grado/:id` | proyecto·EDITAR | UpdateProyectoGradoUseCase | proyectos_grado | `proyectoGrado` |
| T9 | DELETE `/proyectos-grado/:id` | proyecto·ELIMINAR | DeleteProyectoGradoUseCase (soft) | proyectos_grado | `proyectoGrado` |
| T10 | POST `/proyectos-grado/:id/tutor` | proyecto·APROBAR | AsignarTutorProyectoUseCase (genera PDF designación → tutoria_dictamenes DESIGNACION_OFICIAL) | proyectos_grado + tutoria_dictamenes | `proyectoGrado` |
| T11 | POST `/proyectos-grado/:id/transiciones` | proyecto·APROBAR | AprobarEtapaProyectoUseCase (transición estado; emite VIABILIDAD_TECNICA + PDF cuando corresponde) | proyectos_grado + tutoria_dictamenes | `proyectoGrado` |
| T12 | POST `/proyectos-grado/:id/integrantes` | proyecto·EDITAR | AddIntegranteProyectoUseCase | tutoria_integrantes | `integrante` |
| T13 | PATCH `/proyectos-grado/:id/integrantes/:integranteId` | proyecto·EDITAR | UpdateIntegranteProyectoUseCase | tutoria_integrantes | `integrante` |
| T14 | GET `/proyectos-grado/:id/bitacora` | bitacora·LISTAR | ListBitacoraProyectoUseCase | tutoria_bitacora | `bitacoraEntradas` |
| T15 | POST `/proyectos-grado/:id/bitacora` | bitacora·CREAR | CreateBitacoraEntradaUseCase (REVISION_AVANCE actualiza tutoria_avances.estado_revision) | tutoria_bitacora + tutoria_avances | `bitacoraEntrada` |
| T16 | PUT `/proyectos-grado/:id/bitacora/:entradaId` | bitacora·EDITAR | UpdateBitacoraEntradaUseCase | tutoria_bitacora | `bitacoraEntrada` |
| T17 | POST `/proyectos-grado/:id/bitacora/:entradaId/confirmar` | bitacora·LISTAR + guard integrante ACTIVO (server) | ConfirmarBitacoraEstudianteUseCase | tutoria_bitacora | `bitacoraEntrada` |
| T18 | GET `/proyectos-grado/:id/avances` | avance·LISTAR | ListAvancesProyectoUseCase | tutoria_avances | `avances` |
| T19 | GET `/proyectos-grado/:id/avances/:avanceId` | avance·DETALLE | GetAvanceByIdUseCase | tutoria_avances + bitácora vinculada | `avance` |
| T20 | POST `/proyectos-grado/:id/avances` (multipart uploadAvanceProyecto) | avance·CREAR + guard integrante si estudiante | CreateAvanceProyectoUseCase | tutoria_avances | `avance` |
| T21 | GET `/proyectos-grado/:id/avances/:avanceId/archivo` | avance·DETALLE | DownloadAvanceArchivoUseCase | filesystem | — (res.download) |
| T22 | GET `/proyectos-grado/:id/dictamenes` | proyecto·DETALLE | ListDictamenesProyectoUseCase | tutoria_dictamenes | `dictamenes` |
| T23 | GET `/proyectos-grado/:id/dictamenes/:dictamenId/archivo` | proyecto·EXPORTAR | ExportDictamenPdfUseCase | filesystem | — (res.download) |

### Contrato Acompañamiento — router `/api/v1/acompanamiento`

| # | Método + Ruta | Permiso · Acción | Use case | Fuente | dataFieldName |
|---|---|---|---|---|---|
| A1 | GET `/acompanamiento/alertas` | alerta·LISTAR | ListAlertasRiesgoUseCase | vista 156 | `alertasRiesgo` |
| A2 | GET `/acompanamiento/alertas/mis-alumnos` | alerta·LISTAR | ListMisAlertasRiesgoDocenteUseCase (resolveDocenteIdForUsuario) | 156 ∩ cursos del docente | `misAlumnosEnRiesgo` |
| A3 | GET `/acompanamiento/alertas/estudiante/:estudianteId` | alerta·DETALLE | GetAlertaRiesgoEstudianteUseCase | 156 | `alertaEstudiante` |
| A4 | GET `/acompanamiento/sesiones` | sesion·LISTAR | ListSesionesReforzamientoUseCase | vista 161 | `sesionesReforzamiento` |
| A5 | GET `/acompanamiento/sesiones/:id` | sesion·DETALLE | GetSesionReforzamientoByIdUseCase | 161 + participantes | `sesionReforzamiento` |
| A6 | POST `/acompanamiento/sesiones` | sesion·CREAR | CreateSesionReforzamientoUseCase | sesiones_reforzamiento + participantes | `sesionReforzamiento` |
| A7 | PUT `/acompanamiento/sesiones/:id` | sesion·EDITAR | UpdateSesionReforzamientoUseCase | sesiones_reforzamiento | `sesionReforzamiento` |
| A8 | DELETE `/acompanamiento/sesiones/:id` | sesion·ELIMINAR | DeleteSesionReforzamientoUseCase (soft) | sesiones_reforzamiento | `sesionReforzamiento` |
| A9 | PUT `/acompanamiento/sesiones/:id/participantes` | sesion·EDITAR | RegisterAsistenciaSesionUseCase (batch) | sesion_reforzamiento_participantes | `participantes` |
| A10 | GET `/acompanamiento/panel?gestionId=` | panel·LISTAR | GetPanelAcompanamientoUseCase | 157+158+162 (+top de 156) | `panelAcompanamiento` |
| A11 | GET `/acompanamiento/panel/exportar?gestionId=` | panel·EXPORTAR | ExportPanelAcompanamientoPdfUseCase | 157/158/162 | — (PDF) |

Rutas estáticas SIEMPRE antes de `/:id` (Express y React Router). Catálogos reutilizados (no crear): docentes, búsqueda estudiantes (vista 153), aulas, asignaciones docentes (vista 130).

### RBAC (seed 66)

- grupos_ui dominio TUTORIAS: `tut_titulacion` (orden 1), `tut_acompanamiento` (orden 2).
- Permisos (modulo TUT): `tutorias.titulacion.proyecto` (`/tutorias/titulacion`) LISTAR/DETALLE/CREAR/EDITAR/ELIMINAR/APROBAR/EXPORTAR; `tutorias.titulacion.bitacora` LISTAR/CREAR/EDITAR; `tutorias.titulacion.avance` LISTAR/DETALLE/CREAR; `tutorias.acompanamiento.alerta` (`/tutorias/acompanamiento/alertas`) LISTAR/DETALLE; `tutorias.acompanamiento.sesion` (`/tutorias/acompanamiento/sesiones`) LISTAR/DETALLE/CREAR/EDITAR/ELIMINAR; `tutorias.acompanamiento.panel` (`/tutorias/acompanamiento/panel`) LISTAR/EXPORTAR.
- Roles: DIR_ACADEMICO y RECTOR = todo; SEC_ACADEMICA = proyecto L/D/C/E/EXPORTAR + bitacora L + avance L/D + alerta L/D; DOCENTE = proyecto L/D + bitacora L/C/E + avance L/D + alerta L/D + sesion L/D/C/E; ESTUDIANTE = proyecto DETALLE + bitacora LISTAR + avance L/D/CREAR.

### Frontend — mapa de páginas (dataKey == dataFieldName literal)

Aliases nuevos en `vite.config.js` Y `jsconfig.json`: `@application-tutorias`, `@tutorias`.
Dominio TUT order 9 en `dominios/routes.jsx` (CFG→10, SEG→11) + `...tutoriasRoutes` en `presentation/modules/index.js`.
Menú: Proyectos de grado (1), Alumnos en riesgo (2), Sesiones de reforzamiento (3), Panel de acompañamiento (4).

| Página | Hook state | Hook api → DATA_KEY | Endpoints |
|---|---|---|---|
| titulacion/pages/ProyectosGradoList | useProyectosGradoListPage | useProyectosGradoApi → `proyectosGrado` | T1 |
| titulacion/pages/ProyectoGradoDetail (ficha-hub tabs datos/integrantes/bitácora/avances/dictámenes) | useProyectoGradoDetailPage | `proyectoGrado`, `bitacoraEntradas`, `avances`, `dictamenes` | T6,T14,T18,T22 |
| titulacion/pages/ProyectoGradoFormPage | useProyectoGradoFormPage | `modalidadesGrado`; mutations → `proyectoGrado` | T2,T7,T8 |
| titulacion/pages/MisTutoradosPage (docente) | useMisTutoradosPage | `misTutorados` | T3 |
| titulacion/pages/MiProyectoGradoPage (estudiante) | useMiProyectoGradoPage | `proyectoGrado`; upload → `avance` | T4,T18,T20,T21 |
| acompanamiento/alertas/pages/AlertasRiesgoList | useAlertasRiesgoListPage | `alertasRiesgo` | A1 |
| acompanamiento/alertas/pages/MisAlumnosEnRiesgoPage (docente) | useMisAlumnosEnRiesgoPage | `misAlumnosEnRiesgo` | A2 |
| (drawer detalle alerta) | en state de lista | `alertaEstudiante` | A3 |
| acompanamiento/sesiones/pages/SesionesList | useSesionesListPage | `sesionesReforzamiento` | A4 |
| acompanamiento/sesiones/pages/SesionReforzamientoFormPage | useSesionReforzamientoFormPage | `sesionReforzamiento` | A6,A7 |
| acompanamiento/sesiones/pages/SesionReforzamientoDetail (asistencia/progreso) | useSesionReforzamientoDetailPage | `sesionReforzamiento`; batch → `participantes` | A5,A9 |
| acompanamiento/panel/pages/PanelAcompanamientoPage (stat-cards + Progress + tabla críticos) | usePanelAcompanamientoPage | `panelAcompanamiento` | A10,A11 |

Wrappers de portal: `ProyectosGradoListConnector` bifurca `esDocente(usuario)` → MisTutoradosPage (patrón `matricula/connectors/ListConnector.jsx`); `AlertasRiesgoListConnector` bifurca → MisAlumnosEnRiesgoPage; ruta `/tutorias/mi-proyecto` key `TUT-MI-PROYECTO`, `menu: null`, permiso proyecto·DETALLE, breadcrumbParent TUT-TITULACION (patrón ACA-MI-BOLETIN). ESTUDIANTE no tiene proyecto·LISTAR → no ve menú Titulación.

UI: buildFullName (APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES), textos "usted", AntD 6 (`Alert title`, `Modal open`, `Space orientation`), riesgo en rojo semántico del theme (token, no hex), pills del kit del proyecto, Motion motivado.

## Estado y progreso

- [x] Diseño de datos (agente datos)
- [x] Decisiones de arquitectura (agente arquitecto)
- [x] Plan ejecutable + contrato de API (agente planificador)
- [x] Fase A: archivos SQL escritos (schema 23 —ex 26/22—, vistas 156-163, seeders 66/67, edición 54)
- [x] Fase B: backend implementado (use cases, controllers, routers, DI registrado en container y montado en routes/index.js; lint limpio)
- [x] Fase C: frontend implementado (capas application y presentation completas; `npm run build` OK)
- [x] Fase D/E: verificación (lint/build, dataKey==dataFieldName, RBAC 3 capas) — veredicto APROBADO (verificador, 2026-07-25)
- [ ] APROBACIÓN DEL USUARIO + ejecución en BD (schemas 22+23 → vistas 156-163 → seed 54 → 66 → 67; resembrar RBAC 57-66 completo)

## Bitácora de cambios

- 2026-07-24 · orquestador · Diseño consolidado (datos+arquitecto+planificador); contrato de API cerrado; T17 = LISTAR + guard de pertenencia. Nota: docs/plan/REVAMP.md no existe en la rama development (vive en revamp); la memoria del módulo TUT se lleva en este documento.
- 2026-07-25 · frontend · Capa de presentación del submódulo ACOMPAÑAMIENTO completa (`presentation/modules/tutorias/acompanamiento/**`): alertas (lista admin + rama docente + drawer A3), sesiones (lista, form A6/A7 con TimePickers, ficha con batch A9 y transiciones), panel (KPI strip + Progress por carrera + tablas 156/158 + export A11) y `acompanamientoRoutes`. Fix compartido: `fieldRenderers.jsx` ahora reenvía `optionFilterProp` al Select (los hooks TUT lo declaran para búsqueda por label). Alert reservado a errores bloqueantes (indicación del usuario); riesgo con pills/tokens semánticos.
- 2026-07-25 · verificador · Fase D/E: lint frontend scope (`presentation/modules/tutorias/**/*.jsx`) limpio (exit 0); build OK; lint backend TUT limpio; dataKey==dataFieldName verificado en los 16 literales del contrato (incluye fallback `result.data?.[KEY] ?? result.data`, patrón ya usado en el repo); RBAC verificado en 3 capas (seed 66, routers Express, routes.jsx/ActionButton/TableActions); rutas estáticas antes de /:id en ambos lados; UI sin hex/px hardcodeados, Alert solo bloqueante, estados vacío/carga/error cubiertos, textos en "usted". Veredicto: APROBADO. Nota: 4 errores `react-hooks/set-state-in-effect` en application/modules/tutorias/**, fuera del scope de lint exigido y consistentes con 23 ocurrencias preexistentes del mismo patrón en el resto del repo (deuda no introducida por este módulo). Pendiente: ejecución en BD (schemas 22+23, vistas 156-163, seeders 66/67/54, resembrado RBAC 57-66) requiere aprobación explícita del usuario.
- 2026-07-25 · ajustes de portal por rol (pedido del usuario, patrón historial/asistencia): `labelByRole { DOCENTE }` en menús TUT-TITULACION («Mis tutorados») y TUT-ALERTAS («Mis alumnos en riesgo»); tarjeta «Mi proyecto de grado» en `EstudianteDashboard` → `/tutorias/mi-proyecto` (patrón ACA-MI-BOLETIN; ESTUDIANTE no ve menú TUT por carecer de LISTAR). Sección TUT documentada en `docs/referencia/matriz-permisos-sistema.md` (changelog 2026-07-25) — la matriz previa (2026-07-14) no contemplaba tutorías. Build OK tras los ajustes. Drawer de detalle de alerta (solo lectura) aprobado por el usuario.
- 2026-07-25 · reanudación · La sesión anterior agotó tokens con Fase A y Fase B escritas pero SIN cablear: se registró `registerTutoriasModule` en `container/modules/index.js` y se montaron `/proyectos-grado` y `/acompanamiento` en `presentation/routes/index.js`; lint del módulo backend corregido (28 errores: max-len, no-await-in-loop con disable puntual como el resto del repo, no-continue, unused-var). Container resuelve ambos routers. Fase C: capa application frontend ya existía completa; capa presentation delegada a 2 agentes frontend en paralelo (titulacion + routes raíz / acompanamiento), con el módulo `configuracion` como referencia de UI (configs de tablas, form sections/wizard) por instrucción del usuario.
