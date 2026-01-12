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
import { useInscripcionesNuevaContext } from '@application-inscripciones/hooks';

const InscripcionesNueva = () => {
    // Solo consumir datos del contexto (toda la lógica está en el Provider)
    const {
        loading = false,
        error = null,
        pageTitle, // Título viene del provider
        breadcrumbItems, // Breadcrumbs vienen del provider
        // TODO: Se agregarán más datos del contexto en pasos siguientes
        // handleFinish,
        // handleSave,
        // wizardSteps,
        // etc.
    } = useInscripcionesNuevaContext();

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
            {/* Contenido principal - Se implementará por pasos */}
            <div>
                <p>Formulario de inscripción de estudiante nuevo - En construcción</p>
                {/* Aquí se agregará el wizard/form en pasos siguientes */}
            </div>
        </PageTemplate>
    );
};

export default InscripcionesNueva;
