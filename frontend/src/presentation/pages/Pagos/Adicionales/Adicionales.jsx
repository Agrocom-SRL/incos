// src/presentation/pages/Pagos/Adicionales/Adicionales.jsx
import React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

const PagosAdicionalesPage = () => {
    return (
        <div>
            <Title level={2}>Pagos Adicionales</Title>
            <p>Página en desarrollo - Registrar pagos adicionales o especiales:</p>
            <ul>
                <li><strong>Traspaso/Transferencia:</strong> Certificados de estudio para traspaso a otro instituto (misma ciudad o diferente ciudad/departamento)</li>
                <li><strong>Título:</strong> Pago por emisión de título al finalizar la carrera (si aplica según políticas del instituto)</li>
                <li><strong>Reinscripción:</strong> Pago por reinscripción a gestión</li>
                <li><strong>Cambio de Carrera:</strong> Pago por cambio de carrera</li>
                <li><strong>Nivelación:</strong> Pago por materias de nivelación (si aplica según políticas del instituto)</li>
            </ul>
            <p><strong>Nota:</strong> Las políticas de negocio sobre si estos pagos son al municipio o al instituto aún están por definirse. El sistema contempla estos casos para flexibilidad futura.</p>
        </div>
    );
};

export default PagosAdicionalesPage;
