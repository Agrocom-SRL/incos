import { Col, Row } from 'antd';
import { KpiCard } from '../atoms';

const HorariosKpiStrip = ({ kpis, variant = 'all' }) => {
    const total = kpis.total || 1;

    const totalRow = (
        <Row gutter={[12, 12]}>
            <Col span={24}>
                <KpiCard
                    label="Total paralelos"
                    value={kpis.total}
                    sub="Total de paralelos"
                    badgeText="100%"
                    intent="neutral"
                    percent={100}
                />
            </Col>
        </Row>
    );

    const detailsRow = (
        <Row gutter={[12, 12]}>
            <Col xs={24} md={12} xxl={6}>
                <KpiCard
                    label="Sin horarios"
                    value={kpis.sinHorarios}
                    sub="Horarios pendientes"
                    badgeText="Horarios"
                    intent="danger"
                    percent={Math.round((kpis.sinHorarios / total) * 100)}
                />
            </Col>
            <Col xs={24} md={12} xxl={6}>
                <KpiCard
                    label="Sin docentes"
                    value={kpis.sinDocentes}
                    sub="Docentes sin asignar"
                    badgeText="Docentes"
                    intent="warning"
                    percent={Math.round((kpis.sinDocentes / total) * 100)}
                />
            </Col>
            <Col xs={24} md={12} xxl={6}>
                <KpiCard
                    label="Sin aulas"
                    value={kpis.sinAulas}
                    sub="Bloques sin aula"
                    badgeText="Aulas"
                    intent="info"
                    percent={Math.round((kpis.sinAulas / total) * 100)}
                />
            </Col>
            <Col xs={24} md={12} xxl={6}>
                <KpiCard
                    label="Completos"
                    value={kpis.completos}
                    sub="Listos para publicar"
                    badgeText="Completado"
                    intent="success"
                    percent={Math.round((kpis.completos / total) * 100)}
                />
            </Col>
        </Row>
    );

    if (variant === 'total') {
        return totalRow;
    }
    if (variant === 'details') {
        return detailsRow;
    }

    return (
        <>
            {totalRow}
            {detailsRow}
        </>
    );
};

export default HorariosKpiStrip;
