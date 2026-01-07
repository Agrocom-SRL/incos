/**
 * Provider: MateriaProvider
 * 
 * Single Responsibility: Componer hooks y proporcionar estado compartido del módulo
 * Open/Closed: Abierto para extensión agregando hooks, cerrado para modificación
 * 
 * Estrategia de Diseño:
 * - Este Provider NO contiene lógica, solo COMPONE hooks
 * - Cada hook maneja su propia feature (useMateriasList, etc.)
 * - Agregar nuevos hooks cuando se implementen nuevas features
 * 
 * Organización de Hooks:
 * - Hooks de API: useMateriasApi (llamadas al backend)
 * - Hooks de Feature: useMateriasList (lógica de UI)
 * 
 * Features actuales:
 * - Lista de materias (useMateriasList) - incluye búsqueda y filtrado
 * 
 * Features futuras (agregar cuando se implementen):
 * - Prerrequisitos: useMateriasPrerrequisitos
 * - Por carrera: useMateriasPorCarrera
 * 
 * Ejemplo de cómo agregar una nueva feature:
 * ```javascript
 * import { useMateriasPrerrequisitos } from '../hooks';
 * 
 * const prerrequisitosData = useMateriasPrerrequisitos();
 * 
 * const value = {
 *   ...listData,
 *   ...prerrequisitosData,  // Agregar aquí
 * };
 * ```
 * 
 * Ubicación: application/modules/configuracion/academico/materias/providers
 */

import { useMateriasList } from '@application-configuracion/academico/materias/hooks';
import { MateriaContext } from '@application-configuracion/academico/materias/context/MateriaContext';

export const MateriaProvider = ({ children }) => {
    // Hook para lista de materias (incluye búsqueda y filtrado)
    const listData = useMateriasList();

    // Componer el valor del contexto: spread de todos los hooks
    // Cuando se agreguen nuevas features, simplemente agregar aquí:
    // const prerrequisitosData = useMateriasPrerrequisitos();
    // const value = { ...listData, ...prerrequisitosData };
    const value = {
        ...listData,
    };

    return (
        <MateriaContext.Provider value={value}>
            {children}
        </MateriaContext.Provider>
    );
};

