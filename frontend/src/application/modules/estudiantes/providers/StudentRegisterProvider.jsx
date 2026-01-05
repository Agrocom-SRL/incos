/**
 * Provider: StudentRegisterProvider
 * 
 * Single Responsibility: Proporcionar estado compartido SOLO para la feature de registro de estudiantes
 * 
 * Clean Architecture:
 * - Application Layer: Provider específico para la feature de registro
 * - Solo carga y provee los datos necesarios para el formulario de registro
 * - Maneja la lógica del formulario (resolveOptions, handlers)
 * 
 * Ventajas:
 * - Aislamiento de errores: errores en lista no afectan el registro
 * - Performance: no carga miles de estudiantes cuando solo se necesita el formulario
 * - Separación de responsabilidades: cada feature tiene su propio provider
 * 
 * Estrategia:
 * - Usa hooks de API para cargar datos (useStudentCatalogApi, etc.)
 * - Usa hook de lógica para procesar datos (useStudentRegisterLogic)
 * - Expone datos + lógica vía StudentRegisterContext
 */

import { useMemo } from 'react';
import { App } from 'antd';
import { 
    useStudentCatalogApi,
    useStudentGeographicApi,
    useStudentReferenceApi,
    useStudentRegisterLogic,
} from '@application-estudiantes/hooks';
import { StudentRegisterContext } from '@application-estudiantes/context/StudentRegisterContext';

export const StudentRegisterProvider = ({ children }) => {
    const { message } = App.useApp();

    // Hook para catálogos esenciales del formulario de registro
    const catalogData = useStudentCatalogApi();

    // Hook para datos geográficos condicionales (carga bajo demanda)
    const geographicData = useStudentGeographicApi();

    // Hook para datos de referencia condicionales (carga bajo demanda)
    const referenceData = useStudentReferenceApi();

    // Componer todos los datos del contexto
    const contextData = useMemo(() => ({
        ...catalogData,
        ...geographicData,
        ...referenceData,
    }), [catalogData, geographicData, referenceData]);

    // TODO: Implementar onSubmit y onSuccess en hooks de API o use cases
    // Por ahora se dejan como undefined, se implementarán cuando se cree el use case de registro
    const onSubmit = undefined;
    const onSuccess = undefined;

    // Función para mostrar mensajes (wrapper para message de Ant Design)
    const showMessage = useMemo(() => {
        return (type, content) => {
            if (type === 'success') {
                message.success(content);
            } else if (type === 'error') {
                message.error(content);
            }
        };
    }, [message]);

    // Hook de lógica para procesar datos y handlers
    const registerLogic = useStudentRegisterLogic(contextData, onSubmit, onSuccess, showMessage);

    // Componer el valor del contexto: datos + lógica
    const value = useMemo(() => ({
        ...contextData,
        ...registerLogic,
    }), [contextData, registerLogic]);

    return (
        <StudentRegisterContext.Provider value={value}>
            {children}
        </StudentRegisterContext.Provider>
    );
};

