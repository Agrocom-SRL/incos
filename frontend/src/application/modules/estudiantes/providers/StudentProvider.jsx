/**
 * Provider: StudentProvider
 * 
 * Single Responsibility: Componer hooks y proporcionar estado compartido del módulo
 * Open/Closed: Abierto para extensión agregando hooks, cerrado para modificación
 * 
 * Estrategia de Diseño:
 * - Este Provider NO contiene lógica, solo COMPONE hooks
 * - Cada hook maneja su propia feature (useEstudiantesList, useEstudiantesBecas, etc.)
 * - Agregar nuevos hooks cuando se implementen nuevas features
 * 
 * Organización de Hooks:
 * - Hooks de API: useEstudiantesApi (llamadas al backend)
 * - Hooks de Feature: useEstudiantesList, useEstudiantesBecas, etc. (lógica de UI)
 * - Hooks genéricos: useTableData (reutilizable)
 * 
 * Features actuales:
 * - Lista de estudiantes (useEstudiantesList) - incluye búsqueda y filtrado
 * 
 * Features futuras (agregar cuando se implementen):
 * - Becas: useEstudiantesBecas
 * - Licencias: useEstudiantesLicencias
 * - Documentos: useEstudiantesDocumentos
 * 
 * Ejemplo de cómo agregar una nueva feature:
 * ```javascript
 * import { useEstudiantesBecas } from '@application-estudiantes/hooks';
 * 
 * const becasData = useEstudiantesBecas();
 * 
 * const value = {
 *   ...listData,
 *   ...becasData,  // Agregar aquí
 * };
 * ```
 */

import { 
    useEstudiantesList,
    useStudentFormData,
    useStudentGeographicData,
    useStudentReferenceData,
} from '@application-estudiantes/hooks';
import { StudentContext } from '@application-estudiantes/context/StudentContext';

export const StudentProvider = ({ children }) => {
    // Hook para lista de estudiantes (incluye búsqueda y filtrado)
    const listData = useEstudiantesList();

    // Hook para datos esenciales del formulario de registro
    const formData = useStudentFormData();

    // Hook para datos geográficos condicionales (carga bajo demanda)
    const geographicData = useStudentGeographicData();

    // Hook para datos de referencia condicionales (carga bajo demanda)
    const referenceData = useStudentReferenceData();

    // Componer el valor del contexto: spread de todos los hooks
    // Cuando se agreguen nuevas features, simplemente agregar aquí:
    // const becasData = useEstudiantesBecas();
    // const value = { ...listData, ...formData, ...geographicData, ...referenceData, ...becasData };
    const value = {
        ...listData,
        ...formData,
        ...geographicData,
        ...referenceData,
    };

    return (
        <StudentContext.Provider value={value}>
            {children}
        </StudentContext.Provider>
    );
};

