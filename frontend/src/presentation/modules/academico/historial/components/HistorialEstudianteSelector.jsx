/**
 * Organismo: buscador/selector de estudiante para abrir su historial académico.
 *
 * Recibe props ya mapeadas (no llama hooks de fetch). Un input de búsqueda
 * (debounced en el hook) + lista de resultados; al elegir, la página navega al
 * transcript del estudiante. Nombre completo en orden canónico (ya resuelto por
 * el mapper vía buildFullName).
 */

import { Alert, Empty, Flex, Input, Spin } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';

const HistorialEstudianteSelector = ({
  estudiantes = [],
  loading = false,
  error = null,
  onBuscar,
  onSeleccionar,
}) => (
  <Flex vertical gap="middle" style={{ width: '100%' }}>
    <Input
      size="large"
      allowClear
      prefix={<SearchOutlined />}
      placeholder="Buscar por nombre, código o C.I. (mín. 2 caracteres)…"
      onChange={(event) => onBuscar?.(event.target.value)}
    />

    {error ? (
      <Alert
        type="error"
        showIcon
        title="No se pudieron buscar los estudiantes"
        description={error}
      />
    ) : null}

    <Spin spinning={loading}>
      {estudiantes.length === 0 && !loading ? (
        <Empty description="Escriba para buscar un estudiante y ver su historial." />
      ) : (
        <div className="historial-selector__resultados">
          {estudiantes.map((estudiante) => (
            <button
              key={estudiante.id}
              type="button"
              className="historial-selector__resultado"
              onClick={() => onSeleccionar?.(estudiante)}
            >
              <span className="historial-selector__resultado-nombre">
                <UserOutlined /> {estudiante.nombreCompleto}
              </span>
              <span className="historial-selector__resultado-meta">
                {[
                  estudiante.codigoEstudiante,
                  estudiante.ci ? `C.I. ${estudiante.ci}` : null,
                ]
                  .filter(Boolean)
                  .join(' · ') || 'Sin datos de matrícula'}
              </span>
            </button>
          ))}
        </div>
      )}
    </Spin>
  </Flex>
);

export default HistorialEstudianteSelector;
