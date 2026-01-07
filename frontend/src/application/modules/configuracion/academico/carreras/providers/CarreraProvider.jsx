/**
 * Provider: CarreraProvider
 * 
 * Single Responsibility: Componer hooks y proporcionar estado compartido del módulo
 * Open/Closed: Abierto para extensión agregando hooks, cerrado para modificación
 * 
 * Estrategia de Diseño:
 * - Este Provider NO contiene lógica, solo COMPONE hooks
 * - Cada hook maneja su propia feature (useCarrerasList, etc.)
 * - Agregar nuevos hooks cuando se implementen nuevas features
 * 
 * Organización de Hooks:
 * - Hooks de API: useCarrerasApi (llamadas al backend)
 * - Hooks de Feature: useCarrerasList (lógica de UI)
 * 
 * Features actuales:
 * - Lista de carreras (useCarrerasList) - incluye búsqueda y filtrado
 * 
 * Features futuras (agregar cuando se implementen):
 * - Plan de estudios: useCarrerasPlanEstudios
 * - Periodos: useCarrerasPeriodos
 * 
 * Ejemplo de cómo agregar una nueva feature:
 * ```javascript
 * import { useCarrerasPlanEstudios } from '../hooks';
 * 
 * const planEstudiosData = useCarrerasPlanEstudios();
 * 
 * const value = {
 *   ...listData,
 *   ...planEstudiosData,  // Agregar aquí
 * };
 * ```
 * 
 * Ubicación: application/modules/configuracion/academico/carreras/providers
 */

import { useCarrerasList } from '@application-configuracion/academico/carreras/hooks';
import { CarreraContext } from '@application-configuracion/academico/carreras/context/CarreraContext';

export const CarreraProvider = ({ children }) => {
    // Hook para lista de carreras (incluye búsqueda y filtrado)
    const listData = useCarrerasList();

    // Componer el valor del contexto: spread de todos los hooks
    // Cuando se agreguen nuevas features, simplemente agregar aquí:
    // const planEstudiosData = useCarrerasPlanEstudios();
    // const value = { ...listData, ...planEstudiosData };
    const value = {
        ...listData,
    };

    return (
        <CarreraContext.Provider value={value}>
            {children}
        </CarreraContext.Provider>
    );
};

