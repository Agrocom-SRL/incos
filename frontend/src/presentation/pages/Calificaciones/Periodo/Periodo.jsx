// src/presentation/pages/Calificaciones/Periodo/Periodo.jsx
import React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

const CalificacionesPeriodoPage = () => {
    return (
        <div>
            <Title level={2}>Notas por Periodo</Title>
            <p>Página en desarrollo - Gestión de notas finales por periodo académico:</p>
            <ul>
                <li>Ver notas finales de estudiantes por periodo</li>
                <li>Publicar calificaciones (cerrar estado para no editar)</li>
                <li>Generar boletín de calificaciones (exportar PDF) - solo disponible después de publicar</li>
            </ul>
            <p><strong>Nota:</strong> La publicación cierra el estado de las notas para evitar ediciones. Una vez publicadas, se puede generar el boletín oficial.</p>
        </div>
    );
};

export default CalificacionesPeriodoPage;
