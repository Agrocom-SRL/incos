/**
 * Organismo: buscador/selector de participante para inscribir (CAP).
 *
 * Adaptación de `EstudianteSelector` (Finanzas · PagosRegistrar): dos estados —
 * búsqueda con lista de resultados / tarjeta del seleccionado con "Cambiar".
 * Reusa las clases `fin-pago-reg-*` de `pagos-registrar.css` (fuente única de
 * ese layout, solo tokens). Nombre completo en orden canónico (mapper).
 * Recibe props ya mapeadas; no llama hooks de fetch.
 */

import { Alert, Empty, Flex, Input, Spin } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { Button } from '@atoms';

const ParticipanteSelector = ({
  participantes = [],
  loading = false,
  error = null,
  onBuscar,
  participanteSeleccionado,
  onSeleccionar,
  onCambiar,
}) => {
  if (participanteSeleccionado) {
    return (
      <div className="fin-pago-reg-seleccion">
        <div className="fin-pago-reg-seleccion__info">
          <span className="fin-pago-reg-seleccion__nombre">
            {participanteSeleccionado.nombreCompleto}
          </span>
          <span className="fin-pago-reg-seleccion__meta">
            {[
              participanteSeleccionado.ciCompleto ? `CI ${participanteSeleccionado.ciCompleto}` : null,
              participanteSeleccionado.celular,
            ]
              .filter(Boolean)
              .join(' · ') || 'Participante seleccionado'}
          </span>
        </div>
        <Button variant="back" onClick={onCambiar}>
          Cambiar participante
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
        placeholder="Buscar por CI, nombre o celular (mín. 2 caracteres)…"
        onChange={(event) => onBuscar?.(event.target.value)}
      />

      {error ? (
        <Alert
          type="error"
          showIcon
          title="No se pudieron buscar los participantes"
          description={error}
        />
      ) : null}

      <Spin spinning={loading}>
        {participantes.length === 0 && !loading ? (
          <Empty description="Escriba para buscar un participante registrado" />
        ) : (
          <div className="fin-pago-reg-resultados">
            {participantes.map((participante) => (
              <button
                key={participante.id}
                type="button"
                className="fin-pago-reg-resultado"
                onClick={() => onSeleccionar?.(participante)}
              >
                <span className="fin-pago-reg-resultado__info">
                  <span className="fin-pago-reg-resultado__nombre">
                    <UserOutlined /> {participante.nombreCompleto}
                  </span>
                  <span className="fin-pago-reg-resultado__meta">
                    {[
                      participante.ciCompleto ? `CI ${participante.ciCompleto}` : null,
                      participante.celular,
                      participante.email,
                    ]
                      .filter(Boolean)
                      .join(' · ') || 'Sin datos de contacto'}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </Spin>
    </Flex>
  );
};

export default ParticipanteSelector;
