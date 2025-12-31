/**
 * Provider: StudentRegisterProvider
 * 
 * Single Responsibility: Proporcionar estado compartido SOLO para la feature de registro de estudiantes
 * 
 * Clean Architecture:
 * - Application Layer: Provider específico para la feature de registro
 * - Solo carga y provee los datos necesarios para el formulario de registro
 * 
 * Ventajas:
 * - Aislamiento de errores: errores en lista no afectan el registro
 * - Performance: no carga miles de estudiantes cuando solo se necesita el formulario
 * - Separación de responsabilidades: cada feature tiene su propio provider
 */

import { 
    useStudentCatalogApi,
    useStudentGeographicApi,
    useStudentReferenceApi,
} from '@application-estudiantes/hooks';
import { StudentRegisterContext } from '@application-estudiantes/context/StudentRegisterContext';

export const StudentRegisterProvider = ({ children }) => {
    // Hook para catálogos esenciales del formulario de registro
    const catalogData = useStudentCatalogApi();

    // Hook para datos geográficos condicionales (carga bajo demanda)
    const geographicData = useStudentGeographicApi();

    // Hook para datos de referencia condicionales (carga bajo demanda)
    const referenceData = useStudentReferenceApi();

    // Componer el valor del contexto: spread de todos los hooks relacionados con registro
    const value = {
        ...catalogData,
        ...geographicData,
        ...referenceData,
    };

    return (
        <StudentRegisterContext.Provider value={value}>
            {children}
        </StudentRegisterContext.Provider>
    );
};

