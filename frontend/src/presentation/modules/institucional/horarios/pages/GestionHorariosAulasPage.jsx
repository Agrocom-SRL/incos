import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Alert, Typography } from 'antd';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import '@presentation/styles/pages/detail-page.css';

const { Paragraph } = Typography;

const GestionHorariosAulasPage = () => {
    const navigate = useNavigate();

    const breadcrumbItems = useMemo(
        () => [
            { title: 'Inicio', href: '/' },
            { title: 'Institucional', href: '/institucional' },
            { title: 'Gestión de horarios', href: '/institucional/horarios' },
            { title: 'Horarios en aulas' },
        ],
        [],
    );

    const headerActions = (
        <button type="button" className="sd-btn sd-btn--outline" onClick={() => navigate('/institucional/horarios')}>
            <ArrowLeftOutlined /> Volver
        </button>
    );

    return (
        <PageTemplate
            header={
                <PageHeader title="Horarios en aulas" breadcrumbItems={breadcrumbItems} actions={headerActions} />
            }
            sidebar={null}
        >
            <div className="sd sd-spin-body" style={{ padding: '0 8px' }}>
                <Alert
                    type="info"
                    showIcon
                    title="Vista en construcción"
                    description={
                        <Paragraph style={{ marginBottom: 0 }}>
                            Acá se mostrará la ocupación de aulas y la asignación de espacios físicos a los bloques de
                            horario. Reemplaza la antigua vista de «conflictos».
                        </Paragraph>
                    }
                />
            </div>
        </PageTemplate>
    );
};

export default GestionHorariosAulasPage;
