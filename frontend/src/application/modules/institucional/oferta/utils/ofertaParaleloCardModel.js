import {
  aulaParaleloLabel,
  paraleloAsignacionFlags,
  paraleloCupoLabel,
} from './ofertaParaleloUi.js';

const HORARIO_POR_TURNO = {
  TARDE: 'Lun–Vie  13:45–18:15',
  NOCHE: 'Lun–Vie  18:15–22:00',
  MANANA: 'Lun–Vie  07:00–11:45',
};

export function normalizeTurnoKey(turno) {
  const u = String(turno ?? '')
    .toUpperCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
  if (u === 'TARDE') return 'tarde';
  if (u === 'NOCHE') return 'noche';
  if (u === 'MANANA') return 'manana';
  return 'default';
}

function capitalizeTurno(turno) {
  const t = String(turno ?? '').trim();
  if (!t) return '—';
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

export function buildContextoBand(pg) {
  const carreraPart = pg.carreraCodigo ?? pg.carreraNombre ?? '—';
  const periodoPart =
    pg.periodoNombre ??
    (pg.periodoNumero != null ? `${pg.periodoNumero}er año` : null) ??
    '—';
  const turnoKey = normalizeTurnoKey(pg.turno);

  return {
    carreraPeriodo: `${carreraPart} · ${periodoPart}`,
    nombre: pg.paraleloNombre ?? `Paralelo #${pg.id}`,
    subtitulo: `${pg.planNombre ?? 'Plan vigente'} · Turno ${capitalizeTurno(pg.turno)}`,
    turnoKey,
    bandClass: `opc-band opc-band--${turnoKey}`,
    cardTurnoClass: `oferta-paralelo-card--turno-${turnoKey}`,
  };
}

export function paraleloEstadoPillClass(estado) {
  const e = String(estado ?? '').toUpperCase();
  if (e === 'PUBLICADO') return 'opc-band__estado opc-band__estado--publicado';
  if (e === 'OFERTADO') return 'opc-band__estado opc-band__estado--ofertado';
  if (e === 'BORRADOR') return 'opc-band__estado opc-band__estado--borrador';
  if (e === 'CERRADO') return 'opc-band__estado opc-band__estado--cerrado';
  return 'opc-band__estado opc-band__estado--default';
}

export function buildDocenteValue(cobertura, flags) {
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

export function buildHorarioValue(turno, flags) {
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

export function buildProgressDots(flags, turnoKey) {
  const states = [
    flags.aula ? 'ok' : 'off',
    flags.docente ? 'ok' : flags.docenteParcial ? 'warn' : 'off',
    flags.horarios ? 'ok' : flags.horariosEnArmado ? 'warn' : 'off',
  ];
  return states.map((state) => {
    if (state === 'warn') return 'opc-dot opc-dot--warn';
    if (state === 'off') return 'opc-dot opc-dot--off';
    if (turnoKey === 'noche') return 'opc-dot opc-dot--ok-noche';
    if (turnoKey === 'manana') return 'opc-dot opc-dot--ok-manana';
    return 'opc-dot opc-dot--ok-tarde';
  });
}

/** View-model de una tarjeta paralelo_gestion para la grilla de oferta. */
export function mapParaleloToCardModel(pg, cobertura, { soloConsulta = false } = {}) {
  const flags = paraleloAsignacionFlags(pg, cobertura);
  const band = buildContextoBand(pg);
  const docente = buildDocenteValue(cobertura, flags);
  const horario = buildHorarioValue(pg.turno, flags);

  return {
    id: pg.id,
    estado: pg.estado ?? '—',
    estadoPillClass: paraleloEstadoPillClass(pg.estado),
    band,
    dots: buildProgressDots(flags, band.turnoKey),
    rows: {
      aula: {
        label: 'Aula',
        value: flags.aula ? (aulaParaleloLabel(pg) ?? '—') : 'Sin aula asignada',
        iconVariant: 'aula',
        valueVariant: flags.aula ? 'default' : 'pend',
      },
      docente: {
        label: 'Docente',
        value: docente.text,
        iconVariant: flags.docente ? 'docente' : 'pend',
        valueVariant: docente.variant,
      },
      horario: {
        label: 'Horario',
        value: horario.text,
        iconVariant: horario.variant === 'pend' ? 'pend' : 'horario',
        valueVariant: horario.variant,
      },
    },
    cupo: paraleloCupoLabel(pg),
    ctaLabel: soloConsulta ? 'Consultar' : 'Ver detalle',
    cardClassName: `oferta-paralelo-card ${band.cardTurnoClass}`.trim(),
  };
}
