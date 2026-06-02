import { Alert, Button, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@application-auth';
import { canListarAsignacion } from '@application-institucional/horarios/config/asignacionDocentePermisos';

const HorariosAlertBanner = ({ sinDocentes = 0, sinAulas = 0, sinHorarios = 0 }) => {
    const navigate = useNavigate();
    const { hasPermiso } = useAuthContext();
    const puedeAsignacion = canListarAsignacion(hasPermiso);

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
                    {sinDocentes > 0 && puedeAsignacion ? (
                        <Button
                            size="small"
                            type="primary"
                            onClick={() => navigate('/institucional/horarios/asignacion-docente')}
                        >
                            Ir a asignación docente
                        </Button>
                    ) : null}
                </Space>
            }
        />
    );
};

export default HorariosAlertBanner;
