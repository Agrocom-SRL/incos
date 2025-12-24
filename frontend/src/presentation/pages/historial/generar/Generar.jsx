// src/presentation/pages/Historial/Generar/Generar.jsx
import React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

const HistorialGenerar = () => {
    return (
        <div>
            <Title level={2}>Generar Historial Académico</Title>
            <p>Página en desarrollo - Generar historial académico oficial para estudiantes egresados:</p>
            <ul>
                <li>Pre-requisitos: Estudiante en estado EGRESADO, todas las materias aprobadas, sin deudas</li>
                <li>Generar documento oficial tipo Libro/Folio</li>
                <li>Incluir: lista completa de materias, carga horaria, notas finales, promedio general</li>
                <li>Asignar número de libro y folio (secuencial)</li>
                <li>Generar hash SHA256 para validación de autenticidad</li>
            </ul>
        </div>
    );
};

export default HistorialGenerar;
