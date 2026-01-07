/**
 * Hook: useStudentData
 * 
 * Single Responsibility: Gestionar el estado global de datos de estudiantes en memoria
 * 
 * Clean Architecture:
 * - Application Layer: Maneja estado global para optimización de performance
 * - Proporciona datos y métodos para CRUD en memoria
 * 
 * Este hook:
 * - Carga inicial desde BD usando useEstudiantesApi
 * - Mantiene estado en memoria (actualización optimista)
 * - Proporciona métodos para CRUD en memoria (addStudent, updateStudent, removeStudent)
 * - Permite sincronización con BD (refetch)
 * 
 * Usado por: StudentProvider (para exponer el estado global vía Context)
 */

import { useState, useEffect, useCallback } from 'react';
import { useEstudiantesApi } from '@application-estudiantes/hooks/api/useEstudiantesApi';

export const useStudentData = () => {
    // Hook para cargar datos iniciales desde BD
    const { estudiantes: estudiantesFromApi, loading, error, refetch: refetchFromApi } = useEstudiantesApi();
    
    // Estado local en memoria (puede ser actualizado sin recargar desde BD)
    const [estudiantes, setEstudiantes] = useState([]);

    // Sincronizar estado local con datos de API cuando cambien
    // Esto cubre: carga inicial y refetch explícito
    useEffect(() => {
        // Actualizar cuando hay datos de la API (carga inicial o refetch)
        if (estudiantesFromApi.length >= 0) {
            setEstudiantes(estudiantesFromApi);
        }
    }, [estudiantesFromApi]);

    /**
     * Agrega un nuevo estudiante al estado en memoria
     * Útil cuando se crea un estudiante y queremos actualizar la lista sin recargar
     */
    const addStudent = useCallback((newStudent) => {
        setEstudiantes((prev) => {
            // Evitar duplicados por ID
            const exists = prev.some(est => est.id === newStudent.id);
            if (exists) {
                return prev;
            }
            // Agregar al inicio de la lista (más reciente primero)
            return [newStudent, ...prev];
        });
    }, []);

    /**
     * Actualiza un estudiante existente en el estado en memoria
     * Útil cuando se edita un estudiante
     */
    const updateStudent = useCallback((updatedStudent) => {
        setEstudiantes((prev) => 
            prev.map(est => 
                est.id === updatedStudent.id ? updatedStudent : est
            )
        );
    }, []);

    /**
     * Elimina un estudiante del estado en memoria
     */
    const removeStudent = useCallback((studentId) => {
        setEstudiantes((prev) => prev.filter(est => est.id !== studentId));
    }, []);

    /**
     * Sincroniza el estado local con la BD (recarga desde BD)
     * Útil cuando se necesita asegurar que los datos están actualizados
     */
    const refetch = useCallback(async (options = {}) => {
        await refetchFromApi(options);
    }, [refetchFromApi]);

    return {
        // Datos
        estudiantes,
        loading,
        error,
        
        // Métodos para CRUD en memoria
        addStudent,
        updateStudent,
        removeStudent,
        
        // Método para sincronizar con BD
        refetch,
    };
};

