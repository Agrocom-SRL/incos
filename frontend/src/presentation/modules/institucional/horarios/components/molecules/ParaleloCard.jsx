import { useMemo } from 'react';
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

    const ctaPrincipal = useMemo(() => {
        if (paralelo.estado !== 'incompleto') return ctaByState[paralelo.estado] || 'Abrir';
        const cursosTotales = Number(paralelo.cursosTotales) || 0;
        const cursosCreados = Number(paralelo.cursosCreados) || 0;
        const faltaCursos = Math.max(0, cursosTotales - cursosCreados);
        const sinDoc = Number(paralelo.cursosSinDocente) || 0;
        if (faltaCursos === 0 && sinDoc > 0 && cursosTotales > 0) return 'Asignar docentes';
        return ctaByState.incompleto;
    }, [paralelo]);

    const cursosCreados = paralelo.cursosCreados ?? 0;
    const cursosTotales = paralelo.cursosTotales ?? 0;
    const cursosConHorario = paralelo.cursosAsignados ?? 0;

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
                {paralelo.periodo} · Turno {paralelo.turno} · {cursosTotales} asignaturas del plan
            </Typography.Paragraph>
            <Typography.Text type="secondary" className="horarios-paralelo-card__courses">
                {cursosCreados}/{cursosTotales} cursos del plan en el grupo · {cursosConHorario} con bloques de
                horario
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
                {ctaPrincipal}
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
