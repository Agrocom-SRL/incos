/**
 * Provider: DiscapacidadProvider
 * 
 * Single Responsibility: Componer hooks y proporcionar estado compartido del módulo
 * Open/Closed: Abierto para extensión agregando hooks, cerrado para modificación
 * 
 * Estrategia de Diseño:
 * - Este Provider NO contiene lógica, solo COMPONE hooks
 * - Cada hook maneja su propia feature (useDiscapacidadesList, etc.)
 * - Agregar nuevos hooks cuando se implementen nuevas features
 * 
 * Organización de Hooks:
 * - Hooks de API: useDiscapacidadesApi (llamadas al backend)
 * - Hooks de Feature: useDiscapacidadesList (lógica de UI)
 * 
 * Features actuales:
 * - Lista de discapacidades (useDiscapacidadesList) - incluye búsqueda y filtrado
 * 
 * Ubicación: application/modules/configuracion/complementario/discapacidad/providers
 */

import { useDiscapacidadesList } from '../hooks';
import { DiscapacidadContext } from '../context/DiscapacidadContext';

export const DiscapacidadProvider = ({ children }) => {
    // Hook para lista de discapacidades (incluye búsqueda y filtrado)
    const listData = useDiscapacidadesList();

    // Componer el valor del contexto: spread de todos los hooks
    const value = {
        ...listData,
    };

    return (
        <DiscapacidadContext.Provider value={value}>
            {children}
        </DiscapacidadContext.Provider>
    );
};

