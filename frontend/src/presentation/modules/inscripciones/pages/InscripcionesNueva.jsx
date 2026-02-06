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

import { useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { WizardForm } from '@organisms';
import { InscripcionesCarreraStepContent } from '@inscripciones/components/organisms';
import { useInscripcionesNuevaContext } from '@application-inscripciones/hooks';
import { downloadFile } from '@application/utils/fileDownload';

const InscripcionesNueva = () => {
    const location = useLocation();
    // Obtener datos de edición del estado de navegación
    const editData = location.state?.mode === 'editar' ? location.state : null;

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

    // Búsqueda de estudiantes, carreras y paralelos (step 1 usa CarreraSelectionSection + nuevo/antiguo)
    const { studentSearch, carrerasData, paralelosData } = context;
    
    // Pasos: 0=Buscar Estudiante, 1=Carrera, 2=Periodo y Paralelos, 3=Horario
    const initialStep = useMemo(() => {
      if (editData) return 2; // Edición: ir a Periodo y Paralelos
      if (studentSearch?.selectedStudent && !studentSearch?.loading) return 1; // Estudiante ya elegido: ir a Carrera
      return 0;
    }, [editData, studentSearch?.selectedStudent, studentSearch?.loading]);
    
    // Pre-cargar valores iniciales del formulario en modo edición
    // Nota: Los paralelos se pre-seleccionan automáticamente mediante los hooks
    // Solo necesitamos pre-cargar la carrera en el formulario
    const initialValues = useMemo(() => {
      if (!editData) {
        return {};
      }
      
      const values = {};
      
      // Pre-cargar carrera si está disponible
      if (editData.carreraId && carrerasData?.carreras) {
        const carrera = carrerasData.carreras.find(c => c.id === Number(editData.carreraId));
        if (carrera) {
          values.carrera = carrera.id;
        }
      }
      
      return values;
    }, [editData, carrerasData?.carreras]);
    
    // Efecto para establecer valores iniciales en el formulario cuando estén disponibles
    useEffect(() => {
      if (editData && form && editData.carreraId && carrerasData?.carreras && carrerasData.carreras.length > 0) {
        const carrera = carrerasData.carreras.find(c => c.id === Number(editData.carreraId));
        if (carrera) {
          form.setFieldsValue({ carrera: carrera.id });
        }
      }
    }, [editData, form, carrerasData?.carreras]);

    // Contenido custom del paso 1 (Seleccionar Carrera): la página construye el panel
    const renderSectionContent = useCallback(
      (stepIndex, sectionKey, section, form) => {
        if (stepIndex === 1 && sectionKey === 'carrera') {
          return (
            <InscripcionesCarreraStepContent
              key={sectionKey}
              form={form}
              section={section}
              carreras={carrerasData?.carreras ?? []}
              carrerasLoading={carrerasData?.loading ?? false}
              carrerasError={carrerasData?.error ?? null}
              selectedStudent={studentSearch?.selectedStudent ?? null}
              onCarreraChange={(carrera) => context.onSelectCarrera?.(carrera?.id)}
            />
          );
        }
        return null;
      },
      [
        carrerasData?.carreras,
        carrerasData?.loading,
        carrerasData?.error,
        studentSearch?.selectedStudent,
        context.onSelectCarrera,
      ]
    );

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
                initialValues={initialValues}
                form={form}
                onFinish={handleFinish}
                onSave={handleSave}
                showSaveButton={false}
                initialStep={initialStep}
                renderSectionContent={renderSectionContent}
            />
        </PageTemplate>
    );
};

export default InscripcionesNueva;
