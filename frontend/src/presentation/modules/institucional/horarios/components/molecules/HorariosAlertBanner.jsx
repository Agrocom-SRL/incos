import { Alert } from 'antd';

const HorariosAlertBanner = ({ sinDocentes = 0, sinAulas = 0, sinHorarios = 0 }) => {
    if (sinDocentes <= 0 && sinAulas <= 0 && sinHorarios <= 0) return null;
    const type = sinHorarios > 0 ? 'error' : sinDocentes > 0 ? 'warning' : 'info';
    return (
        <Alert
            type={type}
            showIcon
            title="Requiere atención operativa"
            description={`Sin horarios: ${sinHorarios} | Sin docentes: ${sinDocentes} | Sin aulas: ${sinAulas}`}
        />
    );
};

export default HorariosAlertBanner;
