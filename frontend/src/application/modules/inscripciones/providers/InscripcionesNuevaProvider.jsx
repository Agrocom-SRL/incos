/**
 * Provider: InscripcionesNuevaProvider
 * 
 * Single Responsibility: Proporcionar estado compartido SOLO para la feature de inscripción de estudiantes nuevos
 * 
 * Clean Architecture:
 * - Application Layer: Provider específico para la feature de inscripción nueva
 * - Solo carga y provee los datos necesarios para el formulario de inscripción
 * - Compone hooks especializados para exponer lógica del formulario
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo compone y expone datos/lógica vía Context
 * - Dependency Inversion: Depende de hooks (abstracciones)
 * - Interface Segregation: Expone solo lo necesario para el formulario de inscripción
 * 
 * Ventajas:
 * - Aislamiento de errores: errores en otras features no afectan la inscripción
 * - Performance: no carga datos innecesarios
 * - Separación de responsabilidades: cada feature tiene su propio provider
 * - Hooks especializados: mejor testabilidad y mantenibilidad
 * 
 * Estrategia:
 * - Usa hooks de API para cargar datos (se implementarán en pasos siguientes)
 * - Usa hooks especializados para lógica (se implementarán en pasos siguientes)
 * - Expone datos + lógica vía InscripcionesNuevaContext
 * 
 * Nota: Esta es una versión base que se irá completando por pasos
 */

import { useMemo, useCallback, useRef } from 'react';
import { InscripcionesNuevaContext } from '@application-inscripciones/context/InscripcionesNuevaContext';
import {
    useInscripcionNuevaPageData,
    useInscripcionNuevaFormHandlers,
    useInscripcionNuevaStudentSearch,
    useInscripcionNuevaCarreras
} from '@application-inscripciones/hooks';
import { useEnrichWizardSteps } from '@application-utils/hooks';
import { studentEnrichers } from '@application-inscripciones/hooks/features/enrichers/studentEnrichers';
import { carreraEnrichers } from '@application-inscripciones/hooks/features/enrichers/carreraEnrichers';

/**
 * Compara dos arrays por contenido (IDs) para evitar recálculos innecesarios
 * Solo compara los IDs de los objetos, no todo el contenido
 * 
 * @param {Array} prevArray - Array anterior
 * @param {Array} nextArray - Array nuevo
 * @returns {boolean} true si los arrays tienen los mismos IDs (en el mismo orden)
 */
const areArraysEqualByIds = (prevArray, nextArray) => {
    if (!prevArray && !nextArray) return true;
    if (!prevArray || !nextArray) return false;
    if (prevArray.length !== nextArray.length) return false;
    
    // Si las referencias son iguales, son el mismo array
    if (prevArray === nextArray) return true;
    
    // Comparar IDs (más eficiente que comparar objetos completos)
    return prevArray.every((item, index) => {
        const nextItem = nextArray[index];
        return item?.id === nextItem?.id;
    });
};

// Flag para activar/desactivar logs de renderizado (solo desarrollo)
const ENABLE_RENDER_LOGS = import.meta.env.DEV && true; // Cambiar a true para activar logs

// Combinar todos los enrichers fuera del componente (referencia estable)
// Esto evita recrear el array en cada render
const allEnrichers = [...studentEnrichers, ...carreraEnrichers];

export const InscripcionesNuevaProvider = ({ children, mode = 'nuevo' }) => {
    if (ENABLE_RENDER_LOGS) {
        console.log('🔄 [Provider] InscripcionesNuevaProvider - RENDER', {
            mode,
            childrenType: typeof children,
            timestamp: new Date().toISOString(),
        });
    }

    // Hook feature: maneja toda la lógica específica de la página (título, breadcrumbs, wizardSteps, etc.)
    const pageData = useInscripcionNuevaPageData({ mode });

    // Hook especializado: manejar handlers de submit y gestión del formulario
    // El hook usa useMessage() internamente, no necesita pasarlo como parámetro
    const formHandlers = useInscripcionNuevaFormHandlers(mode);

    // Hook de búsqueda de estudiantes: encapsula la dependencia del módulo de estudiantes
    const studentSearch = useInscripcionNuevaStudentSearch();

    // Hook de carreras: encapsula la dependencia del módulo de carreras
    const carrerasData = useInscripcionNuevaCarreras();

    // Memoizar callbacks específicos para los enrichers
    // Esto evita que los enrichers creen nuevas funciones en cada render
    // Los enrichers reciben estas funciones estables y las usan directamente
    const handleSearchStudent = useCallback((value) => {
        if (value && value.trim() && studentSearch.searchStudent) {
            studentSearch.searchStudent(value.trim());
        }
    }, [studentSearch.searchStudent]);

    // Refs para rastrear si handleSelectStudent se está recreando
    const prevHandleSelectStudentRef = useRef(null);
    
    const handleSelectStudent = useCallback((student) => {
        if (student && studentSearch.onSelectStudent) {
            studentSearch.onSelectStudent(student);
        }
    }, [studentSearch.onSelectStudent]);
    
    // Log para detectar si handleSelectStudent se está recreando
    if (ENABLE_RENDER_LOGS) {
        if (prevHandleSelectStudentRef.current !== handleSelectStudent) {
            if (prevHandleSelectStudentRef.current !== null) {
                console.log('🟡 [Provider] handleSelectStudent - RECREANDO callback', {
                    prevOnSelectStudentRef: prevHandleSelectStudentRef.current ? 'exists' : 'null',
                    currentOnSelectStudentRef: handleSelectStudent ? 'exists' : 'null',
                    studentSearchOnSelectStudentRef: studentSearch.onSelectStudent ? 'exists' : 'null',
                });
            }
            prevHandleSelectStudentRef.current = handleSelectStudent;
        }
    }

    // Memoizar la lista de carreras para evitar recrear el callback cuando cambia la referencia del array
    const carrerasList = useMemo(() => carrerasData.carreras || [], [carrerasData.carreras]);
    
    const handleSelectCarrera = useCallback((value) => {
        if (value && carrerasList.length > 0 && carrerasData.onSelectCarrera) {
            const carreraSeleccionada = carrerasList.find(c => c.id === value);
            if (carreraSeleccionada) {
                carrerasData.onSelectCarrera(carreraSeleccionada);
            }
        }
    }, [carrerasList, carrerasData.onSelectCarrera]);

    // Refs para almacenar los valores anteriores y comparar por contenido
    const prevStudentSearchRef = useRef(null);
    const prevCarrerasDataRef = useRef(null);

    // Memoizar los objetos de datos comparando por contenido, no solo por referencia
    // Esto evita recálculos cuando el array cambia de referencia pero tiene el mismo contenido
    const memoizedStudentSearch = useMemo(() => {
        const current = {
            students: studentSearch.students,
            loading: studentSearch.loading,
            error: studentSearch.error,
            selectedStudent: studentSearch.selectedStudent,
        };

        // Comparar con el valor anterior
        const prev = prevStudentSearchRef.current;
        if (prev && 
            prev.loading === current.loading &&
            prev.error === current.error &&
            prev.selectedStudent?.id === current.selectedStudent?.id &&
            areArraysEqualByIds(prev.students, current.students)) {
            // Si los datos son iguales, retornar la referencia anterior
            if (ENABLE_RENDER_LOGS) {
                console.log('🔄 [Provider] memoizedStudentSearch - MANTENIENDO referencia (datos iguales)');
            }
            return prev;
        }

        // Si los datos cambiaron, actualizar la ref y retornar el nuevo objeto
        if (ENABLE_RENDER_LOGS) {
            console.log('🔄 [Provider] memoizedStudentSearch - RECREANDO (datos cambiaron)', {
                loadingChanged: prev?.loading !== current.loading,
                errorChanged: prev?.error !== current.error,
                selectedStudentChanged: prev?.selectedStudent?.id !== current.selectedStudent?.id,
                studentsChanged: !areArraysEqualByIds(prev?.students, current.students),
            });
        }
        prevStudentSearchRef.current = current;
        return current;
    }, [
        studentSearch.students,
        studentSearch.loading,
        studentSearch.error,
        studentSearch.selectedStudent,
    ]);

    const memoizedCarrerasData = useMemo(() => {
        const current = {
            carreras: carrerasData.carreras,
            loading: carrerasData.loading,
            error: carrerasData.error,
            selectedCarrera: carrerasData.selectedCarrera,
        };

        // Comparar con el valor anterior
        const prev = prevCarrerasDataRef.current;
        if (prev && 
            prev.loading === current.loading &&
            prev.error === current.error &&
            prev.selectedCarrera?.id === current.selectedCarrera?.id &&
            areArraysEqualByIds(prev.carreras, current.carreras)) {
            // Si los datos son iguales, retornar la referencia anterior
            if (ENABLE_RENDER_LOGS) {
                console.log('🔄 [Provider] memoizedCarrerasData - MANTENIENDO referencia (datos iguales)');
            }
            return prev;
        }

        // Si los datos cambiaron, actualizar la ref y retornar el nuevo objeto
        if (ENABLE_RENDER_LOGS) {
            console.log('🔄 [Provider] memoizedCarrerasData - RECREANDO (datos cambiaron)', {
                loadingChanged: prev?.loading !== current.loading,
                errorChanged: prev?.error !== current.error,
                selectedCarreraChanged: prev?.selectedCarrera?.id !== current.selectedCarrera?.id,
                carrerasChanged: !areArraysEqualByIds(prev?.carreras, current.carreras),
            });
        }
        prevCarrerasDataRef.current = current;
        return current;
    }, [
        carrerasData.carreras,
        carrerasData.loading,
        carrerasData.error,
        carrerasData.selectedCarrera,
    ]);

    // Refs para rastrear cambios en callbacks y detectar qué está causando re-renders
    const prevEnrichContextRef = useRef(null);
    
    // Memoizar el objeto context para evitar recrearlo en cada render
    // Esto es crítico para que useEnrichWizardSteps no se recalcule innecesariamente
    // 
    // IMPORTANTE: Usar objetos memoizados para studentSearch y carrerasData
    // para evitar que useEnrichWizardSteps se recalcule cuando solo cambian las referencias
    // 
    // OPTIMIZACIÓN: Pasar callbacks memoizados para que los enrichers no creen nuevas funciones
    // 
    // ESTRATEGIA: Mantener referencia estable cuando los valores internos no cambian realmente
    // (similar a memoizedStudentSearch y memoizedCarrerasData)
    const enrichContext = useMemo(() => {
        const current = {
            // Contexto con callbacks y datos disponibles para los enrichers
            // Usar callbacks memoizados para evitar que los enrichers creen nuevas funciones
            onSearchStudent: handleSearchStudent, // Callback memoizado para búsqueda
            onSelectStudent: handleSelectStudent, // Callback memoizado para selección de estudiante
            studentSearch: memoizedStudentSearch, // Objeto memoizado (solo cambia cuando los datos realmente cambian)
            onSelectCarrera: handleSelectCarrera, // Callback memoizado para selección de carrera
            carrerasData: memoizedCarrerasData, // Objeto memoizado (solo cambia cuando los datos realmente cambian)
            // TODO: Agregar más contextos cuando se necesiten:
            // paralelosData: paralelosData,
            // horariosData: horariosData,
            // materiasData: materiasData,
        };

        // Comparar con el valor anterior para mantener referencia estable
        const prev = prevEnrichContextRef.current;
        if (prev) {
            // Verificar si realmente cambió algo
            const hasChanges = (
                prev.onSearchStudent !== current.onSearchStudent ||
                prev.onSelectStudent !== current.onSelectStudent ||
                prev.studentSearch !== current.studentSearch ||
                prev.onSelectCarrera !== current.onSelectCarrera ||
                prev.carrerasData !== current.carrerasData
            );

            if (!hasChanges) {
                // Mantener la referencia anterior si nada cambió
                if (ENABLE_RENDER_LOGS) {
                    console.log('🔄 [Provider] enrichContext - MANTENIENDO referencia (sin cambios)');
                }
                return prev;
            }

            // Si hay cambios, loguear qué cambió
            if (ENABLE_RENDER_LOGS) {
                const changes = {
                    onSearchStudentChanged: prev.onSearchStudent !== current.onSearchStudent,
                    onSelectStudentChanged: prev.onSelectStudent !== current.onSelectStudent,
                    studentSearchChanged: prev.studentSearch !== current.studentSearch,
                    onSelectCarreraChanged: prev.onSelectCarrera !== current.onSelectCarrera,
                    carrerasDataChanged: prev.carrerasData !== current.carrerasData,
                };
                console.log('🔄 [Provider] enrichContext - RECREANDO', changes);
            }
        } else if (ENABLE_RENDER_LOGS) {
            console.log('🔄 [Provider] enrichContext - CREANDO (primera vez)');
        }

        prevEnrichContextRef.current = current;
        return current;
    }, [
        // Callbacks memoizados (referencias estables)
        handleSearchStudent,
        handleSelectStudent,
        handleSelectCarrera,
        // Objetos memoizados (solo cambian cuando los datos realmente cambian)
        memoizedStudentSearch,
        memoizedCarrerasData,
    ]);

    // Hook genérico: enriquecer wizardSteps de forma genérica y extensible
    // La lógica de enriquecimiento específica está en los enrichers, no en el hook
    // El hook solo orquesta la aplicación de los enrichers
    const enrichedWizardSteps = useEnrichWizardSteps(
        pageData.wizardSteps,
        allEnrichers, // Array de funciones de enriquecimiento (estudiantes + carreras) - referencia estable
        enrichContext // Objeto context memoizado
    );

    // Refs para mantener referencia estable del value
    const prevValueDepsRef = useRef(null);
    const prevValueRef = useRef(null);

    // Componer el valor del contexto: datos + lógica + funciones de carga
    // El provider solo orquesta hooks y expone sus resultados
    //
    // Estrategia de dependencias: Usar objetos completos (más escalable y mantenible)
    // - Más escalable: no necesitas actualizar cuando agregas propiedades a los hooks
    // - Más mantenible: menos código repetitivo
    // - React compara por referencia, así que si el objeto cambia, se recalcula automáticamente
    //
    // OPTIMIZACIÓN: Mantener referencia estable cuando las dependencias no cambian realmente
    const value = useMemo(() => {
        const currentDeps = {
            pageData,
            enrichedWizardSteps,
            formHandlers,
            studentSearch,
            carrerasData,
        };

        const prevDeps = prevValueDepsRef.current;

        // Verificar si realmente cambió algo
        if (prevDeps) {
            const hasChanges = (
                prevDeps.pageData !== currentDeps.pageData ||
                prevDeps.enrichedWizardSteps !== currentDeps.enrichedWizardSteps ||
                prevDeps.formHandlers !== currentDeps.formHandlers ||
                prevDeps.studentSearch !== currentDeps.studentSearch ||
                prevDeps.carrerasData !== currentDeps.carrerasData
            );

            if (!hasChanges && prevValueRef.current) {
                // Mantener la referencia anterior si nada cambió
                if (ENABLE_RENDER_LOGS) {
                    console.log('✅ [Provider] useMemo value - MANTENIENDO referencia (sin cambios)');
                }
                return prevValueRef.current;
            }

            // Si hay cambios, loguear
            if (ENABLE_RENDER_LOGS && hasChanges) {
                console.log('✅ [Provider] useMemo value - RECALCULANDO (dependencias cambiaron)', {
                    pageDataRef: pageData ? 'exists' : 'null',
                    enrichedWizardStepsLength: enrichedWizardSteps?.length || 0,
                    formHandlersRef: formHandlers ? 'exists' : 'null',
                    studentSearchRef: studentSearch ? 'exists' : 'null',
                    carrerasDataRef: carrerasData ? 'exists' : 'null',
                });
            }
        } else if (ENABLE_RENDER_LOGS) {
            console.log('✅ [Provider] useMemo value - CREANDO (primera vez)');
        }

        prevValueDepsRef.current = currentDeps;

        const result = {
            // Datos de la página (spread de pageData, pero sobrescribimos wizardSteps con versión enriquecida)
            ...pageData,
            wizardSteps: enrichedWizardSteps, // Sobrescribir con versión enriquecida

            // Handlers y estados del formulario (spread completo de formHandlers)
            // Incluye: form, handleFinish, handleSave, getFormValues, loading, error, etc.
            ...formHandlers,

            // Búsqueda de estudiantes (exponer lo necesario del hook)
            studentSearch: {
                students: studentSearch.students,
                loading: studentSearch.loading,
                error: studentSearch.error,
                selectedStudent: studentSearch.selectedStudent, // Estudiante seleccionado (se usa en step2)
            },

            // Carreras (exponer lo necesario del hook)
            carrerasData: {
                carreras: carrerasData.carreras,
                loading: carrerasData.loading,
                error: carrerasData.error,
                selectedCarrera: carrerasData.selectedCarrera, // Carrera seleccionada (se usa para crear estudiantes_datos_academicos)
            },

            // TODO: Se agregarán en pasos siguientes:
            // - Resolver opciones de campos (si se necesitan, usar enrichers)
            // - Datos del catálogo (carreras, materias, etc.)
            // - Funciones de carga bajo demanda
            // - Validaciones específicas
        };

        prevValueRef.current = result;
        return result;
    }, [
        // Usar objetos completos: más escalable y mantenible
        pageData,           // Incluye pageTitle, breadcrumbItems, wizardSteps
        enrichedWizardSteps, // WizardSteps enriquecidos (sobrescribe pageData.wizardSteps)
        formHandlers,       // Incluye handleFinish, handleSave, registerForm, loading, error, etc.
        studentSearch,      // Incluye students, loading, error, searchStudent, refetch, selectedStudent
        carrerasData,       // Incluye carreras, loading, error, refetch, selectedCarrera
    ]);

    return (
        <InscripcionesNuevaContext.Provider value={value}>
            {children}
        </InscripcionesNuevaContext.Provider>
    );
};
