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

import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { WizardForm } from '@organisms';
import { useInscripcionesNuevaContext } from '@application-inscripciones/hooks';

// Flag para activar/desactivar logs de renderizado (solo desarrollo)
const ENABLE_RENDER_LOGS = import.meta.env.DEV && true; // Cambiar a true para activar logs

const InscripcionesNueva = () => {
    if (ENABLE_RENDER_LOGS) {
        console.log('🔄 [Page] InscripcionesNueva - RENDER');
    }

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
    } = context;

    // Búsqueda de estudiantes (objeto específico desde useInscripcionNuevaStudentSearch)
    const { studentSearch } = context;

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
            />
        </PageTemplate>
    );
};

export default InscripcionesNueva;
