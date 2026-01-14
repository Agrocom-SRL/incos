/**
 * Hook: useInscripcionNuevaData
 * 
 * Single Responsibility: Gestionar el estado del contexto de inscripción nueva
 * 
 * Clean Architecture:
 * - Application Layer: Hook que gestiona el estado del contexto orquestando hooks de feature
 * - Similar a useInscripcionesData pero específico para la feature "inscripción nueva"
 * 
 * Este hook:
 * - Orquesta todos los hooks de feature (pageData, formHandlers, studentSearch, carrerasData)
 * - Crea callbacks memoizados para los enrichers
 * - Compone el objeto de contexto para enriquecer wizardSteps
 * - Retorna el valor completo del contexto para el Provider
 * 
 * Ventajas:
 * - Separación de responsabilidades: Provider solo expone, hook gestiona estado
 * - Testeable: Se puede testear el hook independientemente
 * - Reutilizable: Se puede usar el hook sin el Provider si es necesario
 * - Mantenible: Toda la lógica está centralizada en un solo lugar
 * 
 * Nota: Este hook GESTIONA el estado del contexto (para el Provider).
 * Para CONSUMIR el contexto, usa useInscripcionesNuevaContext (con 's') en context/.
 */

import { useMemo, useCallback } from 'react';
import {
    useInscripcionNuevaPageData,
    useInscripcionNuevaFormHandlers,
    useInscripcionNuevaStudentSearch,
    useInscripcionNuevaCarreras,
    useInscripcionNuevaParalelos,
    useInscripcionNuevaMaterias
} from '@application-inscripciones/hooks';
import { useEnrichWizardSteps } from '@application-utils/hooks';
import { studentEnrichers } from '@application-inscripciones/hooks/features/enrichers/studentEnrichers';
import { carreraEnrichers } from '@application-inscripciones/hooks/features/enrichers/carreraEnrichers';
import { paraleloEnrichers } from '@application-inscripciones/hooks/features/enrichers/paraleloEnrichers';
import { materiaEnrichers } from '@application-inscripciones/hooks/features/enrichers/materiaEnrichers';
import { horarioEnrichers } from '@application-inscripciones/hooks/features/enrichers/horarioEnrichers';

// Combinar enrichers (referencia estable fuera del componente)
const allEnrichers = [...studentEnrichers, ...carreraEnrichers, ...paraleloEnrichers, ...materiaEnrichers, ...horarioEnrichers];

/**
 * Hook que gestiona el estado del contexto de inscripción nueva
 * 
 * @param {string} mode - Modo de operación ('nuevo' por defecto)
 * @returns {Object} Objeto con todo el contexto de inscripción nueva
 */
export const useInscripcionNuevaData = (mode = 'nuevo') => {
    // 1. Hooks de feature
    const pageData = useInscripcionNuevaPageData({ mode });
    const formHandlers = useInscripcionNuevaFormHandlers(mode);
    const studentSearch = useInscripcionNuevaStudentSearch();
    const carrerasData = useInscripcionNuevaCarreras();
    const paralelosData = useInscripcionNuevaParalelos({ 
        carreraId: carrerasData.selectedCarrera?.id 
    });
    
    // Obtener el periodoId del primer paralelo cuando hay paralelos disponibles
    // Las materias son las mismas para todos los paralelos del periodo 1, 
    // así que usamos el primer paralelo para obtener el periodoId
    const periodoIdFromFirstParalelo = useMemo(() => {
        if (paralelosData.paralelos && paralelosData.paralelos.length > 0) {
            const firstParalelo = paralelosData.paralelos[0];
            return firstParalelo?.periodoId || null;
        }
        return null;
    }, [paralelosData.paralelos]);
    
    const materiasData = useInscripcionNuevaMaterias({
        periodoId: periodoIdFromFirstParalelo
    });

    // 2. Callbacks memoizados para los enrichers
    const handleSearchStudent = useCallback((value) => {
        if (value?.trim() && studentSearch.searchStudent) {
            studentSearch.searchStudent(value.trim());
        }
    }, [studentSearch.searchStudent]);

    const handleSelectStudent = useCallback((student) => {
        if (student && studentSearch.onSelectStudent) {
            studentSearch.onSelectStudent(student);
        }
    }, [studentSearch.onSelectStudent]);

    const handleSelectCarrera = useCallback((value) => {
        const carrera = carrerasData.carreras?.find(c => c.id === value);
        if (carrera && carrerasData.onSelectCarrera) {
            carrerasData.onSelectCarrera(carrera);
        }
    }, [carrerasData.carreras, carrerasData.onSelectCarrera]);

    const handleSelectParalelo = useCallback((paralelo) => {
        if (paralelo && paralelosData.onSelectParalelo) {
            paralelosData.onSelectParalelo(paralelo);
        }
    }, [paralelosData.onSelectParalelo]);

    const handleSelectMateria = useCallback((materia) => {
        if (materia && materiasData.onSelectMateria) {
            materiasData.onSelectMateria(materia);
        }
    }, [materiasData.onSelectMateria]);

    // 3. Context para enrichers (objeto memoizado)
    const enrichContext = useMemo(() => ({
        onSearchStudent: handleSearchStudent,
        onSelectStudent: handleSelectStudent,
        onSelectCarrera: handleSelectCarrera,
        onSelectParalelo: handleSelectParalelo,
        onSelectMateria: handleSelectMateria,
        studentSearch: {
            students: studentSearch.students,
            loading: studentSearch.loading,
            error: studentSearch.error,
            selectedStudent: studentSearch.selectedStudent,
        },
        carrerasData: {
            carreras: carrerasData.carreras,
            loading: carrerasData.loading,
            error: carrerasData.error,
            selectedCarrera: carrerasData.selectedCarrera,
        },
        paralelosData: {
            paralelos: paralelosData.paralelos,
            loading: paralelosData.loading,
            error: paralelosData.error,
            selectedParalelo: paralelosData.selectedParalelo,
        },
        materiasData: {
            materias: materiasData.materias,
            loading: materiasData.loading,
            error: materiasData.error,
            selectedMateria: materiasData.selectedMateria,
        },
    }), [
        handleSearchStudent,
        handleSelectStudent,
        handleSelectCarrera,
        handleSelectParalelo,
        handleSelectMateria,
        studentSearch.students,
        studentSearch.loading,
        studentSearch.error,
        studentSearch.selectedStudent,
        carrerasData.carreras,
        carrerasData.loading,
        carrerasData.error,
        carrerasData.selectedCarrera,
        paralelosData.paralelos,
        paralelosData.loading,
        paralelosData.error,
        paralelosData.selectedParalelo,
        materiasData.materias,
        materiasData.loading,
        materiasData.error,
        materiasData.selectedMateria,
    ]);

    // 4. Enriquecer wizardSteps
    const enrichedWizardSteps = useEnrichWizardSteps(
        pageData.wizardSteps,
        allEnrichers,
        enrichContext
    );

    // 5. Componer value final del contexto
    return useMemo(() => ({
        // Datos de página
        ...pageData,
        wizardSteps: enrichedWizardSteps,

        // Handlers de formulario
        ...formHandlers,

        // Búsqueda de estudiantes
        studentSearch: {
            students: studentSearch.students,
            loading: studentSearch.loading,
            error: studentSearch.error,
            selectedStudent: studentSearch.selectedStudent,
        },

        // Carreras
        carrerasData: {
            carreras: carrerasData.carreras,
            loading: carrerasData.loading,
            error: carrerasData.error,
            selectedCarrera: carrerasData.selectedCarrera,
        },

        // Paralelos
        paralelosData: {
            paralelos: paralelosData.paralelos,
            loading: paralelosData.loading,
            error: paralelosData.error,
            selectedParalelo: paralelosData.selectedParalelo,
        },

        // Materias
        materiasData: {
            materias: materiasData.materias,
            loading: materiasData.loading,
            error: materiasData.error,
            selectedMateria: materiasData.selectedMateria,
        },
    }), [
        pageData,
        enrichedWizardSteps,
        formHandlers,
        studentSearch,
        carrerasData,
        paralelosData,
        materiasData,
    ]);
};
