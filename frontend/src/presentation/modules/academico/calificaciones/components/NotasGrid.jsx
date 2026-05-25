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
import NotaCell from './NotaCell.jsx';

const BimestreGrupoHead = ({
  titulo,
  soloLectura,
  onGuardarBimestre,
  guardandoBimestre,
  mostrarGuardar,
}) => (
  <div className="cal-notas-grid__bim-head cal-notas-grid__bim-head--activo">
    <span className="cal-notas-grid__bim-titulo-row">
      <span className="cal-notas-grid__bim-titulo">{titulo}</span>
      {!soloLectura && onGuardarBimestre && mostrarGuardar ? (
        <Tooltip title="Guardar notas en la base de datos y recalcular bimestre y nota final">
          <Button
            variant="warning"
            size="small"
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

const EvaluacionColumnHead = ({
  ev,
  soloLectura,
  onEditarEvaluacion,
  onResetEvaluacion,
  onEliminarEvaluacion,
}) => {
  if (soloLectura) {
    return (
      <div className="cal-notas-grid__eval-head">
        <span className="cal-notas-grid__col-head-text">{ev.nombre}</span>
      </div>
    );
  }

  const menuItems = [
    {
      key: 'editar',
      label: 'Editar evaluación',
      icon: <EditOutlined />,
    },
    {
      key: 'reset',
      label: 'Restablecer notas',
      icon: <RedoOutlined />,
      danger: true,
    },
    {
      key: 'eliminar',
      label: 'Eliminar evaluación',
      icon: <DeleteOutlined />,
      danger: true,
    },
  ];

  const onMenuClick = ({ key, domEvent }) => {
    domEvent?.stopPropagation();
    if (key === 'editar') onEditarEvaluacion?.(ev);
    if (key === 'reset') onResetEvaluacion?.(ev);
    if (key === 'eliminar') onEliminarEvaluacion?.(ev);
  };

  return (
    <div className="cal-notas-grid__eval-head">
      <div className="cal-notas-grid__eval-head-row">
        <span className="cal-notas-grid__col-head-text" title={ev.nombre}>
          {ev.nombre}
          {ev.puntos != null ? (
            <span className="cal-notas-grid__col-puntos"> ({ev.puntos} pts)</span>
          ) : null}
        </span>
        <Dropdown
          menu={{ items: menuItems, onClick: onMenuClick }}
          trigger={['click']}
          placement="bottomRight"
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
    </div>
  );
};

const renderEstudiante = (nombre, row) => (
  <span className="cal-notas-grid__estudiante">
    <span className="cal-notas-grid__margen" aria-hidden />
    <span className="cal-notas-grid__estudiante-texto">
      {row.codigo ? <span className="cal-notas-grid__codigo">{row.codigo}</span> : null}
      <span className="cal-notas-grid__nombre">{nombre}</span>
    </span>
  </span>
);

/** Anchos fijos de identificación; el resto del ancho va al grupo bimestre. */
const ANCHO_COL_NRO = 44;
const ANCHO_COL_ESTUDIANTE = 300;
const ANCHO_COL_EVAL = 160;
const ANCHO_COL_EVAL_MAX = 200;
const ANCHO_COL_AGREGAR = 56;

const NotasGrid = ({
  cursoId,
  bimestre,
  bimestreTitulo = 'Bimestre',
  estudiantes = [],
  evaluaciones = [],
  soloLectura = true,
  onAgregarEvaluacion,
  onEditarEvaluacion,
  onResetEvaluacion,
  onEliminarEvaluacion,
  onGuardarBimestre,
  guardandoBimestre = false,
  mostrarGuardar = false,
  enteringColumnIds = [],
  removingColumnId = null,
}) => {
  const thEst = () => ({ className: 'cal-notas-grid__th-est' });
  const thSubEval = () => ({ className: 'cal-notas-grid__th-sub cal-notas-grid__th-sub--eval' });
  const thSubHint = () => ({ className: 'cal-notas-grid__th-sub cal-notas-grid__th-sub--hint' });
  const fijarColumnaEstudiante = evaluaciones.length >= 4;

  const columnasEval = evaluaciones.map((ev) => {
    const colClass = [
      'cal-notas-grid__col-eval',
      enteringColumnIds.includes(ev.id) ? 'cal-col--enter' : '',
      removingColumnId === ev.id ? 'cal-col--leave' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return {
      title: (
        <EvaluacionColumnHead
          ev={ev}
          soloLectura={soloLectura}
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
          soloLectura={soloLectura}
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
        aria-label="Agregar evaluación"
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
    title: null,
    key: 'bim-espacio',
    className: 'cal-notas-grid__col-bim-espacio',
    onHeaderCell: thSubHint,
    onCell: () => ({ className: 'cal-notas-grid__col-bim-espacio' }),
    render: () => null,
  };

  const columnaHintAgregar = {
    title: (
      <span className="cal-notas-grid__hint-agregar">
        Presioná <PlusOutlined aria-hidden /> para agregar evaluaciones
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
        soloLectura={soloLectura}
        onGuardarBimestre={onGuardarBimestre}
        guardandoBimestre={guardandoBimestre}
        mostrarGuardar={mostrarGuardar}
      />
    ),
    className: 'cal-notas-grid__th-bim cal-notas-grid__th-bim--activo',
    onHeaderCell: () => ({ className: 'cal-notas-grid__th-bim cal-notas-grid__th-bim--activo' }),
    children:
      evaluaciones.length > 0
        ? [...columnasEval, columnaEspacioBimestre, columnaAgregar]
        : [columnaHintAgregar, columnaAgregar],
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
      ellipsis: true,
      className: 'cal-notas-grid__col-estudiante',
      onHeaderCell: thEst,
      render: renderEstudiante,
    },
    grupoBimestre,
  ];

  const anchoFijoIzquierda = ANCHO_COL_NRO + ANCHO_COL_ESTUDIANTE;
  const anchoMinimoBimestre =
    evaluaciones.length * ANCHO_COL_EVAL + ANCHO_COL_AGREGAR + 80;
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
