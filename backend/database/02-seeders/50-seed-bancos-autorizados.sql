-- ============================================
-- SEEDER: bancos_autorizados
-- Sistema de Gestión Académica - Instituto INCOS
-- Bancos autorizados para métodos TRANSFERENCIA y DEPOSITO
-- Según normas bolivianas: solo bancos autorizados por ASFI
-- ============================================
-- Método TRANSFERENCIA: metodo_pago_id = 3
-- Bancos: BNB, MERCANTIL
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE bancos_autorizados;

-- ============================================
-- INSERTAR BANCOS AUTORIZADOS
-- IDs fijos: 1 (BNB), 2 (MERCANTIL)
-- Método: TRANSFERENCIA (metodo_pago_id = 3)
-- ============================================

-- Banco 1: BNB (Banco Nacional de Bolivia)
INSERT INTO bancos_autorizados (id, metodo_pago_id, codigo, nombre, activo) VALUES
(1, 3, 'BNB', 'Banco Nacional de Bolivia', TRUE);

-- Banco 2: MERCANTIL
INSERT INTO bancos_autorizados (id, metodo_pago_id, codigo, nombre, activo) VALUES
(2, 3, 'MERCANTIL', 'Banco Mercantil Santa Cruz', TRUE);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN DE BANCOS
-- ============================================
-- BNB (id=1): Banco Nacional de Bolivia - Método TRANSFERENCIA
-- MERCANTIL (id=2): Banco Mercantil Santa Cruz - Método TRANSFERENCIA
-- ============================================
-- FIN DEL SEEDER
-- ============================================
