import { useMemo } from 'react';
import { Typography } from 'antd';
import { allSpacing } from '@theme/tokens';
import { Card, ActionButton } from '@atoms';
import { resolveHorariosBoardBucket } from '@application-institucional/horarios/utils/horariosBoardBucket';

const ctaByBucket = {
    sin_horarios: 'Completar plan',
    sin_docentes: 'Asignar docentes',
    sin_aulas: 'Ir a aulas',
    completo: 'Ver horario',
};

/** Texto breve según grupo del tablero (no el `estado` legacy del backend). */
function resumenTableroParaleloCard(p) {
    const bucket = p.boardBucket ?? resolveHorariosBoardBucket(p);
    const cursosTotales = Number(p.cursosTotales) || 0;
    const cursosCreados = Number(p.cursosCreados) || 0;
    const cursosAsignados = Number(p.cursosAsignados) || 0;
    const falta = Math.max(0, cursosTotales - cursosCreados);
    const sinDoc = Number(p.cursosSinDocente) || 0;
    const sinBloques =
        p.cursosSinBloquesHorario != null
            ? Number(p.cursosSinBloquesHorario) || 0
            : Math.max(0, cursosCreados - cursosAsignados);
    const bloquesSinAula = Number(p.bloquesSinAula) || 0;
    const coberturaInc = Number(p.ofertasCoberturaIncompleta) || 0;
    const solape = Number(p.conflictosSolapeMismoBloque) || 0;
    const confAula = Number(p.conflictosAula) || 0;
    const sinAulaBase = p.paraleloAulaId == null || p.paraleloAulaId === 0;

    switch (bucket) {
        case 'completo':
            return 'Plan completo y alineado con las validaciones; listo para publicar.';
        case 'sin_horarios':
            if (falta > 0) {
                return `Faltan ${falta} curso(s) del plan de estudio por crear en este paralelo.`;
            }
            if (solape > 0) {
                return 'Hay solapes de franja entre materias del grupo; corregí el plan semanal.';
            }
            if (coberturaInc > 0) {
                return `${coberturaInc} materia(s) con bloques insuficientes para cubrir las horas semanales del plan.`;
            }
            if (sinBloques > 0) {
                return `${sinBloques} materia(s) sin cobertura horaria completa en el plan semanal.`;
            }
            return 'Completá cursos y el plan semanal (franjas) antes de asignar aulas o docentes.';
        case 'sin_docentes':
            if (sinDoc > 0) return `${sinDoc} materia(s) aún sin docente asignado.`;
            return 'Hay choque de horario de docente entre materias; reasigná o mové franjas.';
        case 'sin_aulas':
            if (sinAulaBase) {
                return 'El paralelo no tiene aula base en Oferta académica; asigná aula al paralelo o por bloque.';
            }
            if (bloquesSinAula > 0) {
                return `${bloquesSinAula} bloque(s) sin aula asignada en el plan.`;
            }
            if (confAula > 0) {
                return `Hay ${confAula} cruce(s) de aula con otro curso; reasigná aulas en la grilla de aulas.`;
            }
            return 'Asigná aulas a los bloques del plan o resolvé cruces de ocupación.';
        default:
            return 'Revisá el armado del plan en gestión de horarios.';
    }
}

const ParaleloCard = ({ paralelo, onOpen, onGestionCursos }) => {
    const bucket = paralelo.boardBucket ?? resolveHorariosBoardBucket(paralelo);
    const title = (
        <Typography.Text ellipsis={{ tooltip: `${paralelo.paralelo} — ${paralelo.carrera || ''}` }}>
            {paralelo.paralelo}
        </Typography.Text>
    );

    const ctaPrincipal = useMemo(() => {
        if (bucket === 'sin_horarios') {
            const cursosTotales = Number(paralelo.cursosTotales) || 0;
            const cursosCreados = Number(paralelo.cursosCreados) || 0;
            const faltaCursos = Math.max(0, cursosTotales - cursosCreados);
            if (faltaCursos > 0) return 'Completar cursos';
            return 'Asignar horarios';
        }
        return ctaByBucket[bucket] || 'Abrir';
    }, [paralelo, bucket]);

    const resumenColumna = useMemo(() => resumenTableroParaleloCard(paralelo), [paralelo]);
    const periodoTurnoLine = [paralelo.periodo, paralelo.turno ? `Turno ${paralelo.turno}` : null]
        .filter(Boolean)
        .join(' · ');

    const variant =
        bucket === 'sin_horarios'
            ? 'error'
            : bucket === 'sin_docentes'
              ? 'warning'
              : bucket === 'sin_aulas'
                ? 'info'
                : bucket === 'completo'
                  ? 'success'
                  : 'default';

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
                variant={variant}
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
