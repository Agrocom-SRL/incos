// src/presentation/pages/Historial/Validar/Validar.jsx
import React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

const HistorialValidar = () => {
    return (
        <div>
            <Title level={2}>Validar Historial Académico</Title>
            <p>Página en desarrollo - Validar autenticidad de historial académico:</p>
            <ul>
                <li>Ingresar hash del documento a validar</li>
                <li>Sistema busca el documento original en la base de datos</li>
                <li>Recalcula hash del documento almacenado</li>
                <li>Compara hashes: si coinciden = DOCUMENTO AUTÉNTICO, si no = DOCUMENTO ADULTERADO</li>
            </ul>
        </div>
    );
};

export default HistorialValidar;
