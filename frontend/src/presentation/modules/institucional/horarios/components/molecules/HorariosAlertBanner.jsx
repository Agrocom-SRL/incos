import { Alert, Button, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
const HorariosAlertBanner = ({ sinDocentes = 0, sinAulas = 0, sinHorarios = 0 }) => {
    const navigate = useNavigate();

    if (sinDocentes <= 0 && sinAulas <= 0 && sinHorarios <= 0) return null;
    const type = sinHorarios > 0 ? 'error' : sinDocentes > 0 ? 'warning' : 'info';
    return (
        <Alert
            type={type}
            showIcon
            title="Requiere atención operativa"
            description={
                <Space orientation="vertical" size={8}>
                    <span>
                        Sin horarios: {sinHorarios} | Sin docentes: {sinDocentes} | Sin aula efectiva: {sinAulas}{' '}
                        (revisar aula en Oferta académica o overrides aquí)
                    </span>
                    {sinDocentes > 0 ? (
                        <Button
                            size="small"
                            type="primary"
                            onClick={() => navigate('/institucional/oferta')}
                        >
                            Ir a oferta académica
                        </Button>
                    ) : null}
                </Space>
            }
        />
    );
};

export default HorariosAlertBanner;
