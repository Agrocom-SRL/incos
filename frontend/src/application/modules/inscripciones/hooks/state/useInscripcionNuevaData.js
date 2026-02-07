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
    useInscripcionNuevaPeriodos,
    useInscripcionNuevaParalelos,
    useInscripcionNuevaParaleloHorarios,
    useInscripcionNuevaMaterias
} from '@application-inscripciones/hooks';
import { useEnrichWizardSteps } from '@application-utils/hooks';
import { studentEnrichers, buildStep0StudentDescription } from '@application-inscripciones/hooks/features/enrichers/studentEnrichers';
import { periodoEnrichers } from '@application-inscripciones/hooks/features/enrichers/periodoEnrichers';
import { carreraEnrichers } from '@application-inscripciones/hooks/features/enrichers/carreraEnrichers';
import { paraleloEnrichers } from '@application-inscripciones/hooks/features/enrichers/paraleloEnrichers';
import { materiaEnrichers } from '@application-inscripciones/hooks/features/enrichers/materiaEnrichers';
import { horarioEnrichers } from '@application-inscripciones/hooks/features/enrichers/horarioEnrichers';

const allEnrichers = [...studentEnrichers, ...periodoEnrichers, ...carreraEnrichers, ...paraleloEnrichers, ...materiaEnrichers, ...horarioEnrichers];

/**
 * Estrategia de enriquecimiento para step 0: cuando hay estudiante pre-seleccionado
 * (p. ej. desde detalle de estudiante), mostrar solo los datos del estudiante en lugar del buscador.
 */
const step0EnrichmentStrategy = (step, stepIndex, _enrichers, context) => {
    const selectedStudent = context?.studentSearch?.selectedStudent;
    if (stepIndex !== 0 || !selectedStudent?.id) return null;
    const carreraNombre = selectedStudent.carreraNombre
        || context?.carrerasData?.carreras?.find((c) => c.id === selectedStudent.careerId)?.nombre;
    const description = buildStep0StudentDescription({ ...selectedStudent, carreraNombre });
    return {
        ...step,
        title: 'Estudiante a inscribir',
        config: {
            buscarEstudiante: {
                title: 'Estudiante a inscribir',
                fields: [
                    {
                        name: 'estudianteSeleccionado',
                        type: 'alert',
                        label: '',
                        message: 'Estudiante a inscribir',
                        description,
                        alertType: 'success',
                        span: 24,
                        required: false,
                    },
                ],
            },
        },
    };
};

/**
 * Hook que gestiona el estado del contexto de inscripción nueva
 * 
 * @param {string} mode - Modo de operación ('nuevo' por defecto)
 * @param {Object} options - Opciones adicionales
 * @param {string|number|null} options.studentId - ID del estudiante para omitir paso de búsqueda (opcional)
 * @param {Object|null} options.editData - Datos de edición (inscripcionId, carreraId, periodoId, paraleloId) (opcional)
 * @returns {Object} Objeto con todo el contexto de inscripción nueva
 */
export const useInscripcionNuevaData = (mode = 'nuevo', options = {}) => {
    const { studentId = null, editData = null } = options;
    
    // 1. Hooks de feature
    const pageData = useInscripcionNuevaPageData({ mode });
    const studentSearch = useInscripcionNuevaStudentSearch({ studentId: studentId || editData?.studentId });
    const carrerasData = useInscripcionNuevaCarreras({ initialCarreraId: editData?.carreraId });
    
    // Determinar carreraId para filtrar paralelos:
    // 1. Prioridad: carrera de edición (editData.carreraId)
    // 2. Segunda prioridad: carrera del estudiante si tiene datos académicos (carreraId del estudiante)
    // 3. Tercera opción: carrera seleccionada manualmente (carrerasData.selectedCarrera?.id)
    // Esto asegura que se muestren solo paralelos de la carrera correcta del estudiante
    const carreraIdForParalelos = useMemo(() => {
        // Si hay datos de edición, usar la carrera de edición
        if (editData?.carreraId) {
            return editData.carreraId;
        }
        // Si el estudiante tiene datos académicos con carrera, usar esa carrera
        const studentCareerId = studentSearch.selectedStudent?.careerId || studentSearch.selectedStudent?.carreraId;
        if (studentCareerId) {
            return studentCareerId;
        }
        // Si no, usar la carrera seleccionada manualmente
        return carrerasData.selectedCarrera?.id;
    }, [editData?.carreraId, studentSearch.selectedStudent, carrerasData.selectedCarrera]);
    
    // Periodos: según tipo admisión (NUEVO = solo primer periodo; ANTIGUO = todos). Lista extraída de paralelos.
    const tipoAdmision = studentSearch?.selectedStudent?.tipoAdmision ?? null;
    const periodosData = useInscripcionNuevaPeriodos({
      carreraId: carreraIdForParalelos ?? undefined,
      tipoAdmision: tipoAdmision ?? undefined,
    });
    const selectedPeriod = periodosData.selectedPeriod;

    const paralelosData = useInscripcionNuevaParalelos({
        carreraId: carreraIdForParalelos,
        periodoId: selectedPeriod?.id,
        initialParaleloId: editData?.paraleloId,
    });

    const formHandlers = useInscripcionNuevaFormHandlers(mode, {
        selectedStudent: studentSearch.selectedStudent,
        selectedParalelo: paralelosData.selectedParalelo,
        selectedPeriod,
    });

    const materiasData = useInscripcionNuevaMaterias({
        periodoId: selectedPeriod?.id,
    });

    // Hook para cargar horarios del paralelo seleccionado
    const horariosData = useInscripcionNuevaParaleloHorarios({
        parallelId: paralelosData.selectedParalelo?.id
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

    const handleSelectPeriod = useCallback((value) => {
        const period = periodosData.periodos?.find((p) => p.id === value || p.id === Number(value));
        if (period && periodosData.onSelectPeriod) {
            periodosData.onSelectPeriod(period);
        }
    }, [periodosData.periodos, periodosData.onSelectPeriod]);

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
        onSelectPeriod: handleSelectPeriod,
        onSelectCarrera: handleSelectCarrera,
        onSelectParalelo: handleSelectParalelo,
        onSelectMateria: handleSelectMateria,
        carreraIdForParalelos: carreraIdForParalelos ?? null,
        periodosData: {
            periodos: periodosData.periodos,
            loading: periodosData.loading,
            error: periodosData.error,
            selectedPeriod: periodosData.selectedPeriod,
        },
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
        horariosData: {
            schedule: horariosData.schedule,
            loading: horariosData.loading,
            error: horariosData.error,
        },
    }), [
        handleSearchStudent,
        handleSelectStudent,
        handleSelectPeriod,
        handleSelectCarrera,
        handleSelectParalelo,
        handleSelectMateria,
        carreraIdForParalelos,
        periodosData.periodos,
        periodosData.loading,
        periodosData.error,
        periodosData.selectedPeriod,
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
        horariosData.schedule,
        horariosData.loading,
        horariosData.error,
    ]);

    // 4. Enriquecer wizardSteps (step 0: buscador o datos del estudiante si viene pre-seleccionado)
    const enrichedWizardSteps = useEnrichWizardSteps(
        pageData.wizardSteps,
        allEnrichers,
        enrichContext,
        step0EnrichmentStrategy
    );

    // 5. Componer value final del contexto
    return useMemo(() => ({
        // Datos de página
        ...pageData,
        wizardSteps: enrichedWizardSteps,

        // Handlers de formulario
        ...formHandlers,

        // Callback para step 1 carrera (CarreraSelectionSection)
        onSelectCarrera: handleSelectCarrera,

        // Periodos (selección de periodo académico)
        periodosData: {
            periodos: periodosData.periodos,
            loading: periodosData.loading,
            error: periodosData.error,
            selectedPeriod: periodosData.selectedPeriod,
        },

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

        // Horarios
        horariosData: {
            schedule: horariosData.schedule,
            loading: horariosData.loading,
            error: horariosData.error,
        },
    }), [
        pageData,
        enrichedWizardSteps,
        formHandlers,
        handleSelectCarrera,
        periodosData,
        studentSearch,
        carrerasData,
        paralelosData,
        materiasData,
        horariosData,
    ]);
};
