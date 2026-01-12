/**
 * Provider: InscripcionesProvider
 * 
 * Single Responsibility: Exponer el estado global de inscripciones vía Context
 * 
 * Clean Architecture:
 * - Application Layer: Provider que expone estado global usando un hook dedicado
 * - NO contiene lógica, solo expone el estado vía Context
 * 
 * Ventajas:
 * - Separación de responsabilidades: la lógica está en useInscripcionesData
 * - Estado global: todos los componentes pueden acceder a los mismos datos
 * - Actualización optimista: agregar/editar sin recargar desde BD
 * 
 * Estrategia:
 * - Usa useInscripcionesData para gestionar el estado global
 * - Expone el estado vía InscripcionesContext
 */

import { useInscripcionesData } from '@application-inscripciones/hooks';
import { InscripcionesContext } from '@application-inscripciones/context/InscripcionesContext';

export const InscripcionesProvider = ({ children }) => {
    // Hook dedicado para gestionar el estado global de datos
    const inscripcionesData = useInscripcionesData();

    return (
        <InscripcionesContext.Provider value={inscripcionesData}>
            {children}
        </InscripcionesContext.Provider>
    );
};
