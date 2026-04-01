/**
 * Provider: PagosListProvider
 *
 * Single Responsibility: Proporcionar estado de la lista de pagos (vista_pago_aporte_listado)
 *
 * - Usa usePagosApi: carga completa (limit 10000) y búsqueda en cliente vía useTableData
 * - Usa useDeletePagoAporte: eliminar y recargar lista al éxito
 * - searchText/setSearchText para el input; refetch({ params: { page, limit, search, ... } })
 */

import { useCallback, useMemo } from 'react';
import { usePagosApi, useDeletePagoAporte } from '@application-pagos/hooks';
import { PagosListContext } from '@application-pagos/context/PagosListContext';
import { useTableData } from '@molecules';

export const PagosListProvider = ({ children }) => {
    const { pagos, pagination, loading, error, refetch } = usePagosApi();
    const { deletePagoAporte, loading: deleting } = useDeletePagoAporte();

    const getSearchFields = useMemo(
        () => (pago) => {
            const estudiante = pago?.estudiante || pago?.student;
            const gestion = pago?.gestion || pago?.management;

            const gestionLabel = gestion ? (gestion.nombre || gestion.anio || String(gestion.id ?? '')) : '';
            const estudianteNombre = estudiante?.nombreCompleto || estudiante?.nombre || '';
            const estudianteCodigo = estudiante?.codigoEstudiante || '';

            // Campos que se muestran en la tabla (tableColumns.jsx) + algunos comunes del pago si existen
            return [
                gestionLabel,
                estudianteNombre,
                estudianteCodigo,
                pago?.estado ?? '',
                pago?.monto_base ?? '',
                pago?.descuento_beca ?? '',
                pago?.monto_obligatorio ?? '',
                pago?.total_pagado ?? '',
                pago?.cantidad_pagos ?? '',
                pago?.saldo_pendiente ?? '',
                pago?.numeroRecibo ?? pago?.numero_recibo ?? '',
                pago?.codigoComprobante ?? pago?.codigo_comprobante ?? '',
                pago?.fechaPago ?? pago?.fecha_pago ?? '',
            ];
        },
        []
    );

    const { searchText, setSearchText, filteredData } = useTableData(pagos, getSearchFields);

    const deletePago = useCallback(
        async (pagoId) => {
            const result = await deletePagoAporte(pagoId);
            if (result.success) refetch();
            return result;
        },
        [deletePagoAporte, refetch]
    );

    const value = useMemo(
        () => ({
            pagos: filteredData,
            pagination,
            loading: loading || deleting,
            error,
            refetch,
            deletePago,
            searchText,
            setSearchText,
        }),
        [
            filteredData,
            pagination,
            loading,
            deleting,
            error,
            refetch,
            deletePago,
            searchText,
            setSearchText,
        ]
    );

    return <PagosListContext.Provider value={value}>{children}</PagosListContext.Provider>;
};
