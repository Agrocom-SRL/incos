// src/presentation/pages/Inscripciones/Horario/Horario.jsx
import React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

const InscripcionesHorario = () => {
    return (
        <div>
            <Title level={2}>Generar Horarios</Title>
            <p>Página en desarrollo - Generar horarios personales de estudiantes basándose en sus inscripciones a materias. Generación automática con detección de conflictos y exportación a PDF/Excel.</p>
        </div>
    );
};

export default InscripcionesHorario;
