/**
 * Provider: InscripcionesNuevaProvider
 * 
 * Single Responsibility: Proporcionar contexto de inscripción nueva
 * 
 * Clean Architecture:
 * - Application Layer: Provider específico para la feature de inscripción nueva
 * - Solo expone el contexto, toda la lógica está en useInscripcionNuevaContext
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo expone datos/lógica vía Context
 * - Dependency Inversion: Depende de hooks (abstracciones)
 * 
 * Ventajas:
 * - Simplificado: Toda la lógica está en useInscripcionNuevaData
 * - Testeable: Se puede testear el hook independientemente
 * - Mantenible: Separación clara entre Provider y lógica
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componentes hijos
 * @param {string} props.mode - Modo de operación ('nuevo' por defecto)
 * @param {string|number|null} props.studentId - ID del estudiante para omitir paso de búsqueda (opcional)
 */

import { InscripcionesNuevaContext } from '@application-inscripciones/context/InscripcionesNuevaContext';
import { useInscripcionNuevaData } from '@application-inscripciones/hooks';

export const InscripcionesNuevaProvider = ({ children, mode = 'nuevo', studentId = null }) => {
    const value = useInscripcionNuevaData(mode, { studentId });

    return (
        <InscripcionesNuevaContext.Provider value={value}>
            {children}
        </InscripcionesNuevaContext.Provider>
    );
};
