/**
 * Organismo: buscador/selector de estudiante para registrar un abono (Finanzas).
 *
 * Recibe props ya mapeadas (no llama hooks de fetch). Dos estados:
 *   - Sin selección: input de búsqueda (debounced en el hook) + lista de resultados.
 *   - Con selección: tarjeta del estudiante elegido + acción "Cambiar".
 *
 * Nombre completo en orden canónico (ya viene resuelto por el mapper vía buildFullName).
 */

import { Alert, Empty, Flex, Input, Spin } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { Button, StatusPill } from '@atoms';
import { formatBolivianos } from '@finanzas/pagos/config/registrarFormConfig';

const EstudianteSelector = ({
  estudiantes = [],
  loading = false,
  error = null,
  onBuscar,
  estudianteSeleccionado,
  onSeleccionar,
  onCambiar,
}) => {
  if (estudianteSeleccionado) {
    return (
      <div className="fin-pago-reg-seleccion">
        <div className="fin-pago-reg-seleccion__info">
          <span className="fin-pago-reg-seleccion__nombre">
            {estudianteSeleccionado.nombreCompleto}
          </span>
          <span className="fin-pago-reg-seleccion__meta">
            {[estudianteSeleccionado.codigoEstudiante, estudianteSeleccionado.carreraNombre]
              .filter(Boolean)
              .join(' · ') || 'Estudiante seleccionado'}
          </span>
        </div>
        <Button variant="back" onClick={onCambiar}>
          Cambiar estudiante
        </Button>
      </div>
    );
  }

  return (
    <Flex vertical gap="middle" style={{ width: '100%' }}>
      <Input
        size="large"
        allowClear
        prefix={<SearchOutlined />}
        placeholder="Buscar por nombre, código, CI o carrera (mín. 2 caracteres)…"
        onChange={(event) => onBuscar?.(event.target.value)}
      />

      {error ? (
        <Alert type="error" showIcon title="No se pudieron buscar los estudiantes" description={error} />
      ) : null}

      <Spin spinning={loading}>
        {estudiantes.length === 0 && !loading ? (
          <Empty description="Escriba para buscar un estudiante" />
        ) : (
          <div className="fin-pago-reg-resultados">
            {estudiantes.map((estudiante) => (
              <button
                key={estudiante.id}
                type="button"
                className="fin-pago-reg-resultado"
                onClick={() => onSeleccionar?.(estudiante)}
              >
                <span className="fin-pago-reg-resultado__info">
                  <span className="fin-pago-reg-resultado__nombre">
                    <UserOutlined /> {estudiante.nombreCompleto}
                  </span>
                  <span className="fin-pago-reg-resultado__meta">
                    {[estudiante.codigoEstudiante, estudiante.carreraNombre]
                      .filter(Boolean)
                      .join(' · ') || 'Sin carrera asignada'}
                  </span>
                </span>
                {estudiante.aporte.tieneSaldoPendiente ? (
                  <span className="fin-pago-reg-resultado__saldo">
                    <StatusPill
                      label={`Saldo ${formatBolivianos(estudiante.aporte.saldoPendienteTotal)}`}
                      className="pago-pill pago-pill--saldo"
                    />
                  </span>
                ) : estudiante.aporte.totalmenteCubierto ? (
                  <span className="fin-pago-reg-resultado__saldo">
                    <StatusPill label="Aporte al día" className="pago-pill pago-pill--aldia" />
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        )}
      </Spin>
    </Flex>
  );
};

export default EstudianteSelector;
