/**
 * Lista de pendientes / conflictos del plan (publicación o vista previa).
 * Usa icono de advertencia y texto en color error (tema Ant Design).
 */

import { CheckCircleFilled, WarningFilled } from '@ant-design/icons';
import { Typography } from 'antd';

const { Text } = Typography;

/**
 * @param {{
 *   ok?: boolean,
 *   lineas?: string[],
 *   mensajeExito?: string,
 *   mensajeVacio?: string,
 * }} props
 */
const HorariosPlanPendientesLista = ({
    ok = false,
    lineas = [],
    mensajeExito = 'Sin observaciones en el plan revisado.',
    mensajeVacio = 'Sin detalle para mostrar.',
}) => {
    if (ok && (!lineas || lineas.length === 0)) {
        return (
            <div className="horarios-plan-pendientes horarios-plan-pendientes--success">
                <CheckCircleFilled
                    className="horarios-plan-pendientes__icon horarios-plan-pendientes__icon--success"
                    aria-hidden
                />
                <Text type="success" className="horarios-plan-pendientes__success-text">
                    {mensajeExito}
                </Text>
            </div>
        );
    }

    if (lineas?.length) {
        return (
            <ul
                className="horarios-plan-pendientes horarios-plan-pendientes--error"
                aria-label="Detalle de pendientes del plan"
            >
                {lineas.map((t, idx) => (
                    <li key={`${idx}-${String(t).slice(0, 32)}`} className="horarios-plan-pendientes__item">
                        <WarningFilled className="horarios-plan-pendientes__icon" aria-hidden />
                        <Text className="horarios-plan-pendientes__text">{t}</Text>
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <Text type="secondary" className="horarios-plan-pendientes__empty">
            {mensajeVacio}
        </Text>
    );
};

export default HorariosPlanPendientesLista;
