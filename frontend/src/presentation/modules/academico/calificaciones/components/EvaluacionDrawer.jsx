/**
 * Drawer crear / editar actividad del bimestre — estilo cal-ajustes-drawer.
 */

import { memo, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Button,
  DatePicker,
  Drawer,
  Form,
  InputNumber,
  Modal,
  notification,
  Segmented,
  Select,
  Space,
} from 'antd';
import { FieldTextarea } from '@atoms';
import {
  CalendarOutlined,
  CheckOutlined,
  DeleteOutlined,
  PieChartOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useTiposEvaluacion } from '@application-academico/calificaciones/hooks/useTiposEvaluacion.js';
import {
  calcularSumaPuntosComponente,
  contarNotasCargadas,
} from '@application-academico/calificaciones/utils/puntosEvaluaciones.js';
import SeccionAjustes from './ajustes/SeccionAjustes.jsx';
import {
  CALIFICACIONES_DRAWER_Z_INDEX,
  calificacionesDrawerClassNames,
  calificacionesDrawerRootClassName,
  calificacionesDrawerSectionClassName,
  calificacionesDrawerStyles,
  calificacionesDrawerTarjetaClassName,
} from '../utils/calificacionesDrawerLayout.js';

const COMPONENTES = [
  { label: 'Teórico', value: 'TEORICO' },
  { label: 'Práctico', value: 'PRACTICO' },
];

const PuntosInput = ({ max, value, onChange, ...rest }) => (
  <Space.Compact block className="cal-eval-drawer__puntos-compact">
    <InputNumber
      {...rest}
      value={value}
      onChange={onChange}
      min={1}
      max={max > 0 ? max : undefined}
      precision={0}
      step={1}
      className="cal-eval-drawer__puntos-input"
    />
    <span className="cal-eval-drawer__puntos-suffix">pts</span>
  </Space.Compact>
);

const CuotaActividadProgress = memo(({
  componente,
  cuotaComponente,
  sumaOtrasActividades,
  puntosActividad,
}) => {
  const etiqueta = componente === 'PRACTICO' ? 'Práctico' : 'Teórico';
  const cuota = Math.max(1, Math.round(Number(cuotaComponente) || 1));
  const sumaOtras = Math.max(0, Math.round(Number(sumaOtrasActividades) || 0));
  const puntosEsta = Math.max(0, Math.round(Number(puntosActividad) || 0));
  const sumaTotal = sumaOtras + puntosEsta;
  const maxParaEsta = Math.max(0, cuota - sumaOtras);
  const restanteEsta = Math.max(0, maxParaEsta - puntosEsta);
  const excede = sumaTotal > cuota;

  const pctOtras = Math.min(100, (sumaOtras / cuota) * 100);
  const pctEsta = Math.min(100 - pctOtras, (puntosEsta / cuota) * 100);
  const pctExceso = excede ? Math.min(100, ((sumaTotal - cuota) / cuota) * 100) : 0;

  const estado = excede ? 'warn' : sumaTotal === cuota ? 'ok-full' : 'ok';

  return (
    <div className={`cal-eval-drawer__cuota cal-eval-drawer__cuota--${estado}`}>
      <div className="cal-eval-drawer__cuota-header">
        <span className="cal-eval-drawer__cuota-titulo">Componente {etiqueta}</span>
        <span className="cal-eval-drawer__cuota-total">
          <strong>{sumaTotal}</strong> / {cuota} pts
        </span>
      </div>

      <div
        className="cal-eval-drawer__cuota-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={cuota}
        aria-valuenow={Math.min(sumaTotal, cuota)}
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
            <strong className="cal-eval-drawer__cuota-restante">{sumaTotal - cuota} pts</strong>.
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
                <strong className="cal-eval-drawer__cuota-restante">{restanteEsta} pts</strong>
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
  const [form] = Form.useForm();
  const { tipos, isLoading: tiposLoading } = useTiposEvaluacion();
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState(null);

  const [componenteWatch, puntosWatch] = Form.useWatch(['componente', 'puntos'], form) ?? [];
  const esEditar = modo === 'editar';
  const componenteActivo = componenteWatch ?? 'TEORICO';
  const componentePrevRef = useRef(componenteActivo);

  useEffect(() => {
    if (!abierto) return;

    setErrorGuardado(null);
    if (esEditar && evaluacion) {
      form.setFieldsValue({
        tipoEvaluacionId: evaluacion.tipoEvaluacionId,
        nombre: evaluacion.nombre,
        componente: evaluacion.componente,
        puntos: evaluacion.puntos,
        fecha: evaluacion.fecha ? dayjs(evaluacion.fecha) : dayjs(),
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        componente: 'TEORICO',
        fecha: dayjs(),
      });
    }
    componentePrevRef.current =
      esEditar && evaluacion?.componente ? evaluacion.componente : 'TEORICO';
  }, [abierto, esEditar, evaluacion, form]);

  const cuotaComponente =
    componenteActivo === 'PRACTICO' ? Number(cuotaPractico) || 70 : Number(cuotaTeorico) || 30;

  const sumaOtrasActividades = calcularSumaPuntosComponente(
    evaluacionesActuales,
    componenteActivo,
    0,
    esEditar ? evaluacion?.id : null,
  );

  const puntosActuales = Math.round(Number(puntosWatch || 0));
  const sumaTotalComponente = sumaOtrasActividades + puntosActuales;
  const maxPuntosEstaActividad = Math.max(0, cuotaComponente - sumaOtrasActividades);

  useEffect(() => {
    if (!abierto || componentePrevRef.current === componenteActivo) return;
    componentePrevRef.current = componenteActivo;
    form.setFields([{ name: 'puntos', errors: [] }]);
  }, [abierto, componenteActivo, form]);

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
        form.setFields([
          { name: 'puntos', errors: ['Los puntos deben ser un entero ≥ 1'] },
        ]);
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

      if (esEditar) {
        const actualizada = await editarEvaluacion(evaluacion.id, payload);
        notification.success({ message: 'Actividad actualizada' });
        onGuardado(actualizada);
        onCerrar();
      } else {
        const creada = await crearEvaluacion(payload);
        notification.success({ message: 'Actividad creada' });
        onGuardado(creada);
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
          notification.success({ message: 'Actividad eliminada' });
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

  const footer = (
    <div className="cal-ajustes-drawer__footer cal-eval-drawer__footer">
      {esEditar ? (
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={confirmarEliminar}
          loading={eliminando}
          disabled={guardando}
        >
          Eliminar
        </Button>
      ) : (
        <span className="cal-ajustes-drawer__footer-count cal-ajustes-drawer__footer-count--empty" />
      )}
      <div className="cal-ajustes-drawer__footer-actions cal-eval-drawer__footer-actions">
        <Button onClick={handleCerrar} disabled={guardando || eliminando}>
          Cancelar
        </Button>
        <Button
          type="primary"
          className="cal-ajustes-drawer__btn-guardar cal-eval-drawer__btn-primary"
          loading={guardando}
          disabled={eliminando || sumaTotalComponente > cuotaComponente}
          onClick={handleGuardar}
        >
          {esEditar ? 'Guardar cambios' : 'Agregar actividad'}
        </Button>
      </div>
    </div>
  );

  return (
    <Drawer
      title={tituloDrawer}
      size={520}
      open={abierto}
      onClose={handleCerrar}
      destroyOnClose
      footer={footer}
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

      <Form form={form} layout="vertical" className="cal-ajustes-drawer__form cal-eval-drawer__form">
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
                options={tipos.map((t) => ({ value: t.id, label: t.nombre }))}
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
              Indicá si la actividad suma al bloque teórico ({cuotaTeorico} pts) o práctico (
              {cuotaPractico} pts) del bimestre, y cuántos puntos aporta esta columna. La suma de
              actividades de cada componente no debe superar su cuota.
            </p>

            <Form.Item
              name="componente"
              label="Componente"
              rules={[{ required: true, message: 'Seleccioná un componente' }]}
            >
              <Segmented options={COMPONENTES} block className="cal-eval-drawer__segmented" />
            </Form.Item>

            <Form.Item
              name="puntos"
              label="Calificación de la evaluación"
              className="cal-eval-drawer__puntos-item"
              validateTrigger={['onSubmit']}
              rules={[{ required: true, message: 'Ingresá los puntos' }]}
            >
              <PuntosInput max={maxPuntosEstaActividad} />
            </Form.Item>

            <CuotaActividadProgress
              componente={componenteActivo}
              cuotaComponente={cuotaComponente}
              sumaOtrasActividades={sumaOtrasActividades}
              puntosActividad={puntosActuales}
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
