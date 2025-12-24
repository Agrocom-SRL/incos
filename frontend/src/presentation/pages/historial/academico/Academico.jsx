// src/presentation/pages/Historial/Academico/Academico.jsx
import React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

const HistorialAcademicoPage = () => {
    return (
        <div>
            <Title level={2}>Historial Académico</Title>
            <p>Página en desarrollo - Generar historial académico oficial:</p>
            <ul>
                <li>Ver historiales académicos generados</li>
                <li>Validación automática de pre-requisitos (estudiante egresado, materias aprobadas, sin deudas)</li>
                <li>Generar historial académico oficial (documento tipo Libro/Folio)</li>
                <li>Incluye: lista completa de materias, carga horaria, notas finales, promedio general, hash SHA256</li>
            </ul>
            <p><strong>Nota:</strong> El proceso incluye validación automática previa. Si el estudiante cumple los requisitos, se genera el historial académico oficial con formato Libro/Folio.</p>
        </div>
    );
};

export default HistorialAcademicoPage;
