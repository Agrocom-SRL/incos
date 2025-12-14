// src/presentation/pages/Pagos/Registrar/Registrar.jsx
import React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

const PagosRegistrarPage = () => {
    return (
        <div>
            <Title level={2}>Registrar Pago</Title>
            <p>Página en desarrollo - Registrar pago de estudiante:</p>
            <ul>
                <li>Seleccionar estudiante y gestión</li>
                <li>Método de pago (Efectivo, Transferencia, QR) - selección dentro del mismo formulario</li>
                <li>Monto pagado</li>
                <li>Registro de comprobante/número de transacción (parte del mismo proceso)</li>
                <li>Generación automática de comprobante de pago</li>
                <li>Cálculo automático: total_a_pagar = aporte_anual - descuento_beca</li>
            </ul>
            <p><strong>Nota:</strong> Como es un instituto público (municipio), el instituto no recibe dinero directamente. Los pagos se realizan en las cuentas bancarias del municipio.</p>
        </div>
    );
};

export default PagosRegistrarPage;
