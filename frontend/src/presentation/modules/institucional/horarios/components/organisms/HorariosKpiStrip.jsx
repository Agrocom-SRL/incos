import { Col, Row } from 'antd';
import { KpiCard } from '../atoms';

/** Subtítulo en dos líneas para altura uniforme de las tarjetas KPI. */
function KpiSub({ line1, line2 }) {
    return (
        <span className="horarios-kpi-card__sub">
            {line1}
        </span>
    );
}

const KPI_CONFIG = {
    completo: {
        label: 'Completos',
        kpiKey: 'completos',
        badgeText: 'Completado',
        intent: 'success',
        sub: (
            <KpiSub
                line1="Oferta académica lista para publicar."
            />
        ),
    },
    sin_aulas: {
        label: 'Sin aulas',
        kpiKey: 'sinAulas',
        badgeText: 'Aulas',
        intent: 'info',
        sub: (
            <KpiSub
                line1="Oferta académica sin aula asignada."
            />
        ),
    },
    sin_docentes: {
        label: 'Sin docentes',
        kpiKey: 'sinDocentes',
        badgeText: 'Docentes',
        intent: 'warning',
        sub: (
            <KpiSub
                line1="Oferta académica sin docente asignado."
            />
        ),
    },
    sin_horarios: {
        label: 'Sin horarios',
        kpiKey: 'sinHorarios',
        badgeText: 'Horarios',
        intent: 'danger',
        sub: (
            <KpiSub
                line1="Oferta académica sin horario semanal."
            />
        ),
    },
};

const KPI_ORDER = ['completo', 'sin_aulas', 'sin_docentes', 'sin_horarios'];

const HorariosKpiStrip = ({ kpis, variant = 'all' }) => {
    const total = kpis.total || 1;

    const totalRow = (
        <Row gutter={[12, 12]}>
            <Col span={24}>
                <KpiCard
                    label="Total paralelos"
                    value={kpis.total}
                    sub={
                        <KpiSub
                            line1="Instancias totales de paralelos en la gestión vigente."
                        />
                    }
                    badgeText="100%"
                    intent="neutral"
                    percent={100}
                />
            </Col>
        </Row>
    );

    const detailsRow = (
        <Row gutter={[12, 12]}>
            {KPI_ORDER.map((key) => {
                const cfg = KPI_CONFIG[key];
                const value = kpis[cfg.kpiKey] ?? 0;
                return (
                    <Col key={key} xs={24} md={12} xxl={6}>
                        <KpiCard
                            label={cfg.label}
                            value={value}
                            sub={cfg.sub}
                            badgeText={cfg.badgeText}
                            intent={cfg.intent}
                            percent={Math.round((value / total) * 100)}
                        />
                    </Col>
                );
            })}
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
