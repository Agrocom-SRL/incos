import { Typography } from 'antd';
import { allSpacing } from '@theme/tokens';
import { Card, ActionButton } from '@atoms';

const ctaByState = {
    incompleto: 'Completar cursos',
    sin_horario: 'Asignar horarios',
    conflicto: 'Resolver conflictos',
    completo: 'Ver horario',
};

const ParaleloCard = ({ paralelo, onOpen, onGestionCursos }) => {
    const title = (
        <Typography.Text ellipsis={{ tooltip: `${paralelo.paralelo} — ${paralelo.carrera}` }}>
            {paralelo.paralelo} — {paralelo.carrera}
        </Typography.Text>
    );

    return (
        <Card
            className="horarios-paralelo-card"
            size="small"
            variant="outlined"
            shadow={false}
            title={title}
            style={{ minWidth: 0, maxWidth: '100%' }}
            styles={{
                header: { overflow: 'hidden', minWidth: 0, paddingBlock: allSpacing.marginSM },
                body: { paddingBlock: allSpacing.marginSM, paddingInline: allSpacing.marginMD },
            }}
        >
            <Typography.Paragraph type="secondary" className="horarios-paralelo-card__meta" ellipsis={{ rows: 2 }}>
                {paralelo.periodo} · Turno {paralelo.turno} · {paralelo.cursosTotales} asignaturas del plan
            </Typography.Paragraph>
            <Typography.Text type="secondary" className="horarios-paralelo-card__courses">
                Cursos con horario: {paralelo.cursosAsignados}/{paralelo.cursosTotales}
            </Typography.Text>
            <ActionButton
                permiso="institucional.horario.armado"
                accion="EDITAR"
                block
                size="small"
                className="horarios-paralelo-card__cta"
                variant={
                    paralelo.estado === 'conflicto'
                        ? 'error'
                        : paralelo.estado === 'completo'
                            ? 'success'
                            : paralelo.estado === 'sin_horario'
                                ? 'info'
                                : paralelo.estado === 'incompleto'
                                    ? 'warning'
                                    : 'default'
                }
                onClick={() => onOpen(paralelo)}
            >
                {ctaByState[paralelo.estado] || 'Abrir'}
            </ActionButton>
            {typeof onGestionCursos === 'function' ? (
                <ActionButton
                    permiso="institucional.gestion.horarios"
                    accion="LISTAR"
                    block
                    size="small"
                    variant="default"
                    onClick={() => onGestionCursos(paralelo)}
                >
                    Gestionar cursos
                </ActionButton>
            ) : null}
        </Card>
    );
};

export default ParaleloCard;
