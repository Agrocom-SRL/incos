/**
 * PagosRegistrar - Página para registrar un pago
 * 
 * Single Responsibility: Renderizar la UI de registro de pago consumiendo datos del Provider
 * 
 * Atomic Design: Page
 * - Solo consume datos del contexto (Provider)
 * - No contiene lógica, solo renderiza
 * - Pasa HEADER al Template (estructura)
 * - Pasa contenido al Template (formulario de registro)
 * 
 * Arquitectura:
 * Page → Template (header) + Contenido (formulario)
 * - Template maneja: estructura/layout (header, content)
 * - Contenido muestra: formulario de registro de pago
 * 
 * Nota: Esta es una versión base que se irá completando por pasos
 */

import { useLocation } from 'react-router-dom';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { usePagosRegistrarContext } from '../../../../application/modules/pagos/hooks';
import { Spin, Alert, Empty } from 'antd';

const PagosRegistrar = () => {
    const location = useLocation();
    const studentId = location.state?.studentId;

    // Consumir datos del contexto
    const {
        formData,
        loading = false,
        error = null,
    } = usePagosRegistrarContext();

    // Configurar breadcrumb items básico (se puede mejorar después)
    const breadcrumbItems = [
        { title: 'Inicio' },
        { title: 'Pagos' },
        { title: 'Registrar Pago' },
    ];

    return (
        <PageTemplate
            header={
                <PageHeader
                    title="Registrar Pago"
                    breadcrumbItems={breadcrumbItems}
                />
            }
        >
            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Spin size="large">
                        <div style={{ minHeight: '200px' }}>
                            <p>Cargando...</p>
                        </div>
                    </Spin>
                </div>
            ) : error ? (
                <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                />
            ) : (
                <div style={{ padding: '24px' }}>
                    {/* TODO: Agregar formulario de registro de pago */}
                    {studentId ? (
                        <p>Registrando pago para estudiante ID: {studentId}</p>
                    ) : (
                        <Empty description="No se ha seleccionado un estudiante" />
                    )}
                </div>
            )}
        </PageTemplate>
    );
};

export default PagosRegistrar;
