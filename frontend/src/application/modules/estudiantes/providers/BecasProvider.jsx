/**
 * Provider: BecasProvider
 * 
 * Single Responsibility: Exponer el estado global de becas vía Context
 * 
 * Clean Architecture:
 * - Application Layer: Provider que expone estado global usando un hook dedicado
 * - NO contiene lógica, solo expone el estado vía Context
 * 
 * Ventajas:
 * - Separación de responsabilidades: la lógica está en useBecasData
 * - Estado global: todos los componentes pueden acceder a los mismos datos
 * - Actualización optimista: agregar/editar sin recargar desde BD
 * 
 * Estrategia:
 * - Usa useBecasData para gestionar el estado global
 * - Expone el estado vía BecasContext
 */

import { useBecasData } from '@application-estudiantes/hooks';
import { BecasContext } from '@application-estudiantes/context/BecasContext';

export const BecasProvider = ({ children }) => {
    // Hook dedicado para gestionar el estado global de datos
    const becasData = useBecasData();

    return (
        <BecasContext.Provider value={becasData}>
            {children}
        </BecasContext.Provider>
    );
};
