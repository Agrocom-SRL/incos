/**
 * Hook de API: mutaciones de la configuración de pagos — módulo Finanzas.
 *
 * Agrupa las escrituras de las 3 secciones sobre la infraestructura compartida
 * (módulo independiente del legacy `@pagos`):
 *   - Método de pago: PUT (los 4 son fijos; solo nombre/activo).
 *   - Banco autorizado: POST (alta) / PUT (edición/toggle).
 *   - Cuenta de pago: POST/PUT con FormData (QR opcional) en el repositorio.
 *
 * El UPSERT del aporte de la gestión vigente se movió a su propia página
 * `/finanzas/aportes` (permiso `finanzas.aporte`, ver
 * `application/modules/finanzas/aportes/hooks/api/useAporteMutations.js`).
 *
 * Cada acción devuelve `{ success, data?, error? }`. Un único `saving` cubre la
 * pantalla (solo se guarda una sección a la vez).
 */

import { useCallback, useMemo, useState } from 'react';
import paymentMethodRepository from '@implementations/PaymentMethodRepository';
import authorizedBankRepository from '@implementations/AuthorizedBankRepository';
import paymentAccountRepository from '@implementations/PaymentAccountRepository';

export const useConfigPagosMutations = () => {
  const [saving, setSaving] = useState(false);

  /** Ejecuta una operación de escritura marcando el flag `saving`. */
  const ejecutar = useCallback(async (operacion) => {
    setSaving(true);
    try {
      return await operacion();
    } finally {
      setSaving(false);
    }
  }, []);

  /** PUT de un método de pago (nombre/activo). */
  const actualizarMetodoPago = useCallback(
    (id, payload) => ejecutar(() => paymentMethodRepository.actualizar(id, payload)),
    [ejecutar],
  );

  /** POST/PUT de un banco autorizado (alta o edición/toggle). */
  const guardarBanco = useCallback(
    ({ id, payload }) =>
      ejecutar(() =>
        id != null
          ? authorizedBankRepository.actualizar(id, payload)
          : authorizedBankRepository.crear(payload),
      ),
    [ejecutar],
  );

  /** POST/PUT de una cuenta de pago (FormData con QR opcional). */
  const guardarCuenta = useCallback(
    ({ id, payload }) =>
      ejecutar(() =>
        id != null
          ? paymentAccountRepository.actualizar(id, payload)
          : paymentAccountRepository.crear(payload),
      ),
    [ejecutar],
  );

  return useMemo(
    () => ({
      saving,
      actualizarMetodoPago,
      guardarBanco,
      guardarCuenta,
    }),
    [saving, actualizarMetodoPago, guardarBanco, guardarCuenta],
  );
};

export default useConfigPagosMutations;
