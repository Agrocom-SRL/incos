-- ============================================
-- MÓDULO DE CURSOS DE CAPACITACIÓN
-- Sistema de Gestión Académica - Instituto INCOS
-- 5 Tablas: participantes, capacitaciones, capacitacion_horarios,
--           capacitacion_inscritos, capacitacion_pagos
-- Dominio independiente de la matrícula formal del instituto: cursos cortos
-- (ej. "Word avanzado") abiertos a cualquier persona (colegio, público en
-- general o estudiantes del instituto), sin acceso al sistema (sin usuario/rol).
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
    estado ENUM('INSCRITO', 'RETIRADO') NOT NULL DEFAULT 'INSCRITO' COMMENT 'Estado de la inscripción',

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
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_capacitacion_estado (capacitacion_id, estado, activo, deleted_at)
        COMMENT 'Inscritos activos por curso'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Inscripción de un participante a una capacitación.';

-- ============================================
-- TABLA: capacitacion_pagos
-- Pago único de matrícula/inscripción a la capacitación (sin cuotas).
-- Reutiliza los catálogos metodos_pago/cuentas_pago, sin extender
-- pago_cuotas/compromisos_pago (acoplados a estudiante+gestión).
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
COMMENT='Pago único de matrícula/inscripción a una capacitación. Sin cuotas: un pago por inscripción.';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================