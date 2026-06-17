/**
 * Grilla semanal de asistencia (organismo, gemelo de NotasGrid del cuaderno).
 *
 * Estructura espejo del cuaderno: columnas fijas Nro + Estudiante y un grupo "Semana"
 * con una sub-columna por cada día lun–sáb del rango. Cada sub-columna se pinta según
 * su naturaleza:
 *   - día de clase: color primario (si es futuro, primario atenuado tipo disabled).
 *   - feriado / clase no dictada: rojo.
 *   - día hábil sin clase: gris, con botón + para habilitar una sesión especial.
 * El botón de guardar vive en la cabecera del grupo "Semana" y se habilita al haber
 * cambios. La lógica de marca (P/R/F) se delega en `onToggleCelda` (state hook).
 */
import { MedicineBoxOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { Table, Tooltip } from 'antd';
import { Button, IconButton, IdentidadCelda } from '@atoms';
import CeldaAsistencia from './CeldaAsistencia.jsx';
import {
  etiquetaDiaCorto,
  etiquetaDiaMes,
  numeroDia,
  tituloSemana,
} from '@application-academico/asistencia/utils/asistenciaFechas.js';
import { celdaEditable } from '@application-academico/asistencia/utils/asistenciaMarcas.js';

/** Anchos fijos (mismos criterios que el cuaderno de notas). */
const ANCHO_COL_NRO = 56;
const ANCHO_COL_ESTUDIANTE = 320;
const ANCHO_COL_DIA = 92;

/** Clase de color de la columna del día según su naturaleza. */
const claseColumnaDia = (dia) => {
  if (dia.neutro) return 'asi-grid__col-dia--rojo';
  if (!dia.esDiaClase) return 'asi-grid__col-dia--gris';
  if (dia.esFuturo) return 'asi-grid__col-dia--clase-futuro';
  return 'asi-grid__col-dia--clase';
};

const SemanaGrupoHead = ({ rango, onGuardar, guardando, mostrarGuardar }) => {
  const titulo =
    rango?.desde && rango?.hasta ? tituloSemana(rango.desde, rango.hasta) : 'Semana';
  return (
    <div className="asi-grid__bim-head asi-grid__bim-head--activo">
      <span className="asi-grid__bim-titulo-row">
        <span className="asi-grid__bim-titulo">{titulo}</span>
        {onGuardar && mostrarGuardar ? (
          <Tooltip title="Guardar las marcas de asistencia de la semana">
            <Button
              variant="warning"
              icon={<SaveOutlined />}
              loading={guardando}
              disabled={guardando}
              onClick={(e) => {
                e.stopPropagation();
                onGuardar();
              }}
            >
              Guardar
            </Button>
          </Tooltip>
        ) : null}
      </span>
    </div>
  );
};

const ColumnaDiaHead = ({ dia, puedeAgregar, onHabilitarEspecial }) => (
  <div className="asi-grid__col-head">
    <span className="asi-grid__col-head-dow">
      {etiquetaDiaCorto(dia.fechaClase)}
    </span>
    <span className="asi-grid__col-head-num">{numeroDia(dia.fechaClase)}</span>
    {puedeAgregar ? (
      <Tooltip title="Habilitar asistencia especial este día">
        <button
          type="button"
          className="asi-grid__add-especial"
          aria-label={`Habilitar asistencia especial el ${etiquetaDiaMes(dia.fechaClase)}`}
          onClick={(e) => {
            e.stopPropagation();
            onHabilitarEspecial?.(dia.fechaClase);
          }}
        >
          <PlusOutlined aria-hidden />
        </button>
      </Tooltip>
    ) : null}
  </div>
);

/**
 * Render de la columna "Estudiante": identidad + (opcional) acceso directo a solicitar
 * licencia. El botón se muestra solo si `onSolicitarLicencia` está definido (gateado por
 * permiso desde la página); usa `stopPropagation` igual que el botón + de día especial.
 */
const renderEstudiante = (onSolicitarLicencia) => (_, row) => (
  <span className="asi-grid__est">
    <IdentidadCelda codigo={row.estudianteCodigo} nombre={row.estudianteNombre} />
    {onSolicitarLicencia ? (
      <Tooltip title="Solicitar licencia para este estudiante">
        <IconButton
          variant="info"
          className="asi-grid__lic-btn"
          aria-label={`Solicitar licencia para ${row.estudianteNombre}`}
          icon={<MedicineBoxOutlined aria-hidden />}
          onClick={(e) => {
            e.stopPropagation();
            onSolicitarLicencia(row);
          }}
        />
      </Tooltip>
    ) : null}
  </span>
);

const GrillaAsistenciaSemanal = ({
  dias = [],
  filas = [],
  hoy = null,
  rangoSemana = null,
  registroCerrado = false,
  puedeEditar = false,
  estadoCelda,
  onToggleCelda,
  onHabilitarEspecial,
  onSolicitarLicencia,
  onGuardar,
  guardando = false,
  hayCambios = false,
}) => {
  const fijarColumnaEstudiante = dias.length >= 4;

  const columnasDia = dias.map((dia) => {
    const colColor = claseColumnaDia(dia);
    const puedeAgregar =
      puedeEditar && !registroCerrado && Boolean(dia.puedeHabilitarEspecial);
    // Columna del día actual: contorno dashed primary continuo (toda la columna = hoy).
    const colHoy = hoy && dia.fechaClase === hoy ? ' asi-grid__col-dia--hoy' : '';

    return {
      title: (
        <ColumnaDiaHead
          dia={dia}
          puedeAgregar={puedeAgregar}
          onHabilitarEspecial={onHabilitarEspecial}
        />
      ),
      key: dia.fechaClase,
      width: ANCHO_COL_DIA,
      align: 'center',
      className: `asi-grid__col-dia ${colColor}${colHoy}`,
      onHeaderCell: () => ({
        className: `asi-grid__th-sub asi-grid__col-dia ${colColor}${colHoy}`,
      }),
      onCell: () => ({ className: `asi-grid__col-dia ${colColor}${colHoy}` }),
      render: (_, row) => {
        // Día sin clase o feriado/clase no dictada: solo un guion, no se marca.
        if (dia.neutro || !dia.esDiaClase) {
          return (
            <span
              className="asi-celda asi-celda--vacia"
              aria-label="Día sin asistencia"
            >
              <span className="asi-celda__marca">—</span>
            </span>
          );
        }

        const celda = row.diasPorFecha.get(dia.fechaClase) ?? null;
        const estadoBackend = celda?.estado ?? null;
        const editable = celdaEditable({
          esDiaClase: dia.esDiaClase,
          neutro: celda?.neutro ?? dia.neutro,
          esFuturo: dia.esFuturo,
          registroCerrado,
        });
        return (
          <CeldaAsistencia
            estado={estadoCelda(
              row.matriculaMateriaId,
              dia.fechaClase,
              estadoBackend
            )}
            neutro={celda?.neutro ?? dia.neutro}
            futuro={dia.esFuturo}
            editable={editable}
            estudianteNombre={row.estudianteNombre}
            fecha={dia.fechaClase}
            onToggle={() =>
              onToggleCelda(
                row.matriculaMateriaId,
                dia.fechaClase,
                estadoBackend
              )
            }
          />
        );
      },
    };
  });

  const grupoSemana = {
    title: (
      <SemanaGrupoHead
        rango={rangoSemana}
        onGuardar={onGuardar}
        guardando={guardando}
        mostrarGuardar={hayCambios}
      />
    ),
    className: 'asi-grid__th-bim asi-grid__th-bim--activo',
    onHeaderCell: () => ({
      className: 'asi-grid__th-bim asi-grid__th-bim--activo',
    }),
    children: columnasDia,
  };

  const columns = [
    {
      title: 'Nro',
      dataIndex: 'nro',
      key: 'nro',
      width: ANCHO_COL_NRO,
      fixed: 'left',
      align: 'center',
      className: 'asi-grid__col-nro',
      onHeaderCell: () => ({ className: 'asi-grid__th-est' }),
      onCell: () => ({ className: 'asi-grid__col-nro' }),
    },
    {
      title: 'Estudiante',
      key: 'estudiante',
      width: ANCHO_COL_ESTUDIANTE,
      ...(fijarColumnaEstudiante ? { fixed: 'left' } : {}),
      className: 'asi-grid__col-estudiante',
      onHeaderCell: () => ({ className: 'asi-grid__th-est' }),
      onCell: () => ({ className: 'asi-grid__col-estudiante' }),
      render: renderEstudiante(onSolicitarLicencia),
    },
    grupoSemana,
  ];

  // Pre-indexa los días por fecha en cada fila para acceso O(1) en el render de columnas.
  const dataSource = filas.map((fila, idx) => ({
    ...fila,
    key: fila.matriculaMateriaId,
    nro: idx + 1,
    diasPorFecha: new Map((fila.dias ?? []).map((d) => [d.fechaClase, d])),
  }));

  const anchoMinimoTabla =
    ANCHO_COL_NRO + ANCHO_COL_ESTUDIANTE + dias.length * ANCHO_COL_DIA;
  const requiereScroll = anchoMinimoTabla > 720;

  return (
    <div className="asi-grid-wrap">
      <Table
        className="asi-grid asi-grid--consolidado-style"
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        size="small"
        bordered
        tableLayout="fixed"
        scroll={requiereScroll ? { x: anchoMinimoTabla } : undefined}
        locale={{ emptyText: 'Sin estudiantes matriculados en el curso' }}
      />
    </div>
  );
};

export default GrillaAsistenciaSemanal;
