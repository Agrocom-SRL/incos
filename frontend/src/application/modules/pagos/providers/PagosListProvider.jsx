/**
 * Provider: PagosListProvider
 * 
 * Single Responsibility: Proporcionar estado compartido SOLO para la feature de lista de pagos
 * 
 * Clean Architecture:
 * - Application Layer: Provider específico para la feature de listado
 * - Usa datos compartidos de PagosProvider (estado en memoria)
 * - Solo maneja lógica de UI (búsqueda, filtrado, formateo)
 * 
 * Ventajas:
 * - Aislamiento de errores: errores en registro no afectan la lista
 * - Performance: usa estado compartido en memoria (no recarga desde BD)
 * - Separación de responsabilidades: datos compartidos, UI específica
 */

import { useMemo } from 'react';
import { usePagosContext } from '@application-pagos/hooks';
import { useTableData } from '@molecules';
import { PagosListContext } from '@application-pagos/context/PagosListContext';

export const PagosListProvider = ({ children }) => {
    const { pagos: pagosData, loading, error, refetch, deletePago } = usePagosContext();

    const getSearchFields = useMemo(
        () => (pago) => {
            const student = pago.estudiante || pago.student;
            return [
                student?.nombreCompleto || student?.nombre || '',
                pago.numeroRecibo || pago.receipt_number || '',
                pago.codigo_comprobante || pago.codigoComprobante || '',
                pago.metodoPago?.nombre || pago.metodoPago || '',
                pago.montoTotal?.toString() || pago.total_amount?.toString() || '',
            ];
        },
        []
    );

    const { searchText, setSearchText, filteredData } = useTableData(
        pagosData,
        getSearchFields
    );

    const value = {
        pagos: filteredData,
        loading,
        error,
        refetch,
        deletePago,
        searchText,
        setSearchText,
    };

    return (
        <PagosListContext.Provider value={value}>
            {children}
        </PagosListContext.Provider>
    );
};
