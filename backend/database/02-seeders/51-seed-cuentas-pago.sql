-- ============================================
-- SEEDER: cuentas_pago
-- Sistema de Gestión Académica - Instituto INCOS
-- Configuración de datos de cuenta para métodos de pago
-- NOTA: Datos de ejemplo hasta confirmar valores reales
-- ============================================
-- Métodos:
--   - TRANSFERENCIA (metodo_pago_id = 3): requiere banco_id y numero_cuenta
--   - QR (metodo_pago_id = 2): requiere banco_id, numero_cuenta y qr_imagen_url
-- Bancos:
--   - BNB (banco_id = 1)
--   - MERCANTIL (banco_id = 2)
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE cuentas_pago;

-- ============================================
-- INSERTAR CUENTAS DE PAGO
-- IDs fijos: 1 (TRANSFERENCIA BNB), 2 (TRANSFERENCIA MERCANTIL), 3 (QR BNB)
-- ============================================

-- Cuenta 1: TRANSFERENCIA - BNB
-- Método: TRANSFERENCIA (metodo_pago_id = 3)
-- Banco: BNB (banco_id = 1)
INSERT INTO cuentas_pago (id, metodo_pago_id, banco_id, nombre_titular, numero_cuenta, activo) VALUES
(1, 3, 1, 'Instituto INCOS', '1234567890123456', TRUE);

-- Cuenta 2: TRANSFERENCIA - MERCANTIL
-- Método: TRANSFERENCIA (metodo_pago_id = 3)
-- Banco: MERCANTIL (banco_id = 2)
INSERT INTO cuentas_pago (id, metodo_pago_id, banco_id, nombre_titular, numero_cuenta, activo) VALUES
(2, 3, 2, 'Instituto INCOS', '9876543210987654', TRUE);

-- Cuenta 3: QR - BNB
-- Método: QR (metodo_pago_id = 2)
-- Banco: BNB (banco_id = 1)
INSERT INTO cuentas_pago (id, metodo_pago_id, banco_id, nombre_titular, numero_cuenta, qr_imagen_url, activo) VALUES
(3, 2, 1, 'Instituto INCOS', '1234567890123456', '/uploads/qr/codigo-qr-bnb.png', TRUE);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN DE CUENTAS
-- ============================================
-- Cuenta 1 (id=1): TRANSFERENCIA - BNB - N° 1234567890123456
-- Cuenta 2 (id=2): TRANSFERENCIA - MERCANTIL - N° 9876543210987654
-- Cuenta 3 (id=3): QR - BNB - N° 1234567890123456 - QR: /uploads/qr/codigo-qr-bnb.png
-- ============================================
-- NOTA: Los datos son de ejemplo. Actualizar con valores reales cuando se confirmen.
-- ============================================
-- FIN DEL SEEDER
-- ============================================
