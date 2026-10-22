/**
 * Helper compartido de los PDF de Capacitación (Formulario de Inscripción y
 * Recibo de Pago).
 *
 * Arma el payload `datos` que consumen los generadores a partir de la ficha de la
 * inscripción que ya devuelve `GetInscripcionCapacitacionByIdUseCase` (participante
 * + curso + grupo/horarios + pagos + requisitos): una sola fuente de verdad, sin
 * consultas ni vistas nuevas. Funciones puras, sin I/O.
 *
 * Convención del payload: fechas ya formateadas (DD/MM/YYYY), enumeraciones con su
 * etiqueta legible y montos como números (el generador los formatea).
 */

import { aCentavos, deCentavos } from './estadoInscripcion.js';
import { sanitizarFilePart } from '../../../utils/centralizadorExcelDatos.js';

const ZONA_HORARIA = 'America/La_Paz';
const INSTITUTO = 'Instituto Técnico INCOS Santa Cruz';

const ETIQUETAS = {
  concepto: { CURSO: 'COSTO DEL CURSO', MATRICULA: 'MATRÍCULA' },
  modalidad: { VIRTUAL: 'Virtual', PRESENCIAL: 'Presencial', SEMIPRESENCIAL: 'Semipresencial' },
  estadoInscripcion: {
    PENDIENTE: 'Pendiente de pago',
    INSCRITO: 'Inscrito',
    RETIRADO: 'Retirado',
    ANULADO: 'Anulado'
  }
};

const TEXTO_COSTO_CURSO_ACREDITADO = 'Pagado a la entidad (acreditado con depósito)';
const TEXTO_COSTO_CURSO_PENDIENTE = 'Se paga a la entidad (depósito pendiente de acreditar)';

const ABREVIATURA_DIA = {
  LUNES: 'Lunes',
  MARTES: 'Martes',
  MIERCOLES: 'Miércoles',
  JUEVES: 'Jueves',
  VIERNES: 'Viernes',
  SABADO: 'Sábado',
  DOMINGO: 'Domingo'
};

const textoOVacio = (valor) => (valor == null ? '' : String(valor).trim());

const horaCorta = (hora) => textoOVacio(hora).slice(0, 5);

/**
 * Horarios de un grupo en texto legible, agrupando los días que comparten hora:
 * `Martes, Jueves 19:00-21:00 · Sábado 09:00-12:00`. Respeta el orden recibido.
 * @param {Array<{dia:string, horaInicio:string, horaFin:string}>} horarios
 * @returns {string}
 */
export function textoHorariosGrupo(horarios) {
  const porRango = new Map();
  (horarios ?? []).forEach((h) => {
    const rango = `${horaCorta(h.horaInicio)}-${horaCorta(h.horaFin)}`;
    const dias = porRango.get(rango) ?? [];
    dias.push(ABREVIATURA_DIA[h.dia] ?? textoOVacio(h.dia));
    porRango.set(rango, dias);
  });
  return [...porRango].map(([rango, dias]) => `${dias.join(', ')} ${rango}`).join(' · ');
}

/** Une nombres de día: `A y B` con dos, `A, B, C` con más (como en el folleto del curso). */
const unirDias = (dias) => (dias.length === 2 ? dias.join(' y ') : dias.join(', '));

/**
 * Horarios de un grupo como bloques `{ dias, horas }` para la tabla del formulario, agrupando
 * los días que comparten hora: `{ dias: 'Martes y Jueves', horas: '19:00 - 21:00' }`.
 * Respeta el orden recibido.
 * @param {Array<{dia:string, horaInicio:string, horaFin:string}>} horarios
 * @returns {Array<{dias:string, horas:string}>}
 */
export function bloquesHorariosGrupo(horarios) {
  const porRango = new Map();
  (horarios ?? []).forEach((h) => {
    const rango = `${horaCorta(h.horaInicio)} - ${horaCorta(h.horaFin)}`;
    const dias = porRango.get(rango) ?? [];
    dias.push(ABREVIATURA_DIA[h.dia] ?? textoOVacio(h.dia));
    porRango.set(rango, dias);
  });
  return [...porRango].map(([horas, dias]) => ({ dias: unirDias(dias), horas }));
}

/**
 * Grupos del curso para el formulario, marcando el elegido por el participante.
 * Sin grupos del curso (o sin ficha de curso) cae al grupo de la inscripción.
 */
function gruposDelFormulario(ficha, gruposCurso) {
  if (Array.isArray(gruposCurso) && gruposCurso.length > 0) {
    return gruposCurso.map((grupo) => ({
      nombre: textoOVacio(grupo.nombre),
      horarios: textoHorariosGrupo(grupo.horarios),
      bloques: bloquesHorariosGrupo(grupo.horarios),
      seleccionado: Number(grupo.id) === Number(ficha.capacitacionGrupoId)
    }));
  }
  return ficha.grupoNombre
    ? [
        {
          nombre: textoOVacio(ficha.grupoNombre),
          horarios: textoOVacio(ficha.grupoHorariosEtiqueta),
          // Sin horarios estructurados solo se conoce la etiqueta: va tal cual en la columna Horarios.
          bloques: ficha.grupoHorariosEtiqueta
            ? [{ dias: '', horas: textoOVacio(ficha.grupoHorariosEtiqueta) }]
            : [],
          seleccionado: true
        }
      ]
    : [];
}

/** Pagos que cuentan (los anulados se conservan como historial pero no se imprimen ni suman). */
const pagosVigentes = (ficha) => (ficha.pagos ?? []).filter((pago) => !pago.anulado);

/**
 * Leyenda del costo del curso cuando es EXTERNO (curso con entidad certificadora: se
 * deposita a la entidad y no se registra como pago). `null` si el curso se cobra aquí.
 * @param {Object} ficha
 * @returns {string|null}
 */
function textoCostoCursoExterno(ficha) {
  if (!ficha.pagoCursoExterno) return null;
  return ficha.requisitoAcreditaPagoCurso?.entregado
    ? TEXTO_COSTO_CURSO_ACREDITADO
    : TEXTO_COSTO_CURSO_PENDIENTE;
}

/**
 * Fecha (string `YYYY-MM-DD…` o Date de una columna DATE) → `YYYY-MM-DD`.
 * Los Date se interpretan en la zona horaria de la institución, igual que la BD.
 * @param {string|Date|null|undefined} valor
 * @returns {string} Cadena vacía si no es una fecha válida.
 */
export function aFechaIso(valor) {
  if (!valor) return '';
  if (valor instanceof Date) {
    if (Number.isNaN(valor.getTime())) return '';
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: ZONA_HORARIA,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(valor);
  }
  const coincide = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(valor));
  return coincide ? `${coincide[1]}-${coincide[2]}-${coincide[3]}` : '';
}

/**
 * @param {string|Date|null|undefined} valor
 * @returns {string} `DD/MM/YYYY` o cadena vacía.
 */
export function formatearFecha(valor) {
  const iso = aFechaIso(valor);
  if (!iso) return '';
  const [anio, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${anio}`;
}

/** Año (gestión) de una fecha; el del servidor si la fecha no es válida. */
const anioDe = (valor) => {
  const iso = aFechaIso(valor);
  return iso ? iso.slice(0, 4) : String(new Date().getFullYear());
};

/**
 * Código de la inscripción mostrado en el recuadro "No. Registro" (CAP-00012).
 * @param {number|string} inscripcionId
 * @returns {string}
 */
export function codigoInscripcion(inscripcionId) {
  return `CAP-${String(inscripcionId).padStart(5, '0')}`;
}

const sumaCentavos = (pagos) => pagos.reduce((acc, pago) => acc + aCentavos(pago.monto), 0);

/**
 * Payload del Formulario de Inscripción.
 *
 * @param {Object} ficha - Salida de GetInscripcionCapacitacionByIdUseCase.
 * @param {Object} [opciones]
 * @param {string|Date} [opciones.fechaEmision] - Fecha de emisión (por defecto hoy).
 * @param {Array<Object>} [opciones.gruposCurso] - Grupos del curso con sus horarios (ficha del curso).
 * @returns {Object} Payload para `generarFormularioInscripcion`.
 */
export function construirDatosFormularioInscripcion(
  ficha,
  { fechaEmision = new Date(), gruposCurso = null } = {}
) {
  const requisitos = (ficha.requisitos ?? []).map((requisito) => ({
    descripcion: textoOVacio(requisito.descripcion),
    obligatorio: Boolean(requisito.obligatorio),
    entregado: Boolean(requisito.entregado),
    fechaEntrega: formatearFecha(requisito.fechaEntrega)
  }));
  const compromisoVigente = ficha.compromisoEstado === 'VIGENTE' && ficha.fechaCompromiso;

  return {
    codigoInscripcion: codigoInscripcion(ficha.id),
    gestion: anioDe(ficha.fechaInscripcion),
    fechaInscripcion: formatearFecha(ficha.fechaInscripcion),
    fechaEmision: formatearFecha(fechaEmision),
    estado: ETIQUETAS.estadoInscripcion[ficha.estado] ?? textoOVacio(ficha.estado),
    participante: {
      nombreCompleto: textoOVacio(ficha.participanteNombreCompleto),
      ci: [ficha.participanteCi, ficha.participanteExpedicion].map(textoOVacio).filter(Boolean).join(' '),
      celular: textoOVacio(ficha.participanteCelular),
      email: textoOVacio(ficha.participanteEmail)
    },
    curso: {
      titulo: textoOVacio(ficha.capacitacionTitulo),
      modalidad: ETIQUETAS.modalidad[ficha.capacitacionModalidad] ?? textoOVacio(ficha.capacitacionModalidad),
      entidadCertificadora: textoOVacio(ficha.capacitacionEntidadCertificadora),
      fechaInicio: formatearFecha(ficha.capacitacionFechaInicio),
      fechaFin: formatearFecha(ficha.capacitacionFechaFin),
      grupo: textoOVacio(ficha.grupoNombre),
      horarios: textoOVacio(ficha.grupoHorariosEtiqueta)
    },
    grupos: gruposDelFormulario(ficha, gruposCurso),
    requisitos,
    compromiso: compromisoVigente ? { fechaLimite: formatearFecha(ficha.fechaCompromiso) } : null,
    pagos: pagosVigentes(ficha).map((pago) => ({
      fechaPago: formatearFecha(pago.fechaPago),
      numeroRecibo: textoOVacio(pago.numeroRecibo),
      concepto: ETIQUETAS.concepto[pago.concepto] ?? textoOVacio(pago.concepto),
      metodoPago: textoOVacio(pago.metodoPagoNombre),
      monto: Number(pago.monto) || 0
    })),
    resumenPagos: {
      // Texto (en vez de un importe) cuando el costo del curso se paga a la entidad externa
      costoCursoExterno: textoCostoCursoExterno(ficha),
      costoCurso: Number(ficha.montoObligatorio) || 0,
      costoMatricula: Number(ficha.montoMatricula) || 0,
      totalPagado: Number(ficha.totalPagado) || 0,
      saldo: Number(ficha.saldo) || 0
    }
  };
}

/**
 * Payload del Recibo de Pago de UN pago de la inscripción. El saldo se calcula en
 * el momento de ese pago (considera solo los pagos anteriores y el propio), no el
 * saldo actual de la inscripción.
 *
 * @param {Object} ficha - Salida de GetInscripcionCapacitacionByIdUseCase.
 * @param {number|string} pagoId
 * @returns {Object|null} Payload para `generarRecibo`; `null` si el pago no pertenece a la ficha.
 */
export function construirDatosReciboPago(ficha, pagoId) {
  const pagos = pagosVigentes(ficha);
  const indice = pagos.findIndex((pago) => Number(pago.id) === Number(pagoId));
  if (indice < 0) return null;

  const pago = pagos[indice];
  const hastaEstePago = pagos.slice(0, indice + 1);
  const esMatricula = pago.concepto === 'MATRICULA';
  const totales = {
    CURSO: Number(ficha.montoObligatorio) || 0,
    MATRICULA: Number(ficha.montoMatricula) || 0
  };
  const costoCursoExterno = textoCostoCursoExterno(ficha);
  const saldoDe = (concepto) =>
    // El costo externo del curso no es un cobro del instituto: no genera saldo en el recibo
    concepto === 'CURSO' && costoCursoExterno
      ? 0
      : Math.max(
          0,
          aCentavos(totales[concepto]) - sumaCentavos(hastaEstePago.filter((p) => p.concepto === concepto))
        );

  const conceptoPago = esMatricula ? 'MATRICULA' : 'CURSO';
  const pagadoAntes = sumaCentavos(
    pagos.slice(0, indice).filter((p) => p.concepto === conceptoPago)
  );
  const cuenta = [pago.cuentaPagoTitular, pago.cuentaPagoNumero].map(textoOVacio).filter(Boolean).join(' · ');

  return {
    codigoRecibo: `CAP-${anioDe(pago.fechaPago)}`,
    numeroRecibo: textoOVacio(pago.numeroRecibo),
    fechaPago: formatearFecha(pago.fechaPago),
    gestion: anioDe(pago.fechaPago),
    instituto: INSTITUTO,
    codigoInscripcion: codigoInscripcion(ficha.id),
    participante: {
      nombreCompleto: textoOVacio(ficha.participanteNombreCompleto),
      ci: [ficha.participanteCi, ficha.participanteExpedicion].map(textoOVacio).filter(Boolean).join(' ')
    },
    curso: {
      titulo: textoOVacio(ficha.capacitacionTitulo),
      grupo: textoOVacio(ficha.grupoNombre),
      horarios: textoOVacio(ficha.grupoHorariosEtiqueta),
      entidadCertificadora: textoOVacio(ficha.capacitacionEntidadCertificadora)
    },
    costoCursoExterno,
    concepto: conceptoPago,
    conceptoEtiqueta: ETIQUETAS.concepto[conceptoPago],
    metodoPago: textoOVacio(pago.metodoPagoNombre),
    cuenta,
    montoPago: Number(pago.monto) || 0,
    totalConcepto: totales[conceptoPago],
    pagadoAntes: deCentavos(pagadoAntes),
    saldoConcepto: deCentavos(saldoDe(conceptoPago)),
    saldoTotal: deCentavos(saldoDe('CURSO') + saldoDe('MATRICULA')),
    observacion: textoOVacio(pago.observaciones)
  };
}

/** Nombre de archivo del formulario: Formulario_Inscripcion_<participante>_<curso>.pdf */
export function nombreArchivoFormulario(datos) {
  return `Formulario_Inscripcion_${sanitizarFilePart(datos.participante.nombreCompleto)}_${sanitizarFilePart(
    datos.curso.titulo
  )}.pdf`;
}

/** Nombre de archivo del recibo: Recibo_<numero>_<participante>.pdf */
export function nombreArchivoRecibo(datos) {
  return `Recibo_${sanitizarFilePart(datos.numeroRecibo)}_${sanitizarFilePart(
    datos.participante.nombreCompleto
  )}.pdf`;
}
