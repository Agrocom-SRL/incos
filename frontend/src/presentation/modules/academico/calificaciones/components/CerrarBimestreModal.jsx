/**
 * Modal de confirmación para cerrar el bimestre vigente.
 */

import { useEffect, useState } from 'react';
import { Alert, List, Modal, Spin } from 'antd';

const CerrarBimestreModal = ({
  abierto,
  numero,
  onValidar,
  onConfirmar,
  onCancelar,
  accionando,
}) => {
  const [validacion, setValidacion] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!abierto || !numero) {
      setValidacion(null);
      return;
    }

    let cancelled = false;

    const cargar = async () => {
      setCargando(true);
      try {
        const res = await onValidar(numero);
        if (!cancelled) setValidacion(res);
      } catch {
        if (!cancelled) setValidacion(null);
      } finally {
        if (!cancelled) setCargando(false);
      }
    };

    cargar();
    return () => {
      cancelled = true;
    };
  }, [abierto, numero, onValidar]);

  const handleOk = async () => {
    await onConfirmar(numero);
  };

  return (
    <Modal
      title={`Cerrar Bimestre ${numero}`}
      open={abierto}
      onCancel={onCancelar}
      onOk={handleOk}
      okText="Confirmar cierre"
      okButtonProps={{
        danger: true,
        loading: accionando,
        disabled: cargando || (validacion && !validacion.puedeCerrar),
      }}
      cancelText="Cancelar"
      destroyOnClose
      width={520}
      className="tablero-cerrar-modal"
    >
      <p className="tablero-cerrar-modal__intro">
        Esta acción calcula y persiste las notas de bimestre de toda la gestión. Los docentes
        dejarán de editar el bimestre cerrado.
      </p>

      {cargando ? (
        <Spin tip="Validando gestión…" />
      ) : validacion ? (
        <>
          {validacion.bloqueos?.length > 0 ? (
            <Alert
              type="error"
              showIcon
              title="No se puede cerrar hasta resolver:"
              style={{ marginBottom: 12 }}
            />
          ) : null}
          {validacion.bloqueos?.length > 0 ? (
            <List
              size="small"
              dataSource={validacion.bloqueos}
              renderItem={(item) => <List.Item>• {item}</List.Item>}
              style={{ marginBottom: 16 }}
            />
          ) : null}

          {validacion.cursosConNotasFaltantes?.length > 0 ? (
            <>
              <Alert
                type="warning"
                showIcon
                title="Cursos con notas pendientes"
                style={{ marginBottom: 8 }}
              />
              <List
                size="small"
                dataSource={validacion.cursosConNotasFaltantes}
                renderItem={(c) => (
                  <List.Item>
                    <strong>{c.materia}</strong>
                    {c.docente ? ` · ${c.docente}` : ''}
                    {c.paralelo ? ` · ${c.paralelo}` : ''} — {c.cantidadFaltantes} faltante(s)
                  </List.Item>
                )}
                style={{ marginBottom: 16 }}
              />
            </>
          ) : null}

          {validacion.advertencias?.length > 0 ? (
            <Alert
              type="warning"
              showIcon
              title="Advertencias (podés cerrar igual si no hay bloqueos):"
              style={{ marginBottom: 8 }}
            />
          ) : null}
          {validacion.advertencias?.length > 0 ? (
            <List
              size="small"
              dataSource={validacion.advertencias}
              renderItem={(item) => <List.Item>• {item}</List.Item>}
            />
          ) : null}

          {validacion.puedeCerrar && !validacion.advertencias?.length ? (
            <Alert
              type="success"
              showIcon
              title="La gestión cumple las validaciones para el cierre."
            />
          ) : null}
        </>
      ) : null}
    </Modal>
  );
};

export default CerrarBimestreModal;
