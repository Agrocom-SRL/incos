/**
 * Hook de API: mutaciones de la configuración de pagos — módulo Finanzas.
 *
 * Agrupa las escrituras de las 4 secciones sobre la infraestructura compartida
 * (módulo independiente del legacy `@pagos`):
 *   - Aporte (UPSERT): si NO existe configuración para la gestión vigente → POST;
 *     si existe → PUT por id. La decisión la toma `guardarConfiguracionAporte`
 *     según el `id` recibido.
 *   - Método de pago: PUT (los 4 son fijos; solo nombre/activo).
 *   - Banco autorizado: POST (alta) / PUT (edición/toggle).
 *   - Cuenta de pago: POST/PUT con FormData (QR opcional) en el repositorio.
 *
 * Cada acción devuelve `{ success, data?, error? }`. Un único `saving` cubre la
 * pantalla (solo se guarda una sección a la vez).
 */

import { useCallback, useMemo, useState } from 'react';
import contributionConfigurationRepository from '@implementations/ContributionConfigurationRepository';
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

  /**
   * UPSERT de la configuración de aporte de la gestión vigente.
   * @param {Object} args
   * @param {number|null} [args.id] - Si viene → PUT; si es null → POST.
   * @param {Object} args.payload - Cuerpo (snake_case) ya construido por el state.
   */
  const guardarConfiguracionAporte = useCallback(
    ({ id, payload }) =>
      ejecutar(() =>
        id != null
          ? contributionConfigurationRepository.actualizar(id, payload)
          : contributionConfigurationRepository.crear(payload),
      ),
    [ejecutar],
  );

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
      guardarConfiguracionAporte,
      actualizarMetodoPago,
      guardarBanco,
      guardarCuenta,
    }),
    [saving, guardarConfiguracionAporte, actualizarMetodoPago, guardarBanco, guardarCuenta],
  );
};

export default useConfigPagosMutations;
