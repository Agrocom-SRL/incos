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
DROP TABLE IF EXISTS capacitacion_pagos;
DROP TABLE IF EXISTS capacitacion_compromisos;
DROP TABLE IF EXISTS capacitacion_inscritos;
DROP TABLE IF EXISTS capacitacion_horarios;
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
    descripcion TEXT NULL COMMENT 'Descripción/temario del curso',
    costo DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Costo de matrícula/inscripción en Bs',
    cupo_maximo INT NOT NULL DEFAULT 30 COMMENT 'Cupo máximo de participantes',
    aula_id INT NULL COMMENT 'Aula asignada (catálogo aulas, reutilizado)',
    fecha_inicio DATE NOT NULL COMMENT 'Fecha de inicio del curso',
    fecha_fin DATE NOT NULL COMMENT 'Fecha de fin del curso',
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

    FOREIGN KEY (aula_id) REFERENCES aulas(id) ON DELETE SET NULL,

    INDEX idx_titulo (titulo) COMMENT 'Búsqueda por título',
    INDEX idx_aula_id (aula_id) COMMENT 'Búsqueda por aula',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado del curso',
    INDEX idx_fechas (fecha_inicio, fecha_fin) COMMENT 'Búsqueda por rango de fechas',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Cursos cortos de capacitación, independientes de la oferta académica formal del instituto.';

-- ============================================
-- TABLA: capacitacion_horarios
-- Bloques horarios (día/hora) de la capacitación. Reutiliza el catálogo
-- horarios, que ya contempla tipo_horario = 'CAPACITACION'.
-- ============================================

CREATE TABLE capacitacion_horarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    capacitacion_id INT NULL COMMENT 'Curso de capacitación',
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
    FOREIGN KEY (horario_id) REFERENCES horarios(id) ON DELETE SET NULL,

    INDEX idx_capacitacion_id (capacitacion_id) COMMENT 'Búsqueda por curso',
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
    monto_obligatorio DECIMAL(10,2) NOT NULL COMMENT 'Snapshot de capacitaciones.costo al momento de inscribirse (protege de cambios de precio posteriores)',
    estado_pago ENUM('PARCIAL', 'CANCELADO') NOT NULL DEFAULT 'PARCIAL'
        COMMENT 'PARCIAL: aun debe saldo (siempre existe al menos el primer pago al crear la fila) | CANCELADO: SUM(capacitacion_pagos.monto) >= monto_obligatorio',

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
    monto DECIMAL(10,2) NOT NULL COMMENT 'Monto pagado en Bs',
    fecha_pago DATE NOT NULL COMMENT 'Fecha del pago',
    numero_recibo VARCHAR(50) NOT NULL COMMENT 'Número de recibo (generado por lógica de negocio)',
    observaciones TEXT NULL COMMENT 'Observaciones del pago',

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
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Historial de pagos (cuotas) de una inscripción a capacitación. Sin límite de filas: SUM(monto) WHERE activo=1 AND deleted_at IS NULL se compara contra capacitacion_inscritos.monto_obligatorio.';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================