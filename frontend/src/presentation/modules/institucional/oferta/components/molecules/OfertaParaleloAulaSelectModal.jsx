import { BankOutlined } from '@ant-design/icons';
import { Modal, Button, Empty } from 'antd';
import IdentidadCelda from '@atoms/IdentidadCelda';

/**
 * Modal: listado de aulas (código + nombre, capacidad), selección y confirmación.
 */
const OfertaParaleloAulaSelectModal = ({
  open,
  items = [],
  selectedId,
  onSelect,
  onClose,
  onConfirm,
  confirming = false,
}) => {
  const puedeConfirmar = selectedId != null && Number(selectedId) > 0;

  return (
    <Modal
      title="Aulas disponibles"
      open={open}
      onCancel={onClose}
      destroyOnHidden
      className="oferta-aula-select-modal"
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancelar
        </Button>,
        <Button
          key="confirm"
          type="primary"
          onClick={onConfirm}
          loading={confirming}
          disabled={!puedeConfirmar}
        >
          Confirmar selección
        </Button>,
      ]}
    >
      {items.length === 0 ? (
        <Empty description="No hay aulas libres en esta gestión" />
      ) : (
        <div className="oferta-aula-select-modal__list" role="listbox" aria-label="Aulas disponibles">
          {items.map((item) => {
            const selected = Number(selectedId) === Number(item.id);
            return (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={selected}
                className={`oferta-aula-select-modal__item${
                  selected ? ' oferta-aula-select-modal__item--selected' : ''
                }`}
                onClick={() => onSelect?.(item.id)}
              >
                <span className="oferta-aula-select-modal__icon" aria-hidden>
                  <BankOutlined />
                </span>
                <span className="oferta-aula-select-modal__body">
                  <IdentidadCelda
                    codigo={item.codigo}
                    nombre={item.nombre}
                    className="oferta-aula-identidad"
                  />
                  <span className="oferta-aula-select-modal__meta">
                    {item.capacidad != null && !Number.isNaN(item.capacidad) ? (
                      <span className="oferta-aula-select-modal__meta-line">
                        {item.capacidad} cupos
                      </span>
                    ) : null}
                    {item.isCurrent ? (
                      <span className="oferta-aula-select-modal__actual">Asignada aquí</span>
                    ) : null}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </Modal>
  );
};

export default OfertaParaleloAulaSelectModal;
