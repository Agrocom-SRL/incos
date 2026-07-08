/**
 * Hook de API: mutaciones del catálogo maestro Becas y descuentos — módulo
 * Finanzas. 3 operaciones (no upsert single-record como Aportes): crear,
 * actualizar y eliminar. Cada acción devuelve `{ success, data?, error? }`.
 */

import { useCallback, useMemo, useState } from 'react';
import becaDescuentoRepository from '@implementations/BecaDescuentoRepository';

export const useBecaDescuentoMutations = () => {
  const [saving, setSaving] = useState(false);

  const ejecutar = useCallback(async (operacion) => {
    setSaving(true);
    try {
      return await operacion();
    } finally {
      setSaving(false);
    }
  }, []);

  const crear = useCallback(
    (payload) => ejecutar(() => becaDescuentoRepository.crear(payload)),
    [ejecutar],
  );

  const actualizar = useCallback(
    (id, payload) => ejecutar(() => becaDescuentoRepository.actualizar(id, payload)),
    [ejecutar],
  );

  const eliminar = useCallback(
    (id) => ejecutar(() => becaDescuentoRepository.eliminar(id)),
    [ejecutar],
  );

  return useMemo(
    () => ({ saving, crear, actualizar, eliminar }),
    [saving, crear, actualizar, eliminar],
  );
};

export default useBecaDescuentoMutations;
