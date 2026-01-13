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
        
        // Búsqueda de estudiantes (desde useInscripcionNuevaStudentSearch)
        studentSearch,
        
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
            
            {/* Debug: Mostrar resultados de búsqueda (temporal) */}
            {studentSearch && (
                <div style={{ marginTop: '24px', padding: '16px', border: '1px solid #d9d9d9', borderRadius: '4px' }}>
                    <h3>Resultados de Búsqueda (Debug):</h3>
                    {studentSearch.loading && <p>Buscando...</p>}
                    {studentSearch.error && (
                        <p style={{ color: 'red' }}>Error: {studentSearch.error}</p>
                    )}
                    {!studentSearch.loading && !studentSearch.error && (
                        <>
                            <p><strong>Total encontrados:</strong> {studentSearch.students?.length || 0}</p>
                            {studentSearch.students && studentSearch.students.length > 0 ? (
                                <div>
                                    <h4>Estudiantes encontrados:</h4>
                                    <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px', overflow: 'auto' }}>
                                        {JSON.stringify(studentSearch.students, null, 2)}
                                    </pre>
                                </div>
                            ) : (
                                <p>No se encontraron estudiantes</p>
                            )}
                        </>
                    )}
                </div>
            )}
        </PageTemplate>
    );
};

export default InscripcionesNueva;
