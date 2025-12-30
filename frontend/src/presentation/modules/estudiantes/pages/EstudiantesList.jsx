/**
 * EstudiantesList - Página para listar estudiantes
 * 
 * Single Responsibility: Solo renderizar la UI de la lista de estudiantes
 * 
 * Esta es una página pura de React que:
 * - No contiene lógica de negocio
 * - Obtiene datos del StudentProvider mediante useStudentContext
 * - Solo maneja lógica de presentación
 * 
 * NOTA: Este componente se refactorizará usando Atomic Design
 * por partes, creando componentes atómicos reutilizables.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { useStudentContext } from '@application-estudiantes/hooks';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { Button, Container, Text, Alert, Card } from '@atoms';
import { allSpacing } from '@theme/tokens';

const EstudiantesList = () => {
    const navigate = useNavigate();
    
    // Obtener datos del contexto (toda la lógica está en el Provider)
    const {
        estudiantes = [],
        loading = false,
        error = null,
        refetch,
    } = useStudentContext();

    const handleNuevoEstudiante = () => {
        navigate('/estudiantes/registrar');
    };

    return (
        <PageTemplate>
            <Container vertical gap={allSpacing.paddingLG}>
                <PageHeader
                    title="Lista de Estudiantes"
                    actions={
                        <Button
                            variant="primary"
                            icon={<PlusOutlined />}
                            onClick={handleNuevoEstudiante}
                        >
                            Nuevo Estudiante
                        </Button>
                    }
                />
                
                <Container vertical gap={allSpacing.margin}>
                    <Text type="paragraph" strong>Loading: {loading ? 'Sí' : 'No'}</Text>
                    <Text type="paragraph" strong>Error: {error || 'No hay error'}</Text>
                    <Text type="paragraph" strong>Total de estudiantes: {estudiantes.length}</Text>
                </Container>

                {loading && estudiantes.length === 0 && (
                    <Text type="paragraph">Cargando estudiantes...</Text>
                )}

                {error && (
                    <Alert
                        type="error"
                        message="Error"
                        description={error}
                    />
                )}

                {!loading && estudiantes.length > 0 && (
                    <Card title={`Estudiantes (${estudiantes.length})`}>
                        <Container vertical gap={allSpacing.paddingSM}>
                            <Text type="paragraph">
                                {JSON.stringify(estudiantes, null, 2)}
                            </Text>
                        </Container>
                    </Card>
                )}

                {!loading && estudiantes.length === 0 && !error && (
                    <Text type="paragraph">No hay estudiantes disponibles</Text>
                )}
            </Container>
        </PageTemplate>
    );
};

export default EstudiantesList;
