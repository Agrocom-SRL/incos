/**
 * Drawer crear / editar actividad del bimestre — estilo cal-ajustes-drawer.
 */

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  App,
  Button,
  DatePicker,
  Drawer,
  Form,
  InputNumber,
  Modal,
  Segmented,
  Select,
  Space,
} from 'antd';
import { FieldTextarea } from '@atoms';
import {
  CalculatorOutlined,
  CalendarOutlined,
  CheckOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  PieChartOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useTiposEvaluacion } from '@application-academico/calificaciones/hooks/useTiposEvaluacion.js';
import {
  calcularSumaPuntosComponente,
  contarNotasCargadas,
} from '@application-academico/calificaciones/utils/puntosEvaluaciones.js';
import { resolverTipoEvaluacionAsistenciaId } from '@application-academico/calificaciones/utils/tipoEvaluacionAsistencia.js';
import SeccionAjustes from './ajustes/SeccionAjustes.jsx';
import {
  CALIFICACIONES_DRAWER_Z_INDEX,
  calificacionesDrawerClassNames,
  calificacionesDrawerRootClassName,
  calificacionesDrawerSectionClassName,
  calificacionesDrawerStyles,
  calificacionesDrawerTarjetaClassName,
} from '../utils/calificacionesDrawerLayout.js';

const COMPONENTE_DEFAULT = 'PRACTICO';

const COMPONENTES = [
  { label: 'Práctico', value: 'PRACTICO' },
  { label: 'Teórico', value: 'TEORICO' },
];

const CuotaActividadProgress = memo(({
  componente,
  cuotaComponente,
  sumaOtrasActividades,
  puntosActividad,
}) => {
  const etiqueta = componente === 'PRACTICO' ? 'Práctico' : 'Teórico';
  const cuota = Math.max(1, Math.round(Number(cuotaComponente) || 1));
  const sumaOtras = Math.max(0, Math.round(Number(sumaOtrasActividades) || 0));

  const puntosRaw = Number(puntosActividad);
  const puntosEsta = Number.isFinite(puntosRaw) && puntosRaw > 0 ? puntosRaw : 0;

  const sumaTotal = sumaOtras + puntosEsta;
  const maxParaEsta = Math.max(0, cuota - sumaOtras);
  const restanteEsta = Math.max(0, maxParaEsta - puntosEsta);
  const excede = sumaTotal > cuota;

  let pctOtras;
  let pctEsta;
  let pctExceso;

  if (excede) {
    const excesoPts = sumaTotal - cuota;
    const estaEnCuota = Math.min(puntosEsta, Math.max(0, cuota - sumaOtras));
    pctOtras = (sumaOtras / sumaTotal) * 100;
    pctEsta = (estaEnCuota / sumaTotal) * 100;
    pctExceso = (excesoPts / sumaTotal) * 100;
  } else {
    pctOtras = (sumaOtras / cuota) * 100;
    pctEsta = (puntosEsta / cuota) * 100;
    pctExceso = 0;
  }

  pctOtras = Math.min(100, Math.max(0, pctOtras));
  pctEsta = Math.min(100, Math.max(0, pctEsta));
  pctExceso = Math.min(100, Math.max(0, pctExceso));

  const estado = excede ? 'warn' : sumaTotal === cuota ? 'ok-full' : 'ok';

  return (
    <div className={`cal-eval-drawer__cuota cal-eval-drawer__cuota--${estado}`}>
      <div className="cal-eval-drawer__cuota-header">
        <span className="cal-eval-drawer__cuota-titulo">Componente {etiqueta}</span>
        <span className="cal-eval-drawer__cuota-total">
          <strong>{Math.round(sumaTotal)}</strong> / {cuota} pts
        </span>
      </div>

      <div
        className="cal-eval-drawer__cuota-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={cuota}
        aria-valuenow={Math.min(Math.round(sumaTotal), cuota)}
        aria-label={`Puntos asignados en el componente ${etiqueta}`}
      >
        <span
          className="cal-eval-drawer__cuota-fill cal-eval-drawer__cuota-fill--otras"
          style={{ width: `${pctOtras}%` }}
        />
        <span
          className="cal-eval-drawer__cuota-fill cal-eval-drawer__cuota-fill--esta"
          style={{ width: `${pctEsta}%` }}
        />
        {excede ? (
          <span
            className="cal-eval-drawer__cuota-fill cal-eval-drawer__cuota-fill--exceso"
            style={{ width: `${pctExceso}%` }}
          />
        ) : null}
      </div>

      <p className="cal-eval-drawer__cuota-meta">
        {excede ? (
          <>
            Superás la cuota del componente {etiqueta} por{' '}
            <strong className="cal-eval-drawer__cuota-restante">
              {Math.round(sumaTotal - cuota)} pts
            </strong>
            .
          </>
        ) : estado === 'ok-full' ? (
          <>
            <CheckOutlined className="cal-eval-drawer__cuota-icon" aria-hidden />
            Cuota del componente {etiqueta} completa ({cuota} pts).
          </>
        ) : (
          <>
            Podés asignar hasta <strong>{maxParaEsta} pts</strong> en esta evaluación
            {restanteEsta > 0 ? (
              <>
                {' '}
                · te quedan{' '}
                <strong className="cal-eval-drawer__cuota-disponible">
                  {Math.round(restanteEsta)} pts
                </strong>
              </>
            ) : null}
            .
          </>
        )}
      </p>
    </div>
  );
});

CuotaActividadProgress.displayName = 'CuotaActividadProgress';

const cuotaParaComponente = (componente, cuotaTeorico, cuotaPractico) =>
  componente === 'PRACTICO' ? Number(cuotaPractico) || 70 : Number(cuotaTeorico) || 30;

const ComponenteCuotaHint = memo(
  ({ form, cuotaTeorico, cuotaPractico, evaluacionesActuales, evaluacionIdExcluir }) => {
    const componenteActivo = Form.useWatch('componente', form) ?? COMPONENTE_DEFAULT;
    const cuotaComponente = cuotaParaComponente(componenteActivo, cuotaTeorico, cuotaPractico);
    const sumaOtrasActividades = calcularSumaPuntosComponente(
      evaluacionesActuales,
      componenteActivo,
      0,
      evaluacionIdExcluir,
    );

    return (
      <p className="cal-eval-drawer__cuota-hint">
        <InfoCircleOutlined aria-hidden />
        <span>
          Suma de otras actividades ya creadas: <strong>{sumaOtrasActividades} pts</strong> · cuota
          total: <strong>{cuotaComponente} pts</strong>
        </span>
      </p>
    );
  },
);

ComponenteCuotaHint.displayName = 'ComponenteCuotaHint';

const EvaluacionPuntosField = memo(
  ({ form, cuotaTeorico, cuotaPractico, evaluacionesActuales, evaluacionIdExcluir }) => {
    const componenteActivo = Form.useWatch('componente', form) ?? COMPONENTE_DEFAULT;
    const puntosWatch = Form.useWatch('puntos', form);
    const puntosActuales = Number(puntosWatch ?? 0) || 0;
    const cuotaComponente = cuotaParaComponente(componenteActivo, cuotaTeorico, cuotaPractico);
    const sumaOtrasActividades = calcularSumaPuntosComponente(
      evaluacionesActuales,
      componenteActivo,
      0,
      evaluacionIdExcluir,
    );
    const excedeCuotaInput =
      puntosActuales > 0 && sumaOtrasActividades + puntosActuales > cuotaComponente;

    return (
      <div className="cal-eval-drawer__puntos-item">
        <Form.Item
          label="Calificación de la evaluación"
          required
          className="cal-eval-drawer__puntos-field"
        >
          <Space.Compact block className="cal-eval-drawer__puntos-compact">
            <Form.Item
              name="puntos"
              noStyle
              validateTrigger={['onSubmit']}
              rules={[{ required: true, message: 'Ingresá los puntos' }]}
            >
              <InputNumber
                min={1}
                precision={0}
                step={1}
                className="cal-eval-drawer__puntos-input"
                status={excedeCuotaInput ? 'error' : undefined}
              />
            </Form.Item>
            <span className="cal-eval-drawer__puntos-suffix">pts</span>
          </Space.Compact>
        </Form.Item>
      </div>
    );
  },
);

EvaluacionPuntosField.displayName = 'EvaluacionPuntosField';

const CuotaProgressWatcher = memo(
  ({
    form,
    cuotaTeorico,
    cuotaPractico,
    evaluacionesActuales,
    evaluacionIdExcluir,
    onExcedeChange,
  }) => {
    const componenteActivo = Form.useWatch('componente', form) ?? COMPONENTE_DEFAULT;
    const puntosWatch = Form.useWatch('puntos', form);
    const puntosActuales = Number(puntosWatch ?? 0) || 0;
    const cuotaComponente = cuotaParaComponente(componenteActivo, cuotaTeorico, cuotaPractico);
    const sumaOtrasActividades = calcularSumaPuntosComponente(
      evaluacionesActuales,
      componenteActivo,
      0,
      evaluacionIdExcluir,
    );
    const excede =
      puntosActuales > 0 && sumaOtrasActividades + puntosActuales > cuotaComponente;

    useEffect(() => {
      onExcedeChange(excede);
    }, [excede, onExcedeChange]);

    return (
      <CuotaActividadProgress
        componente={componenteActivo}
        cuotaComponente={cuotaComponente}
        sumaOtrasActividades={sumaOtrasActividades}
        puntosActividad={puntosActuales}
      />
    );
  },
);

CuotaProgressWatcher.displayName = 'CuotaProgressWatcher';

const ComponenteEvaluacionesFields = memo(
  ({
    form,
    cuotaTeorico,
    cuotaPractico,
    evaluacionesActuales,
    evaluacionIdExcluir,
    onExcedeChange,
    esAsistencia,
  }) => (
    <>
      {esAsistencia ? (
        <Alert
          type="info"
          showIcon
          icon={<CalculatorOutlined />}
          title="Actividad calculada desde la asistencia"
          description="La nota de cada estudiante se calcula automáticamente al guardar o cerrar el bimestre (porcentaje de asistencia × puntos) y no se edita a mano en el cuaderno. Esta actividad siempre forma parte del componente práctico; los puntos definen solo cuánto pondera dentro de ese componente."
          className="cal-eval-drawer__alert cal-eval-drawer__alert--asistencia"
        />
      ) : null}

      <Form.Item
        name="componente"
        label="Componente"
        rules={[{ required: true, message: 'Seleccioná un componente' }]}
        extra={
          esAsistencia
            ? 'Fijo en práctico: la actividad de asistencia siempre suma al componente práctico.'
            : undefined
        }
      >
        <Segmented
          options={COMPONENTES}
          block
          disabled={esAsistencia}
          className="cal-eval-drawer__segmented"
        />
      </Form.Item>

      <ComponenteCuotaHint
        form={form}
        cuotaTeorico={cuotaTeorico}
        cuotaPractico={cuotaPractico}
        evaluacionesActuales={evaluacionesActuales}
        evaluacionIdExcluir={evaluacionIdExcluir}
      />

      <EvaluacionPuntosField
        form={form}
        cuotaTeorico={cuotaTeorico}
        cuotaPractico={cuotaPractico}
        evaluacionesActuales={evaluacionesActuales}
        evaluacionIdExcluir={evaluacionIdExcluir}
      />

      <CuotaProgressWatcher
        form={form}
        cuotaTeorico={cuotaTeorico}
        cuotaPractico={cuotaPractico}
        evaluacionesActuales={evaluacionesActuales}
        evaluacionIdExcluir={evaluacionIdExcluir}
        onExcedeChange={onExcedeChange}
      />
    </>
  ),
);

ComponenteEvaluacionesFields.displayName = 'ComponenteEvaluacionesFields';

const EvaluacionDrawerFooter = ({
  esEditar,
  guardando,
  eliminando,
  excedeCuota,
  onCerrar,
  onGuardar,
  onEliminar,
}) => (
  <div className="cal-ajustes-drawer__footer cal-eval-drawer__footer">
    {esEditar ? (
      <Button
        variant="outlined"
        color="danger"
        icon={<DeleteOutlined />}
        onClick={onEliminar}
        loading={eliminando}
        disabled={guardando}
        className="cal-eval-drawer__btn-eliminar"
      >
        Eliminar
      </Button>
    ) : (
      <span className="cal-ajustes-drawer__footer-count cal-ajustes-drawer__footer-count--empty" />
    )}
    <div className="cal-ajustes-drawer__footer-actions cal-eval-drawer__footer-actions">
      <Button onClick={onCerrar} disabled={guardando || eliminando}>
        Cancelar
      </Button>
      <Button
        type="primary"
        className="cal-ajustes-drawer__btn-guardar cal-eval-drawer__btn-primary"
        loading={guardando}
        disabled={eliminando || excedeCuota}
        onClick={onGuardar}
      >
        {esEditar ? 'Guardar cambios' : 'Agregar actividad'}
      </Button>
    </div>
  </div>
);

const EvaluacionDrawer = ({
  abierto,
  modo,
  evaluacion = null,
  cursoId,
  bimestre,
  evaluacionesActuales = [],
  estudiantes = [],
  cuotaTeorico = 30,
  cuotaPractico = 70,
  onCerrar,
  onGuardado,
  onEliminado,
  crearEvaluacion,
  editarEvaluacion,
}) => {
  const { notification } = App.useApp();
  const [form] = Form.useForm();
  const { tipos, isLoading: tiposLoading } = useTiposEvaluacion();
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState(null);
  const [excedeCuota, setExcedeCuota] = useState(false);

  const esEditar = modo === 'editar';
  const componentePrevRef = useRef(COMPONENTE_DEFAULT);
  const evaluacionIdExcluir = esEditar ? evaluacion?.id : null;

  // El cuaderno no expone el código del tipo: lo resolvemos cruzando el catálogo.
  const tipoAsistenciaId = resolverTipoEvaluacionAsistenciaId(tipos);
  const tipoSeleccionado = Form.useWatch('tipoEvaluacionId', form);
  const esAsistencia = tipoAsistenciaId != null && tipoSeleccionado === tipoAsistenciaId;

  // La actividad de asistencia es ÚNICA por bimestre: si ya existe una (distinta de
  // la que se está editando), se OCULTA ese tipo en el selector (no aparece en la lista).
  const yaExisteAsistencia =
    tipoAsistenciaId != null &&
    evaluacionesActuales.some(
      (ev) => ev.tipoEvaluacionId === tipoAsistenciaId && ev.id !== evaluacionIdExcluir,
    );

  const handleExcedeChange = useCallback((excede) => {
    setExcedeCuota((prev) => (prev === excede ? prev : excede));
  }, []);

  useEffect(() => {
    if (!abierto) return;

    setErrorGuardado(null);
    setExcedeCuota(false);
    if (esEditar && evaluacion) {
      const valores = {
        tipoEvaluacionId: evaluacion.tipoEvaluacionId,
        nombre: evaluacion.nombre,
        componente: evaluacion.componente,
        puntos: Number(evaluacion.puntos) || undefined,
        fecha: evaluacion.fecha ? dayjs(evaluacion.fecha) : dayjs(),
      };
      form.setFieldsValue(valores);
      componentePrevRef.current = evaluacion.componente ?? COMPONENTE_DEFAULT;
    } else {
      form.resetFields();
      const valores = {
        componente: COMPONENTE_DEFAULT,
        fecha: dayjs(),
      };
      form.setFieldsValue(valores);
      componentePrevRef.current = COMPONENTE_DEFAULT;
    }
    setExcedeCuota(false);
  }, [abierto, esEditar, evaluacion, form]);

  // Al elegir el tipo ASISTENCIA, el componente queda fijo en PRÁCTICO (lo fuerza el
  // backend); reflejamos esa regla en el formulario para que el envío sea coherente.
  useEffect(() => {
    if (!abierto) return;
    if (esAsistencia && form.getFieldValue('componente') !== 'PRACTICO') {
      form.setFieldValue('componente', 'PRACTICO');
      componentePrevRef.current = 'PRACTICO';
      form.setFields([{ name: 'puntos', errors: [] }]);
    }
  }, [abierto, esAsistencia, form]);

  const handleValuesChange = (changed) => {
    if ('componente' in changed) {
      const next = changed.componente ?? COMPONENTE_DEFAULT;
      if (componentePrevRef.current !== next) {
        componentePrevRef.current = next;
        form.setFields([{ name: 'puntos', errors: [] }]);
      }
    }
  };

  const handleCerrar = () => {
    if (!guardando && !eliminando) onCerrar();
  };

  const construirPayload = (values) => ({
    tipoEvaluacionId: values.tipoEvaluacionId,
    nombre: values.nombre?.trim(),
    componente: values.componente,
    puntos: values.puntos,
    fecha: values.fecha ? values.fecha.format('YYYY-MM-DD') : null,
  });

  const handleGuardar = async () => {
    try {
      const values = await form.validateFields();
      const cuotaAlGuardar =
        values.componente === 'PRACTICO' ? Number(cuotaPractico) || 70 : Number(cuotaTeorico) || 30;
      const sumaOtrasAlGuardar = calcularSumaPuntosComponente(
        evaluacionesActuales,
        values.componente,
        0,
        esEditar ? evaluacion?.id : null,
      );
      const maxAlGuardar = Math.max(0, cuotaAlGuardar - sumaOtrasAlGuardar);
      const puntos = Number(values.puntos);

      if (!Number.isInteger(puntos) || puntos < 1) {
        form.setFields([{ name: 'puntos', errors: ['Los puntos deben ser un entero ≥ 1'] }]);
        return;
      }
      if (puntos > maxAlGuardar) {
        form.setFields([
          {
            name: 'puntos',
            errors: [
              maxAlGuardar > 0
                ? `Máximo ${maxAlGuardar} pts disponibles en este componente`
                : 'No quedan puntos disponibles en este componente',
            ],
          },
        ]);
        return;
      }

      setGuardando(true);
      setErrorGuardado(null);
      const payload = construirPayload(values);

      // La actividad de ASISTENCIA tiene nota calculada por el backend (round(%×puntos)):
      // al crear o cambiar sus puntos hay que recargar el cuaderno para traer las notas
      // recalculadas (no basta con parchear la columna en local).
      if (esEditar) {
        const actualizada = await editarEvaluacion(evaluacion.id, payload);
        notification.success({ title: 'Actividad actualizada' });
        onGuardado(actualizada, { recalcular: esAsistencia });
        onCerrar();
      } else {
        const creada = await crearEvaluacion(payload);
        notification.success({ title: 'Actividad creada' });
        onGuardado(creada, { recalcular: esAsistencia });
        onCerrar();
      }
    } catch (err) {
      if (err?.errorFields) return;
      setErrorGuardado(
        typeof err?.message === 'string' ? err.message : 'No se pudo guardar. Reintentar.',
      );
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminar = () => {
    const notasCount = contarNotasCargadas(estudiantes, evaluacion.id);
    const nombre = evaluacion.nombre;

    Modal.confirm({
      title: 'Eliminar actividad',
      okText: 'Eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      content:
        notasCount > 0 ? (
          <span>
            ¿Eliminar la actividad <strong>{nombre}</strong>? Se perderán{' '}
            <strong>{notasCount} notas</strong> ya cargadas. Esta acción no se puede deshacer.
          </span>
        ) : (
          <span>
            ¿Eliminar la actividad <strong>{nombre}</strong>? Esta acción no se puede deshacer.
          </span>
        ),
      onOk: async () => {
        setEliminando(true);
        try {
          await onEliminado(evaluacion.id);
          notification.success({ title: 'Actividad eliminada' });
          onCerrar();
        } catch (err) {
          setErrorGuardado(
            typeof err?.message === 'string' ? err.message : 'No se pudo eliminar. Reintentar.',
          );
        } finally {
          setEliminando(false);
        }
      },
    });
  };

  const tituloDrawer = esEditar ? 'Editar actividad' : 'Agregar actividad';

  return (
    <Drawer
      title={tituloDrawer}
      size={520}
      open={abierto}
      onClose={handleCerrar}
      destroyOnClose
      footer={
        <EvaluacionDrawerFooter
          esEditar={esEditar}
          guardando={guardando}
          eliminando={eliminando}
          excedeCuota={excedeCuota}
          onCerrar={handleCerrar}
          onGuardar={handleGuardar}
          onEliminar={confirmarEliminar}
        />
      }
      rootClassName={calificacionesDrawerRootClassName}
      className={`${calificacionesDrawerSectionClassName} cal-eval-drawer`}
      classNames={calificacionesDrawerClassNames}
      zIndex={CALIFICACIONES_DRAWER_Z_INDEX}
      styles={calificacionesDrawerStyles()}
    >
      {errorGuardado ? (
        <Alert
          type="error"
          showIcon
          title={errorGuardado}
          action={
            <Button size="small" type="link" onClick={handleGuardar}>
              Reintentar
            </Button>
          }
          className="cal-eval-drawer__alert"
        />
      ) : null}

      <Form
        form={form}
        layout="vertical"
        className="cal-ajustes-drawer__form cal-eval-drawer__form"
        onValuesChange={handleValuesChange}
      >
        <div className="cal-eval-drawer__bloques">
          <SeccionAjustes
            icon={TagsOutlined}
            titulo="Identificación"
            className={calificacionesDrawerTarjetaClassName}
          >
            <p className="cal-ajustes-drawer__section-desc">
              Definí el tipo institucional y el nombre con el que aparecerá la columna en el
              cuaderno
              {cursoId && bimestre ? ` (bimestre ${bimestre})` : ''}.
            </p>

            <Form.Item
              name="tipoEvaluacionId"
              label="Tipo de actividad"
              rules={[{ required: true, message: 'Seleccioná un tipo' }]}
            >
              <Select
                placeholder={tiposLoading ? 'Cargando…' : 'Seleccionar tipo'}
                loading={tiposLoading}
                disabled={tiposLoading}
                options={tipos
                  .filter((t) => !(t.id === tipoAsistenciaId && yaExisteAsistencia))
                  .map((t) => ({ value: t.id, label: t.nombre }))}
              />
            </Form.Item>

            <Form.Item
              name="nombre"
              label="Nombre descriptivo"
              rules={[
                { required: true, message: 'Ingresá un nombre' },
                { max: 200, message: 'Máximo 200 caracteres' },
              ]}
            >
              <FieldTextarea
                rows={2}
                minRows={2}
                placeholder="Ej. Parcial Tema 3, Proyecto web final…"
                maxLength={200}
              />
            </Form.Item>
          </SeccionAjustes>

          <SeccionAjustes
            icon={PieChartOutlined}
            titulo="Componente y evaluaciones"
            className={calificacionesDrawerTarjetaClassName}
          >
            <p className="cal-ajustes-drawer__section-desc">
              Indicá si la actividad suma al bloque práctico ({cuotaPractico} pts) o teórico (
              {cuotaTeorico} pts) del bimestre, y cuántos puntos aporta esta columna. La suma de
              actividades de cada componente no debe superar su cuota.
            </p>

            <ComponenteEvaluacionesFields
              form={form}
              cuotaTeorico={cuotaTeorico}
              cuotaPractico={cuotaPractico}
              evaluacionesActuales={evaluacionesActuales}
              evaluacionIdExcluir={evaluacionIdExcluir}
              onExcedeChange={handleExcedeChange}
              esAsistencia={esAsistencia}
            />
          </SeccionAjustes>

          <SeccionAjustes
            icon={CalendarOutlined}
            titulo="Programación"
            className={calificacionesDrawerTarjetaClassName}
          >
            <p className="cal-ajustes-drawer__section-desc">
              Fecha prevista de la actividad (opcional). Sirve como referencia en el cuaderno; no
              bloquea la carga de notas.
            </p>

            <Form.Item name="fecha" label="Fecha de la actividad">
              <DatePicker
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                placeholder="Cuándo se realizará esta actividad"
              />
            </Form.Item>
          </SeccionAjustes>
        </div>
      </Form>
    </Drawer>
  );
};

export default EvaluacionDrawer;
