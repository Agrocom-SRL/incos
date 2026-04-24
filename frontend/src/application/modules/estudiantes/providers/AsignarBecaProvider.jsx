/**
 * Provider: AsignarBecaProvider
 * 
 * Single Responsibility: Proporcionar contexto de asignar beca
 * 
 * Clean Architecture:
 * - Application Layer: Provider específico para la feature de asignar beca
 * - Solo expone el contexto, toda la lógica está en useAsignarBecaData
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo expone datos/lógica vía Context
 * - Dependency Inversion: Depende de hooks (abstracciones)
 * 
 * Ventajas:
 * - Simplificado: Toda la lógica está en useAsignarBecaData
 * - Testeable: Se puede testear el hook independientemente
 * - Mantenible: Separación clara entre Provider y lógica
 * 
 * @param {Object} props - Props del provider
 * @param {ReactNode} props.children - Componentes hijos
 * @param {string|number} props.studentId - ID del estudiante al que se le asignará la beca
 * @param {string} props.studentName - Nombre del estudiante (opcional, para título dinámico)
 */

import { AsignarBecaContext } from '@application-estudiantes/context/AsignarBecaContext';
import { useAsignarBecaData } from '@application-estudiantes/hooks';

export const AsignarBecaProvider = ({ children, studentId, studentName, editBecaAsignada = null }) => {
    const value = useAsignarBecaData(studentId, { studentName, editBecaAsignada });

    return (
        <AsignarBecaContext.Provider value={value}>
            {children}
        </AsignarBecaContext.Provider>
    );
};
