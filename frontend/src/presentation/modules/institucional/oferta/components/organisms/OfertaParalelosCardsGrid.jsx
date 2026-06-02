import {
  BankOutlined,
  CalendarOutlined,
  RightOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Empty, Flex, Skeleton } from 'antd';
import { ActionButton } from '@atoms';
import { allSpacing } from '@theme/tokens';
import {
  aulaParaleloLabel,
  paraleloAsignacionFlags,
  paraleloCupoLabel,
} from '../../utils/ofertaParaleloUi';

const SKELETON_COUNT = 4;

const HORARIO_POR_TURNO = {
  TARDE: 'Lun–Vie  13:45–18:15',
  NOCHE: 'Lun–Vie  18:15–22:00',
  MANANA: 'Lun–Vie  07:00–11:45',
};

function normalizeTurnoKey(turno) {
  const u = String(turno ?? '')
    .toUpperCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
  if (u === 'TARDE') return 'tarde';
  if (u === 'NOCHE') return 'noche';
  if (u === 'MANANA' || u === 'MAÑANA') return 'manana';
  return 'default';
}

function capitalizeTurno(turno) {
  const t = String(turno ?? '').trim();
  if (!t) return '—';
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

function buildContextoBand(pg) {
  const carreraPart = pg.carreraCodigo ?? pg.carreraNombre ?? '—';
  const periodoPart =
    pg.periodoNombre ??
    (pg.periodoNumero != null ? `${pg.periodoNumero}er año` : null) ??
    '—';
  const turnoKey = normalizeTurnoKey(pg.turno);
  const turnoLabel = capitalizeTurno(pg.turno);

  return {
    carreraPeriodo: `${carreraPart} · ${periodoPart}`,
    nombre: pg.paraleloNombre ?? `Paralelo #${pg.id}`,
    subtitulo: `${pg.planNombre ?? 'Plan vigente'} · Turno ${turnoLabel}`,
    bandClass: `opc-band opc-band--${turnoKey}`,
    turnoKey,
  };
}

function paraleloEstadoPillClass(estado) {
  const e = String(estado ?? '').toUpperCase();
  if (e === 'PUBLICADO') return 'opc-band__estado opc-band__estado--publicado';
  if (e === 'OFERTADO') return 'opc-band__estado opc-band__estado--ofertado';
  if (e === 'BORRADOR') return 'opc-band__estado opc-band__estado--borrador';
  if (e === 'CERRADO') return 'opc-band__estado opc-band__estado--cerrado';
  return 'opc-band__estado opc-band__estado--default';
}

function buildDocenteValue(cobertura, flags) {
  const total = Number(cobertura?.cursos_total ?? cobertura?.cursosTotal ?? 0);
  const conDocente = Number(cobertura?.cursos_con_docente ?? cobertura?.cursosConDocente ?? 0);
  const docenteNombre = cobertura?.docenteNombre ?? cobertura?.docente_nombre ?? null;

  if (flags.docente) {
    return {
      text: docenteNombre ?? 'Completo',
      variant: 'ok',
    };
  }
  if (flags.docenteParcial) {
    return {
      text: `${conDocente}/${total} cursos asignados`,
      variant: 'warn',
    };
  }
  return {
    text: 'Pendiente',
    variant: 'pend',
  };
}

function buildHorarioValue(turno, flags) {
  const turnoNorm = String(turno ?? '')
    .toUpperCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');

  if (flags.horarios) {
    return {
      text: HORARIO_POR_TURNO[turnoNorm] ?? HORARIO_POR_TURNO.MANANA,
      variant: 'ok',
    };
  }
  if (flags.horariosEnArmado) {
    return {
      text: 'En armado',
      variant: 'warn',
    };
  }
  return {
    text: 'Sin horario definido',
    variant: 'pend',
  };
}

function dotClassForState(state, turnoKey) {
  if (state === 'warn') return 'opc-dot opc-dot--warn';
  if (state === 'off') return 'opc-dot opc-dot--off';
  if (turnoKey === 'noche') return 'opc-dot opc-dot--ok-noche';
  if (turnoKey === 'manana') return 'opc-dot opc-dot--ok-manana';
  if (turnoKey === 'tarde') return 'opc-dot opc-dot--ok-tarde';
  return 'opc-dot opc-dot--ok-tarde';
}

function ProgressDots({ flags, turnoKey }) {
  const dotStates = [
    flags.aula ? 'ok' : 'off',
    flags.docente ? 'ok' : flags.docenteParcial ? 'warn' : 'off',
    flags.horarios ? 'ok' : flags.horariosEnArmado ? 'warn' : 'off',
  ];

  return (
    <div className="opc-dots" aria-hidden>
      {dotStates.map((state, idx) => (
        <span key={`dot-${idx}`} className={dotClassForState(state, turnoKey)} />
      ))}
    </div>
  );
}

function InfoRow({ icon, iconClass, label, value, valueClass }) {
  return (
    <div className="opc-info-row">
      <span className={`opc-info-icon ${iconClass}`} aria-hidden>
        {icon}
      </span>
      <div className="opc-info-item">
        <span className="opc-info-label">{label}</span>
        <span className={`opc-info-value ${valueClass ?? ''}`.trim()}>{value}</span>
      </div>
    </div>
  );
}

const OfertaParalelosCardsGrid = ({
  paralelos = [],
  loading = false,
  coberturaByParaleloId = {},
  emptyDescription = 'No hay paralelos de gestión.',
  soloConsulta = false,
  onNavigateDetalle,
  toolbar = null,
}) => (
  <Flex vertical gap={allSpacing.marginMD} className="oferta-paralelos-cards">
    {toolbar ? (
      <Flex className="oferta-paralelos-cards__toolbar" wrap="wrap" gap={allSpacing.marginSM}>
        {toolbar}
      </Flex>
    ) : null}

    {loading && !paralelos.length ? (
      <div className="oferta-paralelos-cards__grid">
        {Array.from({ length: SKELETON_COUNT }).map((_, idx) => (
          <article
            key={`pg-skeleton-${idx}`}
            className="oferta-paralelo-card oferta-paralelo-card--skeleton"
          >
            <div className="opc-band opc-band--skeleton" />
            <div className="opc-body opc-body--skeleton">
              <Skeleton active paragraph={{ rows: 3 }} />
            </div>
          </article>
        ))}
      </div>
    ) : null}

    {!loading && !paralelos.length ? (
      <Empty description={emptyDescription} className="oferta-paralelos-cards__empty" />
    ) : null}

    {!loading && paralelos.length > 0 ? (
      <div className="oferta-paralelos-cards__grid">
        {paralelos.map((pg) => {
          const cobertura = coberturaByParaleloId[pg.id];
          const flags = paraleloAsignacionFlags(pg, cobertura);
          const band = buildContextoBand(pg);
          const docente = buildDocenteValue(cobertura, flags);
          const horario = buildHorarioValue(pg.turno, flags);
          const aulaValue = flags.aula
            ? (aulaParaleloLabel(pg) ?? '—')
            : 'Sin aula asignada';
          const aulaValueClass = flags.aula ? '' : 'opc-info-value--pend';
          const docenteIconClass = flags.docente
            ? 'opc-info-icon--docente'
            : 'opc-info-icon--pend';
          const docenteValueClass =
            docente.variant === 'warn'
              ? 'opc-info-value--warn'
              : docente.variant === 'pend'
                ? 'opc-info-value--pend'
                : 'opc-info-value--ok';
          const horarioIconClass =
            horario.variant === 'pend'
              ? 'opc-info-icon--pend'
              : 'opc-info-icon--horario';
          const horarioValueClass =
            horario.variant === 'warn'
              ? 'opc-info-value--warn'
              : horario.variant === 'pend'
                ? 'opc-info-value--pend'
                : '';
          const cupo = paraleloCupoLabel(pg);

          return (
            <article key={pg.id} className="oferta-paralelo-card">
              <div className={band.bandClass}>
                <div className="opc-band__top">
                  <span className="opc-band__carrera">{band.carreraPeriodo}</span>
                  <span className={paraleloEstadoPillClass(pg.estado)}>
                    {pg.estado ?? '—'}
                  </span>
                </div>
                <h3 className="opc-band__nombre">{band.nombre}</h3>
                <p className="opc-band__sub">{band.subtitulo}</p>
                <ProgressDots flags={flags} turnoKey={band.turnoKey} />
              </div>

              <div className="opc-body">
                <InfoRow
                  icon={<BankOutlined />}
                  iconClass="opc-info-icon--aula"
                  label="Aula"
                  value={aulaValue}
                  valueClass={aulaValueClass}
                />
                <InfoRow
                  icon={<UserOutlined />}
                  iconClass={docenteIconClass}
                  label="Docente"
                  value={docente.text}
                  valueClass={docenteValueClass}
                />
                <InfoRow
                  icon={<CalendarOutlined />}
                  iconClass={horarioIconClass}
                  label="Horario"
                  value={horario.text}
                  valueClass={horarioValueClass}
                />

                <div className="opc-footer">
                  {cupo ? <span className="opc-cupo">{cupo}</span> : <span className="opc-cupo" />}
                  <ActionButton
                    permiso="institucional.oferta.paralelo-gestion"
                    accion="DETALLE"
                    variant="outline"
                    size="small"
                    className="opc-footer__cta"
                    onClick={() => onNavigateDetalle?.(pg.id)}
                  >
                    {soloConsulta ? 'Consultar' : 'Ver detalle'}
                    <RightOutlined aria-hidden />
                  </ActionButton>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    ) : null}
  </Flex>
);

export default OfertaParalelosCardsGrid;
