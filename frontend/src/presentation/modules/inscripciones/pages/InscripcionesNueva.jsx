/**
 * InscripcionesNueva - Página para inscribir estudiante nuevo
 * 
 * Single Responsibility: Renderizar la UI de inscripción consumiendo datos del Provider
 * 
 * Atomic Design: Page
 * - Solo consume datos del contexto (Provider)
 * - No contiene lógica, solo renderiza
 * - Pasa HEADER al Template (estructura)
 * - Pasa contenido al Template (wizard/form se agregará en pasos siguientes)
 * 
 * Arquitectura:
 * Page → Template (header) + Organism (wizard/form)
 * - Template maneja: estructura/layout (header, content, sidebar, bottom)
 * - Organism maneja: funcionalidad (wizard, pasos, validación, guardado)
 * 
 * Nota: Esta es una versión base que se irá completando por pasos
 */

import { useEffect, useMemo } from 'react';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { WizardForm } from '@organisms';
import { useInscripcionesNuevaContext } from '@application-inscripciones/hooks';
import { downloadFile } from '@application/utils/fileDownload';

const InscripcionesNueva = () => {

    // Solo consumir datos del contexto (toda la lógica está en el Provider)
    // El provider hace spread de objetos, así que las propiedades están aplanadas en el contexto
    // Separar por grupos lógicos para mejor organización y claridad
    const context = useInscripcionesNuevaContext();

    // Datos de la página (desde useInscripcionNuevaPageData - spread de pageData)
    const {
        pageTitle,
        breadcrumbItems,
        wizardSteps,
    } = context;

    // Handlers y estados del formulario (desde useInscripcionNuevaFormHandlers - spread de formHandlers)
    // Incluye: form (creado y registrado automáticamente), handleFinish, handleSave, loading, error, etc.
    const {
        form,
        loading = false,
        error = null,
        handleFinish,
        handleSave,
        inscripcionResult,
    } = context;

    // Descargar automáticamente el formulario cuando la inscripción se complete exitosamente
    useEffect(() => {
        if (inscripcionResult?.success && inscripcionResult?.data?.formularioInscripcion) {
            const { filePath, fileName } = inscripcionResult.data.formularioInscripcion;
            if (filePath && fileName) {
                // Delay más largo para asegurar que el archivo esté disponible
                // La generación puede tomar tiempo (Word + conversión a PDF)
                setTimeout(() => {
                    try {
                        downloadFile(filePath, fileName);
                    } catch (err) {
                        console.error('Error al descargar el formulario de inscripción:', err);
                    }
                }, 3000); // 3 segundos para dar tiempo a la generación completa
            }
        }
    }, [inscripcionResult]);

    // Búsqueda de estudiantes (objeto específico desde useInscripcionNuevaStudentSearch)
    const { studentSearch } = context;
    
    // Si ya hay un estudiante seleccionado, empezar desde el paso 1 (omitir búsqueda)
    // Paso 0: Buscar Estudiante
    // Paso 1: Seleccionar Paralelos
    // Paso 2: Horario de Clases
    // Usar useMemo para recalcular cuando selectedStudent cambia
    const initialStep = useMemo(() => {
      // Si hay un estudiante seleccionado y no está cargando, empezar en paso 1
      if (studentSearch?.selectedStudent && !studentSearch?.loading) {
        return 1;
      }
      return 0;
    }, [studentSearch?.selectedStudent, studentSearch?.loading]);

    // TODO: Se agregarán en pasos siguientes:
    // const { inscripcionResult } = context; // Para reaccionar al resultado de la inscripción
    // const { validationErrors } = context; // Para mostrar errores de validación

    return (
        <PageTemplate
            header={
                <PageHeader
                    title={pageTitle}
                    breadcrumbItems={breadcrumbItems}
                />
            }
            sidebar={null}
        >
            {/* Contenido principal - Wizard de inscripción */}
            <WizardForm
                steps={wizardSteps}
                loading={loading}
                viewMode={false}
                resolveOptions={() => []}
                initialValues={{}}
                form={form}
                onFinish={handleFinish}
                onSave={handleSave}
                showSaveButton={false}
                initialStep={initialStep}
            />
        </PageTemplate>
    );
};

export default InscripcionesNueva;
