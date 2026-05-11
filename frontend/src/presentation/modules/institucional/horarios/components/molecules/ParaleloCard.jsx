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

/** Texto breve: por qué el paralelo aparece en la columna de estado del tablero. @param {Record<string, unknown>} p */
function resumenEstadoParaleloCard(p) {
    const estado = p.estado;
    const cursosTotales = Number(p.cursosTotales) || 0;
    const cursosCreados = Number(p.cursosCreados) || 0;
    const cursosAsignados = Number(p.cursosAsignados) || 0;
    const falta = Math.max(0, cursosTotales - cursosCreados);
    const sinDoc = Number(p.cursosSinDocente) || 0;
    const sinBloques =
        p.cursosSinBloquesHorario != null
            ? Number(p.cursosSinBloquesHorario) || 0
            : Math.max(0, cursosCreados - cursosAsignados);

    switch (estado) {
        case 'completo':
            return 'Plan completo y alineado con las validaciones; listo para publicar.';
        case 'conflicto':
            return 'En esta columna porque hay solapes, cruces de aula o choques de docente pendientes de corregir.';
        case 'sin_horario':
            return 'Faltan bloques de horario o aulas en una o más materias del grupo.';
        case 'incompleto':
            if (falta > 0) {
                return `Faltan ${falta} curso(s) del plan de estudio por crear en este paralelo.`;
            }
            if (sinDoc > 0) return `${sinDoc} materia(s) aún sin docente asignado.`;
            if (sinBloques > 0) return `${sinBloques} materia(s) sin franjas de horario cargadas.`;
            return 'Seguí completando cursos, docentes y planificación en la gestión de horarios.';
        default:
            return 'Revisá el armado del plan en gestión de horarios.';
    }
}

const ParaleloCard = ({ paralelo, onOpen, onGestionCursos }) => {
    const title = (
        <Typography.Text ellipsis={{ tooltip: `${paralelo.paralelo} — ${paralelo.carrera || ''}` }}>
            {paralelo.paralelo}
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

    const resumenColumna = useMemo(() => resumenEstadoParaleloCard(paralelo), [paralelo]);
    const periodoTurnoLine = [paralelo.periodo, paralelo.turno ? `Turno ${paralelo.turno}` : null]
        .filter(Boolean)
        .join(' · ');

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
            {paralelo.carrera ? (
                <Typography.Text strong className="horarios-paralelo-card__carrera">
                    {paralelo.carrera}
                </Typography.Text>
            ) : null}
            {periodoTurnoLine ? (
                <Typography.Text type="secondary" className="horarios-paralelo-card__periodo-turno">
                    {periodoTurnoLine}
                </Typography.Text>
            ) : null}
            <Typography.Paragraph type="secondary" className="horarios-paralelo-card__resumen-estado">
                {resumenColumna}
            </Typography.Paragraph>
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
