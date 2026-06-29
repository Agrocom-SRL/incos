/**
 * Grilla del cuaderno — estilo cabecera consolidado (verde oscuro) + bimestre agrupado.
 */

import {
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
  PlusOutlined,
  RedoOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { Dropdown, Table, Tooltip } from 'antd';
import { Button } from '@atoms';
import { useTiposEvaluacion } from '@application-academico/calificaciones/hooks/useTiposEvaluacion.js';
import {
  esEvaluacionAsistencia,
  resolverTipoEvaluacionAsistenciaId,
} from '@application-academico/calificaciones/utils/tipoEvaluacionAsistencia.js';
import NotaCell from './NotaCell.jsx';
import CeldaEstudiante from './CeldaEstudiante.jsx';

const BimestreGrupoHead = ({
  titulo,
  onGuardarBimestre,
  guardandoBimestre,
  mostrarGuardar,
}) => (
  <div className="cal-notas-grid__bim-head cal-notas-grid__bim-head--activo">
    <span className="cal-notas-grid__bim-titulo-row">
      <span className="cal-notas-grid__bim-titulo">{titulo}</span>
      {onGuardarBimestre && mostrarGuardar ? (
        <Tooltip title="Guardar notas en la base de datos y recalcular bimestre y nota final">
          <Button
            variant="warning"
            icon={<SaveOutlined />}
            loading={guardandoBimestre}
            disabled={guardandoBimestre}
            onClick={(e) => {
              e.stopPropagation();
              onGuardarBimestre();
            }}
          >
            Guardar notas
          </Button>
        </Tooltip>
      ) : null}
    </span>
  </div>
);

const EvaluacionTitulo = ({ nombre }) => (
  <Tooltip title={nombre} placement="top">
    <div className="cal-notas-grid__col-head-tooltip">
      <span className="cal-notas-grid__col-head-text">{nombre}</span>
    </div>
  </Tooltip>
);

const EvaluacionColumnHead = ({
  ev,
  onEditarEvaluacion,
  onResetEvaluacion,
  onEliminarEvaluacion,
}) => {
  const menuItems = [
    onEditarEvaluacion
      ? {
          key: 'editar',
          label: 'Editar actividad',
          icon: <EditOutlined />,
        }
      : null,
    onResetEvaluacion
      ? {
          key: 'reset',
          label: 'Restablecer notas',
          icon: <RedoOutlined />,
          className: 'cal-notas-grid__menu-item--warning',
        }
      : null,
    onEliminarEvaluacion
      ? {
          key: 'eliminar',
          label: 'Eliminar actividad',
          icon: <DeleteOutlined />,
          danger: true,
        }
      : null,
  ].filter(Boolean);

  if (menuItems.length === 0) {
    return (
      <div className="cal-notas-grid__eval-head">
        <EvaluacionTitulo nombre={ev.nombre} />
        {ev.puntos != null ? (
          <span className="cal-notas-grid__col-ponderacion">{ev.puntos} pts</span>
        ) : null}
      </div>
    );
  }

  const onMenuClick = ({ key, domEvent }) => {
    domEvent?.stopPropagation();
    if (key === 'editar') onEditarEvaluacion?.(ev);
    if (key === 'reset') onResetEvaluacion?.(ev);
    if (key === 'eliminar') onEliminarEvaluacion?.(ev);
  };

  return (
    <div className="cal-notas-grid__eval-head">
      <div className="cal-notas-grid__eval-head-row">
        <EvaluacionTitulo nombre={ev.nombre} />
        <Dropdown
          menu={{ items: menuItems, onClick: onMenuClick }}
          trigger={['click']}
          placement="bottomRight"
          classNames={{ root: 'cal-notas-grid__eval-menu-dropdown' }}
        >
          <button
            type="button"
            className="cal-notas-grid__eval-menu-btn"
            aria-label={`Opciones de ${ev.nombre}`}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreOutlined aria-hidden />
          </button>
        </Dropdown>
      </div>
      {ev.puntos != null ? (
        <span className="cal-notas-grid__col-ponderacion">{ev.puntos} pts</span>
      ) : null}
    </div>
  );
};

const renderEstudiante = (nombre, row) => (
  <CeldaEstudiante nombre={nombre} codigo={row.codigo} />
);

/**
 * Banda de color de la cabecera según el componente de la actividad, espejo de la
 * paleta del export Excel (teórico verde, práctico ámbar) más el magenta reservado
 * para la actividad especial calculada por asistencia.
 */
const componenteHeadClass = (ev, esAsistencia) => {
  if (esAsistencia) return 'cal-notas-grid__col-eval--asistencia';
  if (ev?.componente === 'TEORICO') return 'cal-notas-grid__col-eval--teorico';
  if (ev?.componente === 'PRACTICO') return 'cal-notas-grid__col-eval--practico';
  return '';
};

/** Anchos fijos de identificación; el resto del ancho va al grupo bimestre. */
const ANCHO_COL_NRO = 64;
const ANCHO_COL_ESTUDIANTE = 340;
const ANCHO_COL_EVAL = 200;
const ANCHO_COL_EVAL_MAX = 300;
const ANCHO_COL_AGREGAR = 56;

const NotasGrid = ({
  bimestreTitulo = 'Bimestre',
  estudiantes = [],
  evaluaciones = [],
  soloLectura = true,
  soloLecturaNotas,
  onAgregarEvaluacion,
  onEditarEvaluacion,
  onResetEvaluacion,
  onEliminarEvaluacion,
  onGuardarBimestre,
  guardandoBimestre = false,
  mostrarGuardar = false,
  ocultarHintAgregar = false,
  enteringColumnIds = [],
  removingColumnId = null,
}) => {
  const thEst = () => ({ className: 'cal-notas-grid__th-est' });
  const thSubEval = () => ({ className: 'cal-notas-grid__th-sub cal-notas-grid__th-sub--eval' });
  const thSubHint = () => ({ className: 'cal-notas-grid__th-sub cal-notas-grid__th-sub--hint' });
  const fijarColumnaEstudiante = evaluaciones.length >= 4;
  const lecturaNotas = soloLecturaNotas ?? soloLectura;
  const permitirAgregar = Boolean(onAgregarEvaluacion);

  // El cuaderno no marca la columna de asistencia; la reconocemos cruzando el
  // `tipoEvaluacionId` con el catálogo (su nota la calcula y la pisa el backend).
  const { tipos } = useTiposEvaluacion();
  const tipoAsistenciaId = resolverTipoEvaluacionAsistenciaId(tipos);

  const columnasEval = evaluaciones.map((ev) => {
    const esAsistencia = esEvaluacionAsistencia(ev, tipoAsistenciaId);
    const colClass = [
      'cal-notas-grid__col-eval',
      componenteHeadClass(ev, esAsistencia),
      enteringColumnIds.includes(ev.id) ? 'cal-col--enter' : '',
      removingColumnId === ev.id ? 'cal-col--leave' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return {
      title: (
        <EvaluacionColumnHead
          ev={ev}
          onEditarEvaluacion={onEditarEvaluacion}
          onResetEvaluacion={onResetEvaluacion}
          onEliminarEvaluacion={onEliminarEvaluacion}
        />
      ),
      key: ev.id,
      width: ANCHO_COL_EVAL,
      align: 'center',
      className: colClass,
      onHeaderCell: thSubEval,
      onCell: () => ({ className: colClass }),
      render: (_, row) => (
        <NotaCell
          estudianteId={row.id}
          evaluacionId={ev.id}
          puntosMaximos={ev.puntos}
          valorInicial={row.notas?.[ev.id]}
          soloLectura={lecturaNotas || esAsistencia}
          autoCalculada={esAsistencia}
        />
      ),
    };
  });

  const columnaAgregar = {
    title: (
      <button
        type="button"
        className="cal-notas-grid__add-header cal-notas-grid__add-header--clickable"
        onClick={onAgregarEvaluacion}
        disabled={!onAgregarEvaluacion}
        aria-label="Agregar actividad"
      >
        <PlusOutlined aria-hidden />
      </button>
    ),
    key: 'agregar',
    width: ANCHO_COL_AGREGAR,
    align: 'center',
    className: 'cal-notas-grid__col-add',
    onHeaderCell: thSubEval,
    onCell: () => ({ className: 'cal-notas-grid__col-add' }),
    render: () => null,
  };

  const columnaEspacioBimestre = {
    title: permitirAgregar && !ocultarHintAgregar ? (
      <span className="cal-notas-grid__hint-agregar">
        Presioná <PlusOutlined aria-hidden /> para agregar actividades
      </span>
    ) : null,
    key: 'bim-espacio',
    className: 'cal-notas-grid__col-bim-espacio',
    onHeaderCell: thSubHint,
    onCell: () => ({ className: 'cal-notas-grid__col-bim-espacio' }),
    render: () => null,
  };

  const columnaHintAgregar = {
    title: (
      <span className="cal-notas-grid__hint-agregar">
        Presioná <PlusOutlined aria-hidden /> para agregar actividades
      </span>
    ),
    key: 'hint-agregar',
    className: 'cal-notas-grid__col-hint',
    onHeaderCell: thSubHint,
    onCell: () => ({ className: 'cal-notas-grid__col-hint' }),
    render: () => null,
  };

  const grupoBimestre = {
    title: (
      <BimestreGrupoHead
        titulo={bimestreTitulo}
        onGuardarBimestre={onGuardarBimestre}
        guardandoBimestre={guardandoBimestre}
        mostrarGuardar={mostrarGuardar}
      />
    ),
    className: 'cal-notas-grid__th-bim cal-notas-grid__th-bim--activo',
    onHeaderCell: () => ({ className: 'cal-notas-grid__th-bim cal-notas-grid__th-bim--activo' }),
    children: permitirAgregar
      ? evaluaciones.length > 0
        ? [...columnasEval, columnaEspacioBimestre, columnaAgregar]
        : [columnaHintAgregar, columnaAgregar]
      : evaluaciones.length > 0
        ? columnasEval
        : [],
  };

  const columns = [
    {
      title: 'Nro',
      dataIndex: 'nro',
      key: 'nro',
      width: ANCHO_COL_NRO,
      fixed: 'left',
      align: 'center',
      className: 'cal-notas-grid__col-nro',
      onHeaderCell: thEst,
      onCell: () => ({ className: 'cal-notas-grid__col-nro' }),
    },
    {
      title: 'Estudiante',
      dataIndex: 'nombre',
      key: 'estudiante',
      width: ANCHO_COL_ESTUDIANTE,
      ...(fijarColumnaEstudiante ? { fixed: 'left' } : {}),
      className: 'cal-notas-grid__col-estudiante',
      onHeaderCell: thEst,
      onCell: () => ({ className: 'cal-notas-grid__col-estudiante' }),
      render: renderEstudiante,
    },
    grupoBimestre,
  ];

  const anchoFijoIzquierda = ANCHO_COL_NRO + ANCHO_COL_ESTUDIANTE;
  const anchoMinimoBimestre =
    evaluaciones.length * ANCHO_COL_EVAL +
    (permitirAgregar ? ANCHO_COL_AGREGAR : 0) +
    80;
  const anchoMinimoTabla = anchoFijoIzquierda + anchoMinimoBimestre;
  const requiereScroll = anchoMinimoTabla > 720;

  return (
    <div
      className="cal-notas-grid-wrap"
      style={{ '--cal-col-eval-max': `${ANCHO_COL_EVAL_MAX}px` }}
    >
      <Table
        className="cal-notas-grid cal-notas-grid--consolidado-style"
        columns={columns}
        dataSource={estudiantes.map((e) => ({ ...e, key: e.id }))}
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

export default NotasGrid;
