-- ============================================
-- SEEDER: metodos_pago
-- Sistema de Gestión Académica - Instituto INCOS
-- Catálogo de métodos de pago disponibles
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE metodos_pago;

-- ============================================
-- INSERTAR MÉTODOS DE PAGO
-- IDs fijos: 1 (EFECTIVO), 2 (QR), 3 (TRANSFERENCIA)
-- Orden: EFECTIVO primero, luego QR, después TRANSFERENCIA
-- ============================================

-- Método de Pago 1: EFECTIVO
INSERT INTO metodos_pago (id, codigo, nombre, activo) VALUES
(1, 'EFECTIVO', 'Pago en Efectivo', TRUE);

-- Método de Pago 2: QR
INSERT INTO metodos_pago (id, codigo, nombre, activo) VALUES
(2, 'QR', 'Pago por Código QR', TRUE);

-- Método de Pago 3: TRANSFERENCIA
INSERT INTO metodos_pago (id, codigo, nombre, activo) VALUES
(3, 'TRANSFERENCIA', 'Transferencia Bancaria', TRUE);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================
