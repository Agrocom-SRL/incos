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
                    sub="Base de gestión"
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
                    label="Incompletos"
                    value={kpis.incompletos}
                    sub="Sin cursos creados"
                    badgeText="Cobertura"
                    intent="warning"
                    percent={Math.round((kpis.incompletos / total) * 100)}
                />
            </Col>
            <Col xs={24} md={12} xxl={6}>
                <KpiCard
                    label="Sin horario"
                    value={kpis.sinHorario}
                    sub="Cursos sin bloques"
                    badgeText="Pendiente"
                    intent="info"
                    percent={Math.round((kpis.sinHorario / total) * 100)}
                />
            </Col>
            <Col xs={24} md={12} xxl={6}>
                <KpiCard
                    label="Conflictos"
                    value={kpis.conConflicto}
                    sub="Mismo aula y horario en más de un curso"
                    badgeText="Riesgo"
                    intent="danger"
                    percent={Math.round((kpis.conConflicto / total) * 100)}
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
