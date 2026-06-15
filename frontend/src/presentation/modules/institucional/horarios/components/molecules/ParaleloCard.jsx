import { useMemo } from 'react';
import { Typography } from 'antd';
import { allSpacing } from '@theme/tokens';
import { Card, ActionButton } from '@atoms';
import { resolveHorariosBoardBucket } from '@application-institucional/horarios/utils/horariosBoardBucket';
import { resolveSinHorariosCta } from '@application-institucional/horarios/utils/resolveSinHorariosCta';
import { resumenTableroParaleloCard } from '@application-institucional/horarios/utils/paraleloTableroResumen';
import {
    labelParaleloSinDocentesCta,
    permisoParaleloSinDocentesCta,
} from '@application-institucional/horarios/config/paths';

const ctaByBucket = {
    sin_horarios: 'Completar plan',
    sin_docentes: 'Asignar docentes',
    sin_aulas: 'Asignar aula',
    completo: 'Ver horario',
};

const actionPermisoByBucket = {
    sin_horarios: { permiso: 'institucional.horario.armado', accion: 'EDITAR' },
    sin_docentes: { permiso: 'institucional.oferta.paralelo-gestion', accion: 'DETALLE' },
    sin_aulas: { permiso: 'institucional.oferta.paralelo-gestion', accion: 'DETALLE' },
    completo: { permiso: 'institucional.horario.armado', accion: 'EDITAR' },
};

const ParaleloCard = ({ paralelo, onOpen, onGestionCursos }) => {
    const bucket = paralelo.boardBucket ?? resolveHorariosBoardBucket(paralelo);
    const title = (
        <Typography.Text ellipsis={{ tooltip: `${paralelo.paralelo} — ${paralelo.carrera || ''}` }}>
            {paralelo.paralelo}
        </Typography.Text>
    );

    const ctaPrincipal = useMemo(() => {
        if (bucket === 'sin_horarios') return resolveSinHorariosCta(paralelo).label;
        if (bucket === 'sin_docentes') return labelParaleloSinDocentesCta(paralelo);
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

    const actionPermiso =
        bucket === 'sin_docentes'
            ? permisoParaleloSinDocentesCta(paralelo)
            : (actionPermisoByBucket[bucket] ?? actionPermisoByBucket.sin_horarios);

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
                permiso={actionPermiso.permiso}
                accion={actionPermiso.accion}
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
