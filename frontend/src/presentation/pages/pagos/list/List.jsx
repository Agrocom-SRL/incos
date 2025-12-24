// src/presentation/pages/Pagos/List/List.jsx
import React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

const PagosListPage = () => {
    return (
        <div>
            <Title level={2}>Listar Pagos</Title>
            <p>Página en desarrollo - Listado de todos los pagos registrados con filtros:</p>
            <ul>
                <li>Por fecha: día, semana, mes</li>
                <li>Por gestión académica</li>
                <li>Por estudiante</li>
                <li>Por carrera</li>
                <li>Por método de pago</li>
                <li>Por estado: pagado, pendiente, saldo pendiente</li>
                <li>Ver totales de pagos (todos los registrados vs por gestión específica)</li>
            </ul>
            <p><strong>Nota:</strong> El estado de saldo pendiente se muestra aquí, no como un item separado del menú.</p>
        </div>
    );
};

export default PagosListPage;
