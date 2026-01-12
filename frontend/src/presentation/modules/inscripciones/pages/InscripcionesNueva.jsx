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

import { useEffect } from 'react';
import { Form } from 'antd';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { WizardForm } from '@organisms';
import { useInscripcionesNuevaContext } from '@application-inscripciones/hooks';

const InscripcionesNueva = () => {
    const [form] = Form.useForm();
    
    // Solo consumir datos del contexto (toda la lógica está en el Provider)
    const {
        // Datos de la página (desde useInscripcionNuevaPageData)
        pageTitle,
        breadcrumbItems,
        wizardSteps,
        
        // Handlers y estados del formulario (desde useInscripcionNuevaFormHandlers)
        loading = false,
        error = null,
        handleFinish,
        handleSave,
        registerForm,
        
        // Funciones del formulario
        resolveOptions,
        
        // TODO: Se agregarán en pasos siguientes:
        // inscripcionResult, // Para reaccionar al resultado de la inscripción
        // validationErrors, // Para mostrar errores de validación
    } = useInscripcionesNuevaContext();

    // Registrar el formulario en el contexto para que los handlers puedan acceder a sus valores
    useEffect(() => {
        if (registerForm && form) {
            registerForm(form);
        }
    }, [registerForm, form]);

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
                resolveOptions={resolveOptions}
                initialValues={{}}
                form={form}
                onFinish={handleFinish}
                onSave={handleSave}
            />
        </PageTemplate>
    );
};

export default InscripcionesNueva;
