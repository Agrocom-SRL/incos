import { Alert } from 'antd';

const HorariosAlertBanner = ({ incompletos = 0, conflictos = 0, sinHorario = 0 }) => {
    if (incompletos <= 0 && conflictos <= 0 && sinHorario <= 0) return null;
    const type = conflictos > 0 ? 'error' : incompletos > 0 ? 'warning' : 'info';
    return (
        <Alert
            type={type}
            showIcon
            title="Requiere atención operativa"
            description={`Incompletos: ${incompletos} | Sin horario: ${sinHorario} | Conflictos: ${conflictos}`}
        />
    );
};

export default HorariosAlertBanner;
