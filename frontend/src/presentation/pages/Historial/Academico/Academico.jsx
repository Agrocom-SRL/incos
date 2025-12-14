// src/presentation/pages/Historial/Academico/Academico.jsx
import React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

const HistorialAcademicoPage = () => {
    return (
        <div>
            <Title level={2}>Historial Académico</Title>
            <p>Página en desarrollo - Gestión de historial académico oficial:</p>
            <ul>
                <li>Ver historiales académicos generados</li>
                <li>Generar historial académico oficial (documento tipo Libro/Folio para egresados)</li>
                <li>Validar autenticidad de historial académico mediante hash</li>
            </ul>
            <p><strong>Nota:</strong> El historial académico es el documento oficial que se genera cuando el estudiante egresa, con todas sus materias aprobadas y formato Libro/Folio.</p>
        </div>
    );
};

export default HistorialAcademicoPage;
