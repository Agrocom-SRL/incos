-- ============================================
-- MÓDULO DE CURSOS DE CAPACITACIÓN
-- Sistema de Gestión Académica - Instituto INCOS
-- 6 Tablas: participantes, capacitaciones, capacitacion_horarios,
--           capacitacion_inscritos, capacitacion_pagos, capacitacion_compromisos
-- Dominio independiente de la matrícula formal del instituto: cursos cortos
-- (ej. "Word avanzado") abiertos a cualquier persona (colegio, público en
-- general o estudiantes del instituto), sin acceso al sistema (sin usuario/rol).
-- Pago por cuotas: capacitacion_pagos es el historial de pagos (mismo rol
-- que pago_cuotas); capacitacion_inscritos cachea el monto objetivo y un
-- estado de pago; capacitacion_compromisos es informativo para la
-- administración (quién no pagó en la fecha acordada) y NO bloquea ni anula
-- nada de forma automática — un pago atrasado se acepta con normalidad.
-- Convención de nombres: tabla raíz `capacitaciones` (plural, sin prefijo,
-- como `cursos`/`carreras`/`paralelos`); todo lo que depende de ella usa el
-- prefijo `capacitacion_` (verificado sin colisión con el resto del esquema
-- — existen `inscripciones` y `sesiones` con otro significado, por eso NO
-- se usan esos dos nombres a secas).
-- NORMALIZACIÓN: Estructura normalizada según 3FN
-- ============================================

USE instituto_incos;

-- ============================================
-- FASE 1: ELIMINACIÓN DE TABLAS
-- Deshabilitamos foreign key checks para poder eliminar en cualquier orden
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar todas las tablas (orden no importa con foreign key checks deshabilitado)
DROP TABLE IF EXISTS capacitacion_inscrito_requisitos;
DROP TABLE IF EXISTS capacitacion_requisitos;
DROP TABLE IF EXISTS capacitacion_pagos;
DROP TABLE IF EXISTS capacitacion_compromisos;
DROP TABLE IF EXISTS capacitacion_inscritos;
DROP TABLE IF EXISTS capacitacion_horarios;
DROP TABLE IF EXISTS capacitacion_grupos;
DROP TABLE IF EXISTS capacitaciones;
DROP TABLE IF EXISTS participantes;

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
-- Las foreign key checks siguen deshabilitadas durante la creación
-- ============================================

-- ============================================
-- TABLA: participantes
-- Persona externa a la matrícula formal del instituto (colegio, público en
-- general o incluso un estudiante del instituto) que se inscribe a una
-- capacitación. NO referencia estudiantes/usuarios: no tiene acceso al
-- sistema. Datos mínimos, no la ficha completa de un estudiante.
-- ============================================

CREATE TABLE participantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ci VARCHAR(20) NOT NULL COMMENT 'Cédula de identidad',
    expedicion VARCHAR(5) NULL COMMENT 'Expedición del CI (SC, LP, CB, etc.)',
    nombres VARCHAR(150) NOT NULL COMMENT 'Nombres completos',
    apellido_paterno VARCHAR(100) NULL COMMENT 'Apellido paterno',
    apellido_materno VARCHAR(100) NULL COMMENT 'Apellido materno',
    celular VARCHAR(20) NOT NULL COMMENT 'Teléfono celular de contacto',
    email VARCHAR(150) NULL COMMENT 'Correo de contacto (opcional)',

    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    -- NOTA: Las Foreign Keys a usuarios se omiten para evitar dependencias circulares
    -- Los campos created_by, updated_by, deleted_by se mantienen para auditoría

    INDEX idx_ci_expedicion (ci, expedicion) COMMENT 'Búsqueda por CI y expedición',
    INDEX idx_apellidos (apellido_paterno, apellido_materno) COMMENT 'Búsqueda por apellidos',
    INDEX idx_celular (celular) COMMENT 'Búsqueda por celular',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Participantes de cursos de capacitación. Independiente de estudiantes/usuarios: sin acceso al sistema.';

-- ============================================
-- TABLA: capacitaciones
-- Curso corto de capacitación (ej. Word avanzado), independiente de la
-- cadena paralelos_gestion → oferta_cursos → asignaciones_docentes.
-- ============================================

CREATE TABLE capacitaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL COMMENT 'Título del curso (ej: Word avanzado)',
    edicion VARCHAR(60) NULL COMMENT 'Etiqueta de la oferta (ej: 2027 – 1ª edición); distingue ofertas del mismo curso en una o varias gestiones',
    curso_origen_id INT NULL COMMENT 'Oferta de la que se copió esta edición (capacitaciones.id); NULL = curso original',
    descripcion TEXT NULL COMMENT 'Descripción/temario del curso',
    tiene_costo BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Interruptor: el curso NO es gratuito (habilita costo). FALSE = costo vale 0',
    cobra_matricula BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Interruptor: el curso cobra matrícula (habilita costo_matricula). FALSE = costo_matricula vale 0',
    costo DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Costo del CURSO en Bs (se deposita a la entidad certificadora, p. ej. IPELC)',
    costo_matricula DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Matrícula en Bs por defecto del curso (se paga en secretaría). Cada grupo puede fijar la suya en capacitacion_grupos.costo_matricula; esta rige solo para grupos sin precio propio',
    entidad_certificadora VARCHAR(150) NULL COMMENT 'Entidad que emite el certificado y cobra el costo del curso (ej: IPELC)',
    modalidad ENUM('VIRTUAL', 'PRESENCIAL', 'SEMIPRESENCIAL') NOT NULL DEFAULT 'PRESENCIAL'
        COMMENT 'VIRTUAL | PRESENCIAL | SEMIPRESENCIAL (parte virtual + parte presencial)',
    nivel VARCHAR(60) NULL COMMENT 'Nivel del curso (ej: Básico, Intermedio, Avanzado)',
    dirigido_a VARCHAR(255) NULL COMMENT 'A quién está dirigido el curso (público objetivo)',
    duracion VARCHAR(60) NULL COMMENT 'Duración en texto libre (ej: 2 meses); la fecha de fin es opcional',
    cupo_maximo INT NOT NULL DEFAULT 30 COMMENT 'Cupo máximo de participantes',
    fecha_inicio DATE NOT NULL COMMENT 'Fecha de inicio del curso',
    fecha_fin DATE NULL COMMENT 'Fecha de fin del curso (opcional: el curso puede definirse solo por duración/rango)',
    estado ENUM('PROPUESTO', 'ABIERTO', 'EN_CURSO', 'CERRADO', 'CANCELADO') NOT NULL DEFAULT 'PROPUESTO'
        COMMENT 'PROPUESTO: en definición | ABIERTO: acepta inscripciones | EN_CURSO: ya iniciado | CERRADO: finalizado | CANCELADO',

    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    -- NOTA: Las Foreign Keys a usuarios se omiten para evitar dependencias circulares
    -- Los campos created_by, updated_by, deleted_by se mantienen para auditoría


    FOREIGN KEY (curso_origen_id) REFERENCES capacitaciones(id) ON DELETE SET NULL,

    INDEX idx_titulo (titulo) COMMENT 'Búsqueda por título',
    INDEX idx_curso_origen_id (curso_origen_id) COMMENT 'Ediciones derivadas de una oferta',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado del curso',
    INDEX idx_fechas (fecha_inicio, fecha_fin) COMMENT 'Búsqueda por rango de fechas',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Cursos cortos de capacitación, independientes de la oferta académica formal del instituto.';

-- ============================================
-- TABLA: capacitacion_grupos
-- Grupos (tipo «paralelo») de un curso: «Grupo 1 – Mañana», «Grupo 2 – Tarde».
-- El curso es conceptual: los GRUPOS son el curso físico y llevan horarios
-- (capacitacion_horarios.grupo_id) y aula opcional. El participante elige GRUPO.
-- ============================================

CREATE TABLE capacitacion_grupos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    capacitacion_id INT NULL COMMENT 'Curso de capacitación',
    nombre VARCHAR(60) NOT NULL COMMENT 'Nombre del grupo (ej: Grupo 1 – Mañana)',
    cupo_maximo INT NULL COMMENT 'Cupo del grupo; NULL = usa el cupo del curso',
    costo_matricula DECIMAL(10,2) NULL COMMENT 'Matrícula en Bs de ESTE grupo (p. ej. Regular vs Intensivo); NULL = usa capacitaciones.costo_matricula. Solo aplica si el curso cobra_matricula',
    aula_id INT NULL COMMENT 'Aula del grupo (catálogo aulas, opcional)',
    orden INT NOT NULL DEFAULT 1 COMMENT 'Orden de presentación',

    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    FOREIGN KEY (capacitacion_id) REFERENCES capacitaciones(id) ON DELETE SET NULL,
    FOREIGN KEY (aula_id) REFERENCES aulas(id) ON DELETE SET NULL,

    INDEX idx_capacitacion_id (capacitacion_id) COMMENT 'Grupos por curso',
    INDEX idx_aula_id (aula_id) COMMENT 'Búsqueda por aula',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Grupos (tipo paralelo) de un curso de capacitación; el participante elige grupo.';

-- ============================================
-- TABLA: capacitacion_horarios
-- Bloques horarios (día/hora) de la capacitación. Reutiliza el catálogo
-- horarios, que ya contempla tipo_horario = 'CAPACITACION'.
-- ============================================

CREATE TABLE capacitacion_horarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    capacitacion_id INT NULL COMMENT 'Curso de capacitación',
    grupo_id INT NULL COMMENT 'Grupo al que pertenece el bloque (capacitacion_grupos.id); NULL = común a todos los grupos',
    horario_id INT NULL COMMENT 'Bloque día/hora (horarios.id, tipo_horario=CAPACITACION)',
    orden_secuencia INT NOT NULL DEFAULT 1 COMMENT 'Orden cronológico durante la semana',

    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    -- NOTA: Las Foreign Keys a usuarios se omiten para evitar dependencias circulares
    -- Los campos created_by, updated_by, deleted_by se mantienen para auditoría

    FOREIGN KEY (capacitacion_id) REFERENCES capacitaciones(id) ON DELETE SET NULL,
    FOREIGN KEY (grupo_id) REFERENCES capacitacion_grupos(id) ON DELETE SET NULL,
    FOREIGN KEY (horario_id) REFERENCES horarios(id) ON DELETE SET NULL,

    INDEX idx_capacitacion_id (capacitacion_id) COMMENT 'Búsqueda por curso',
    INDEX idx_grupo_id (grupo_id) COMMENT 'Bloques por grupo',
    INDEX idx_horario_id (horario_id) COMMENT 'Búsqueda por bloque horario',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_capacitacion_orden (capacitacion_id, orden_secuencia, activo, deleted_at)
        COMMENT 'Orden de bloques por curso'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bloques horarios (día/hora) que cuelgan de una capacitación.';

-- ============================================
-- TABLA: capacitacion_inscritos
-- Inscripción de un participante a una capacitación. Se llama
-- "capacitacion_inscritos" (no "inscripciones") para no chocar con la tabla
-- "inscripciones" ya existente en el esquema (matrícula formal del instituto).
-- ============================================

CREATE TABLE capacitacion_inscritos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    participante_id INT NULL COMMENT 'Participante inscrito',
    capacitacion_id INT NULL COMMENT 'Curso de capacitación',
    fecha_inscripcion DATE NOT NULL COMMENT 'Fecha en que se registró la inscripción',
    estado ENUM('PENDIENTE', 'INSCRITO', 'RETIRADO', 'ANULADO') NOT NULL DEFAULT 'PENDIENTE'
        COMMENT 'PENDIENTE: pago parcial, aun no completa el monto obligatorio | INSCRITO: monto obligatorio cancelado (a tiempo o con pago atrasado, ambos se aceptan igual) | RETIRADO: se retiro estando inscrito | ANULADO: decision administrativa manual (no automatica por incumplir el compromiso de pago)',

    -- Pago por cuotas: el detalle de cada pago vive en capacitacion_pagos
    -- (historial, sin límite de filas); aquí solo se cachea el objetivo y
    -- el estado para no tener que sumar capacitacion_pagos en cada listado
    monto_obligatorio DECIMAL(10,2) NOT NULL COMMENT 'Snapshot de capacitaciones.costo (costo del CURSO) al momento de inscribirse (protege de cambios de precio posteriores)',
    monto_matricula DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Snapshot de capacitaciones.costo_matricula al momento de inscribirse',
    estado_pago_matricula ENUM('PARCIAL', 'CANCELADO') NOT NULL DEFAULT 'PARCIAL'
        COMMENT 'CANCELADO: SUM(pagos concepto MATRICULA) >= monto_matricula (o la matrícula es 0)',
    estado_pago_curso ENUM('PARCIAL', 'CANCELADO') NOT NULL DEFAULT 'PARCIAL'
        COMMENT 'CANCELADO: SUM(pagos concepto CURSO) >= monto_obligatorio',
    capacitacion_grupo_id INT NULL COMMENT 'Grupo elegido de entre los del curso (capacitacion_grupos.id); NULL = curso sin grupos',
    estado_pago ENUM('PARCIAL', 'CANCELADO') NOT NULL DEFAULT 'PARCIAL'
        COMMENT 'Global: CANCELADO solo si matrícula y curso están cancelados; PARCIAL en otro caso',

    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    -- NOTA: Las Foreign Keys a usuarios se omiten para evitar dependencias circulares
    -- Los campos created_by, updated_by, deleted_by se mantienen para auditoría

    FOREIGN KEY (participante_id) REFERENCES participantes(id) ON DELETE SET NULL,
    FOREIGN KEY (capacitacion_id) REFERENCES capacitaciones(id) ON DELETE SET NULL,
    FOREIGN KEY (capacitacion_grupo_id) REFERENCES capacitacion_grupos(id) ON DELETE SET NULL,

    -- Sin UNIQUE en (participante_id, capacitacion_id): con soft delete puede
    -- haber una fila eliminada y otra nueva; la "una inscripción activa" se
    -- garantiza en lógica de negocio (igual que pago_aporte por estudiante+gestión)
    INDEX idx_participante_id (participante_id) COMMENT 'Búsqueda por participante',
    INDEX idx_capacitacion_id (capacitacion_id) COMMENT 'Búsqueda por curso',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado de inscripción',
    INDEX idx_estado_pago (estado_pago) COMMENT 'Filtrado por estado de pago',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_capacitacion_estado (capacitacion_id, estado, activo, deleted_at)
        COMMENT 'Inscritos activos por curso',
    INDEX idx_capacitacion_estado_pago (capacitacion_id, estado_pago, activo, deleted_at)
        COMMENT 'Pendientes de pago por curso'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Inscripción de un participante a una capacitación. Pago por cuotas: monto_obligatorio y estado_pago cachean el objetivo y avance; el detalle vive en capacitacion_pagos.';

-- ============================================
-- TABLA: capacitacion_compromisos
-- Compromiso de pago del participante: fecha acordada para cancelar el
-- saldo pendiente de una inscripción con pago parcial. Uso administrativo
-- (saber quién no pagó en la fecha acordada) — NO bloquea ni anula nada de
-- forma automática: un pago atrasado se acepta con normalidad y sigue el
-- ciclo normal de cuotas. Mismo patrón que compromisos_pago (14-pagos-
-- academicos.sql) pero colgado de capacitacion_inscritos en vez de
-- pago_aporte (una capacitación no tiene gestión y el participante puede no
-- ser estudiante).
-- ============================================

CREATE TABLE capacitacion_compromisos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    capacitacion_inscrito_id INT NULL COMMENT 'Inscripción a la que aplica el compromiso',

    fecha_compromiso DATE NOT NULL COMMENT 'Fecha acordada para cancelar el saldo',
    observacion VARCHAR(500) NULL COMMENT 'Nota del compromiso (condiciones, respaldo)',
    estado ENUM('VIGENTE', 'CUMPLIDO', 'INCUMPLIDO') DEFAULT 'VIGENTE'
        COMMENT 'VIGENTE=en plazo | CUMPLIDO=saldo cancelado a tiempo | INCUMPLIDO=venció sin cancelar (solo informativo para reportes administrativos)',

    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    -- NOTA: Las Foreign Keys a usuarios se omiten para evitar dependencias circulares
    -- Los campos created_by, updated_by, deleted_by se mantienen para auditoría

    FOREIGN KEY (capacitacion_inscrito_id) REFERENCES capacitacion_inscritos(id) ON DELETE SET NULL,

    -- Sin UNIQUE en capacitacion_inscrito_id: la "un compromiso VIGENTE por inscripción" se garantiza en lógica de negocio (soft delete + histórico)
    INDEX idx_capacitacion_inscrito_id (capacitacion_inscrito_id) COMMENT 'Búsqueda por inscripción',
    INDEX idx_fecha_compromiso (fecha_compromiso) COMMENT 'Búsqueda/orden por fecha de compromiso',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado del compromiso',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_inscrito_vigente (capacitacion_inscrito_id, estado, activo, deleted_at) COMMENT 'Compromiso vigente por inscripción'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Compromiso de pago de un participante: fecha acordada para cancelar el saldo. Uso administrativo/reportes; incumplirlo NO anula la inscripción automáticamente ni bloquea el pago atrasado.';

-- ============================================
-- TABLA: capacitacion_pagos
-- Historial de pagos (cuotas) de una inscripción a capacitación — mismo rol
-- que pago_cuotas en el módulo de Pagos, pero sin acoplarse a
-- pago_aporte/compromisos_pago (esos dependen de estudiante+gestión; una
-- capacitación no tiene gestión y el participante puede no ser estudiante).
-- Reutiliza los catálogos metodos_pago/cuentas_pago.
-- ============================================

CREATE TABLE capacitacion_pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    capacitacion_inscrito_id INT NULL COMMENT 'Inscripción a la que corresponde el pago',
    metodo_pago_id INT NULL COMMENT 'Método de pago utilizado (catálogo metodos_pago)',
    cuenta_pago_id INT NULL COMMENT 'Cuenta utilizada (catálogo cuentas_pago, para TRANSFERENCIA/DEPOSITO/QR/TIGO_MONEY)',
    concepto ENUM('MATRICULA', 'CURSO') NOT NULL DEFAULT 'CURSO'
        COMMENT 'MATRICULA: se paga al instituto (secretaría) | CURSO: costo del curso, se deposita a la entidad certificadora. Son instituciones distintas y se pagan por separado',
    monto DECIMAL(10,2) NOT NULL COMMENT 'Monto pagado en Bs',
    fecha_pago DATE NOT NULL COMMENT 'Fecha del pago',
    numero_recibo VARCHAR(50) NOT NULL COMMENT 'Número de recibo (generado por lógica de negocio)',
    observaciones TEXT NULL COMMENT 'Observaciones del pago',
    comprobante_ruta VARCHAR(500) NULL COMMENT 'Ruta del comprobante/depósito escaneado (opcional, nunca obligatorio)',
    comprobante_nombre VARCHAR(255) NULL COMMENT 'Nombre original del archivo del comprobante',
    anulado BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Pago anulado por error: se conserva el historial pero NO cuenta en totales, saldos ni ingresos',
    motivo_anulacion VARCHAR(500) NULL COMMENT 'Motivo obligatorio de la anulación',
    fecha_anulacion DATETIME NULL COMMENT 'Momento en que se anuló el pago',
    anulado_por INT NULL COMMENT 'Usuario que anuló el pago',

    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    -- NOTA: Las Foreign Keys a usuarios se omiten para evitar dependencias circulares
    -- Los campos created_by, updated_by, deleted_by se mantienen para auditoría

    FOREIGN KEY (capacitacion_inscrito_id) REFERENCES capacitacion_inscritos(id) ON DELETE SET NULL,
    FOREIGN KEY (metodo_pago_id) REFERENCES metodos_pago(id) ON DELETE SET NULL,
    FOREIGN KEY (cuenta_pago_id) REFERENCES cuentas_pago(id) ON DELETE SET NULL,

    -- Sin UNIQUE en numero_recibo: mismo criterio que pago_cuotas (unicidad en lógica de negocio)
    INDEX idx_capacitacion_inscrito_id (capacitacion_inscrito_id) COMMENT 'Búsqueda por inscripción',
    INDEX idx_numero_recibo (numero_recibo) COMMENT 'Búsqueda por número de recibo',
    INDEX idx_fecha_pago (fecha_pago) COMMENT 'Búsqueda por fecha de pago',
    INDEX idx_metodo_pago_id (metodo_pago_id) COMMENT 'Búsqueda por método de pago',
    INDEX idx_anulado (anulado) COMMENT 'Filtrado de pagos anulados',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Historial de pagos (cuotas) de una inscripción a capacitación. Sin límite de filas: SUM(monto) WHERE activo=1 AND deleted_at IS NULL AND anulado=0 se compara contra capacitacion_inscritos.monto_obligatorio.';

-- ============================================
-- TABLA: capacitacion_requisitos
-- Requisitos de inscripción de un curso (lista configurable por curso, ej.:
-- «Dos fotocopias de cédula de identidad vigente», «Formulario de
-- inscripción», «Dos fotocopias del depósito bancario»). Equivale a los
-- documentos de la matrícula formal, pero sin acoplarse a estudiantes.
-- ============================================

CREATE TABLE capacitacion_requisitos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    capacitacion_id INT NULL COMMENT 'Curso de capacitación',
    descripcion VARCHAR(255) NOT NULL COMMENT 'Texto del requisito',
    obligatorio BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Obligatorio para pasar a INSCRITO',
    acredita_pago_curso BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Entregarlo acredita el pago del costo del curso a la entidad certificadora (fotocopia del depósito). Solo con capacitaciones.entidad_certificadora; a lo sumo un requisito por curso (validado en lógica)',
    orden INT NOT NULL DEFAULT 1 COMMENT 'Orden de presentación',

    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    FOREIGN KEY (capacitacion_id) REFERENCES capacitaciones(id) ON DELETE SET NULL,

    INDEX idx_capacitacion_id (capacitacion_id) COMMENT 'Requisitos por curso',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Requisitos de inscripción configurables por curso de capacitación.';

-- ============================================
-- TABLA: capacitacion_inscrito_requisitos
-- Entrega de cada requisito por inscripción (checklist del participante).
-- La inscripción solo pasa a INSCRITO cuando están pagados matrícula y curso
-- Y entregados todos los requisitos obligatorios; mientras tanto queda
-- PENDIENTE (la inscripción puede registrarse y completarse después).
-- ============================================

CREATE TABLE capacitacion_inscrito_requisitos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    capacitacion_inscrito_id INT NULL COMMENT 'Inscripción',
    capacitacion_requisito_id INT NULL COMMENT 'Requisito del curso',
    entregado BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'El participante entregó el requisito',
    fecha_entrega DATE NULL COMMENT 'Fecha de entrega',
    observacion VARCHAR(255) NULL COMMENT 'Nota (ej: falta una fotocopia)',

    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',

    FOREIGN KEY (capacitacion_inscrito_id) REFERENCES capacitacion_inscritos(id) ON DELETE SET NULL,
    FOREIGN KEY (capacitacion_requisito_id) REFERENCES capacitacion_requisitos(id) ON DELETE SET NULL,

    INDEX idx_inscrito_id (capacitacion_inscrito_id) COMMENT 'Requisitos por inscripción',
    INDEX idx_requisito_id (capacitacion_requisito_id) COMMENT 'Entregas por requisito',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Checklist de requisitos entregados por inscripción a capacitación.';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================