// src/presentation/pages/Historial/Folio/Folio.jsx
import React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

const HistorialFolioPage = () => {
    return (
        <div>
            <Title level={2}>Folio del Egresado</Title>
            <p>Página en desarrollo - Gestión de folios de egresados:</p>
            <ul>
                <li>Consultar folios de estudiantes egresados</li>
                <li>Ver libros oficiales asociados al folio</li>
                <li>Ver actas asociadas al folio</li>
                <li>Gestión de asignación de folios (libro y folio secuencial)</li>
            </ul>
            <p><strong>Nota:</strong> El folio incluye los libros oficiales y actas correspondientes al estudiante egresado.</p>
        </div>
    );
};

export default HistorialFolioPage;
