/**
 * Hook de API: catálogos de pago (métodos, cuentas, bancos) — módulo Finanzas.
 *
 * Módulo independiente del legacy `@pagos`: consume directamente la INFRAESTRUCTURA
 * compartida — `PaymentMethodRepository`, `PaymentAccountRepository`,
 * `AuthorizedBankRepository`. Carga los tres catálogos al montar (lectura transparente
 * habilitada por `sistema.catalogo.referencia` en backend) y los normaliza a un DTO
 * estable para el formulario de registro.
 *
 * `dataKey` (front) coincide con `dataFieldName` (back): metodosPago, cuentasPago, etc.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import paymentMethodRepository from '@implementations/PaymentMethodRepository';
import paymentAccountRepository from '@implementations/PaymentAccountRepository';
import authorizedBankRepository from '@implementations/AuthorizedBankRepository';
import {
  mapMetodoPago,
  mapCuentaPago,
  mapBancoAutorizado,
} from '@application-finanzas/mappers/pagosRegistrarMapper';

/** Límite alto: el universo de catálogos es pequeño y se filtra en cliente. */
const CATALOG_PARAMS = { params: { pagina: 1, limite: 200 } };

export const usePaymentCatalogsApi = () => {
  const [metodosPago, setMetodosPago] = useState([]);
  const [cuentasPago, setCuentasPago] = useState([]);
  const [bancos, setBancos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [metodosRes, cuentasRes, bancosRes] = await Promise.all([
      paymentMethodRepository.obtenerTodos(CATALOG_PARAMS),
      paymentAccountRepository.obtenerTodos(CATALOG_PARAMS),
      authorizedBankRepository.obtenerTodos(CATALOG_PARAMS),
    ]);

    if (!metodosRes?.success) {
      setError(metodosRes?.error || 'No se pudieron cargar los métodos de pago');
      setLoading(false);
      return;
    }

    const bancosList = bancosRes?.success && Array.isArray(bancosRes.data)
      ? bancosRes.data.map(mapBancoAutorizado).filter(Boolean)
      : [];
    const bancosMap = bancosList.reduce((acc, banco) => {
      acc[banco.id] = banco;
      return acc;
    }, {});

    const cuentasList = cuentasRes?.success && Array.isArray(cuentasRes.data)
      ? cuentasRes.data.map((cuenta) => mapCuentaPago(cuenta, bancosMap)).filter(Boolean)
      : [];

    setMetodosPago(Array.isArray(metodosRes.data) ? metodosRes.data.map(mapMetodoPago).filter(Boolean) : []);
    setCuentasPago(cuentasList);
    setBancos(bancosList);
    setLoading(false);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return useMemo(
    () => ({ metodosPago, cuentasPago, bancos, loading, error, refetch: cargar }),
    [metodosPago, cuentasPago, bancos, loading, error, cargar],
  );
};
