/**
 * Provider: PagosProvider
 * 
 * Single Responsibility: Exponer el estado global de pagos vía Context
 * 
 * Clean Architecture:
 * - Application Layer: Provider que expone estado global usando un hook dedicado
 * - NO contiene lógica, solo expone el estado vía Context
 * 
 * Ventajas:
 * - Separación de responsabilidades: la lógica está en usePagosData
 * - Estado global: todos los componentes pueden acceder a los mismos datos
 * - Actualización optimista: agregar/editar sin recargar desde BD
 * 
 * Estrategia:
 * - Usa usePagosData para gestionar el estado global
 * - Expone el estado vía PagosContext
 */

import { usePagosData } from '../hooks';
import { PagosContext } from '../context/PagosContext';

export const PagosProvider = ({ children }) => {
    // Hook dedicado para gestionar el estado global de datos
    const pagosData = usePagosData();

    return (
        <PagosContext.Provider value={pagosData}>
            {children}
        </PagosContext.Provider>
    );
};
