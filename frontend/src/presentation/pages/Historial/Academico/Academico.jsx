// src/presentation/pages/historial/academico/Academico.jsx
/**
 * HistorialAcademicoPage - Página de historial académico
 * 
 * Single Responsibility: Solo renderizar la UI del historial académico
 * 
 * Usa PageTemplate para mantener consistencia visual con otras páginas
 */

import { Typography, List } from 'antd';
import { PageTemplate } from '@templates';

const { Title, Paragraph } = Typography;

const HistorialAcademicoPage = () => {
    const features = [
        'Ver historiales académicos generados',
        'Validación automática de pre-requisitos (estudiante egresado, materias aprobadas, sin deudas)',
        'Generar historial académico oficial (documento tipo Libro/Folio)',
        'Incluye: lista completa de materias, carga horaria, notas finales, promedio general, hash SHA256',
    ];

    return (
        <PageTemplate
            children={
                <>
                    <Title level={2}>Historial Académico</Title>
                    <Paragraph>
                        Página en desarrollo - Generar historial académico oficial:
                    </Paragraph>
                    <List
                        dataSource={features}
                        renderItem={(item) => (
                            <List.Item>
                                <List.Item.Meta description={item} />
                            </List.Item>
                        )}
                    />
                    <Paragraph>
                        <strong>Nota:</strong> El proceso incluye validación automática previa. 
                        Si el estudiante cumple los requisitos, se genera el historial académico 
                        oficial con formato Libro/Folio.
                    </Paragraph>
                </>
            }
        />
    );
};

export default HistorialAcademicoPage;
