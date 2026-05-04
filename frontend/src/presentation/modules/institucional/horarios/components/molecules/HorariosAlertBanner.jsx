import { Alert } from 'antd';

const HorariosAlertBanner = ({ incompletos = 0, conflictos = 0 }) => {
    if (incompletos <= 0 && conflictos <= 0) return null;
    return (
        <Alert
            type={conflictos > 0 ? 'error' : 'warning'}
            showIcon
            title="Requiere atención operativa"
            description={`Incompletos: ${incompletos} | Conflictos: ${conflictos}`}
        />
    );
};

export default HorariosAlertBanner;
