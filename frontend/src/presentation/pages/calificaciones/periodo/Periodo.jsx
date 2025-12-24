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
                <li>Ver y gestionar notas finales de estudiantes por periodo</li>
                <li>Indicar notas finales y cerrar periodo (cierra estado para no editar)</li>
                <li>Publicar calificaciones (disponible después de cerrar periodo)</li>
                <li>Generar boletín de calificaciones (exportar PDF) - solo disponible después de publicar</li>
            </ul>
            <p><strong>Nota:</strong> El proceso incluye: indicar notas finales → cerrar periodo → publicar → generar boletín. Todo en un solo flujo.</p>
        </div>
    );
};

export default CalificacionesPeriodoPage;
