/**
 * Provider: PagosRegistrarProvider
 * 
 * Single Responsibility: Proporcionar contexto de registro de pago
 * 
 * Clean Architecture:
 * - Application Layer: Provider específico para la feature de registro de pago
 * - Solo expone el contexto, toda la lógica está en usePagosRegistrarContext
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo expone datos/lógica vía Context
 * - Dependency Inversion: Depende de hooks (abstracciones)
 * 
 * Ventajas:
 * - Simplificado: Toda la lógica está en usePagosRegistrarData
 * - Testeable: Se puede testear el hook independientemente
 * - Mantenible: Separación clara entre Provider y lógica
 */

import { PagosRegistrarContext } from '../context/PagosRegistrarContext';
import { usePagosRegistrarData } from '../hooks';

export const PagosRegistrarProvider = ({ children }) => {
    const value = usePagosRegistrarData();

    return (
        <PagosRegistrarContext.Provider value={value}>
            {children}
        </PagosRegistrarContext.Provider>
    );
};
