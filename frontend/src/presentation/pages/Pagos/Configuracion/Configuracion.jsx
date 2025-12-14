// src/presentation/pages/Pagos/Configuracion/Configuracion.jsx
import React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

const PagosConfiguracionPage = () => {
    return (
        <div>
            <Title level={2}>Configuración de Pagos</Title>
            <p>Página en desarrollo - Configurar información de pagos:</p>
            <ul>
                <li>Bancos autorizados (cuentas del municipio donde se realizan los pagos)</li>
                <li>Métodos de pago habilitados (Efectivo, Transferencia, QR, etc.)</li>
                <li>Montos de aportes anuales por gestión, carrera y periodo</li>
                <li>Configuración de descuentos aplicables (las becas se gestionan en el módulo de Estudiantes)</li>
            </ul>
        </div>
    );
};

export default PagosConfiguracionPage;
