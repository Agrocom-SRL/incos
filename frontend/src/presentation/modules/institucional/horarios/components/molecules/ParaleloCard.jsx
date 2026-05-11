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

/** @param {Record<string, unknown>} p */
function buildParaleloPendientesLabels(p) {
    const out = [];
    const cursosTotales = Number(p.cursosTotales) || 0;
    const cursosCreados = Number(p.cursosCreados) || 0;
    const cursosAsignados = Number(p.cursosAsignados) || 0;
    const faltaCursos = Math.max(0, cursosTotales - cursosCreados);
    if (faltaCursos > 0) {
        out.push(`Faltan ${faltaCursos} curso(s) del plan por crear en el paralelo.`);
    }
    const sinDoc = Number(p.cursosSinDocente) || 0;
    if (sinDoc > 0) {
        out.push(`${sinDoc} curso(s) sin docente asignado.`);
    }
    const sinBloques =
        p.cursosSinBloquesHorario != null
            ? Number(p.cursosSinBloquesHorario) || 0
            : Math.max(0, cursosCreados - cursosAsignados);
    if (sinBloques > 0) {
        out.push(`${sinBloques} curso(s) sin bloques de horario (o sin ningún bloque activo).`);
    }
    const sinAula = Number(p.bloquesSinAula) || 0;
    if (sinAula > 0) {
        out.push(`${sinAula} bloque(s) de horario sin aula asignada.`);
    }
    const solape = Number(p.conflictosSolapeMismoBloque) || 0;
    if (solape > 0) {
        out.push(
            `Solape en el paralelo: ${solape} franja(s) con dos o más materias distintas a la misma hora.`,
        );
    }
    const aulaCruce = Number(p.conflictosAula) || 0;
    if (aulaCruce > 0) {
        out.push(
            `Conflicto de aula: ${aulaCruce} caso(s) donde el mismo aula y horario están asignados a más de un curso.`,
        );
    }
    if (p.conflictoDocenteHorario) {
        out.push('Algún docente del paralelo tiene choque de horario entre dos o más materias.');
    }
    return out;
}

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

    const pendientesLabels = useMemo(
        () => (paralelo.estado === 'completo' ? [] : buildParaleloPendientesLabels(paralelo)),
        [paralelo],
    );

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
            {pendientesLabels.length > 0 ? (
                <ul className="horarios-paralelo-card__issues" aria-label="Pendientes detectados">
                    {pendientesLabels.map((text, idx) => (
                        <li key={`${paralelo.id}-${idx}`} className="horarios-paralelo-card__issues-item">
                            <span className="horarios-paralelo-card__issue-star" aria-hidden>
                                *
                            </span>
                            <Typography.Text type="secondary" className="horarios-paralelo-card__issue-text">
                                {text}
                            </Typography.Text>
                        </li>
                    ))}
                </ul>
            ) : null}
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
