import { Checkbox, Col, Row, Typography } from 'antd';

const ACCIONES = ['VER', 'CREAR', 'EDITAR', 'ELIMINAR', 'APROBAR', 'EXPORTAR'];

function cloneAsignaciones(list) {
  return list.map((a) => ({ ...a }));
}

function tieneAsignacion(asignaciones, permisoId, accion) {
  return asignaciones.some(
    (a) => a.permiso_id === permisoId && a.accion === accion
  );
}

/**
 * @param {Record<string, Array<{ id: number, codigo: string, nombre: string }>>} permisosPorDominio
 * @param {Array<{ permiso_id: number, accion: string }>} asignacionesActuales
 * @param {(next: Array<{ permiso_id: number, accion: string }>) => void} onChange
 */
export default function PermisosDominioPicker({
  permisosPorDominio = {},
  asignacionesActuales = [],
  onChange,
}) {
  const toggle = (permisoId, accion, checked) => {
    let next = cloneAsignaciones(asignacionesActuales);
    if (checked) {
      if (!tieneAsignacion(next, permisoId, accion)) {
        next.push({ permiso_id: permisoId, accion });
      }
    } else {
      next = next.filter(
        (a) => !(a.permiso_id === permisoId && a.accion === accion)
      );
    }
    onChange(next);
  };

  const dominios = Object.keys(permisosPorDominio).sort();

  return (
    <div>
      {dominios.map((dominio) => (
        <div key={dominio} style={{ marginBottom: 24 }}>
          <Typography.Title level={5}>{dominio}</Typography.Title>
          {(permisosPorDominio[dominio] || []).map((p) => (
            <div
              key={p.id}
              style={{
                marginBottom: 12,
                paddingBottom: 12,
                borderBottom: '1px solid var(--ant-color-border-secondary, #f0f0f0)',
              }}
            >
              <Typography.Text strong>{p.nombre}</Typography.Text>
              <Typography.Paragraph type="secondary" style={{ marginBottom: 8 }}>
                {p.codigo}
              </Typography.Paragraph>
              <Row gutter={[8, 8]}>
                {ACCIONES.map((acc) => (
                  <Col key={acc}>
                    <Checkbox
                      checked={tieneAsignacion(
                        asignacionesActuales,
                        p.id,
                        acc
                      )}
                      onChange={(e) =>
                        toggle(p.id, acc, e.target.checked)
                      }
                    >
                      {acc}
                    </Checkbox>
                  </Col>
                ))}
              </Row>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
