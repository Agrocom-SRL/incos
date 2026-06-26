/**
 * Estado de pantalla — P1 del Centralizador: grilla de paralelos del instituto
 * en gestión vigente. Reusa el dashboard de paralelos (mismo origen que antes
 * alimentaba el Select) y lo expone como tarjetas navegables.
 *
 * La página solo compone; toda la orquestación vive aquí (incos-frontend-module §2).
 */

import { useMemo } from 'react';
import { useParalelosEstadoApi } from '@application-shared/hooks';
import { normalizarParalelosCentralizador } from '../utils/paraleloCentralizador.js';
import { createCentralizadorBreadcrumbItems } from '../utils/centralizadorBreadcrumbs.js';

export const useParalelosCentralizador = () => {
  const {
    paralelosEstadoDashboard,
    loading: isLoading,
    error,
    refetch,
  } = useParalelosEstadoApi();

  const paralelos = useMemo(
    () => normalizarParalelosCentralizador(paralelosEstadoDashboard?.paralelos),
    [paralelosEstadoDashboard],
  );

  const breadcrumbItems = useMemo(
    () => createCentralizadorBreadcrumbItems('ACA-CENTRALIZADOR', 'ACA-CENTRALIZADOR'),
    [],
  );

  return {
    paralelos,
    isLoading,
    error,
    refetch,
    breadcrumbItems,
  };
};
