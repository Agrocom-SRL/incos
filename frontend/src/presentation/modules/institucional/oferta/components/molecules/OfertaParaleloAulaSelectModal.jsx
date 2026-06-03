import { BankOutlined } from '@ant-design/icons';
import { Modal, Button, Empty, Typography } from 'antd';

const { Text } = Typography;

/**
 * Modal: listado de aulas (título + descripción), selección y confirmación.
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
        <div className="oferta-aula-select-modal__list">
          {items.map((item) => {
            const selected = Number(selectedId) === Number(item.id);
            return (
              <button
                key={item.id}
                type="button"
                className={`oferta-aula-select-modal__item${
                  selected ? ' oferta-aula-select-modal__item--selected' : ''
                }`}
                onClick={() => onSelect?.(item.id)}
              >
                <span className="oferta-aula-select-modal__icon" aria-hidden>
                  <BankOutlined />
                </span>
                <span className="oferta-aula-select-modal__text">
                  <Text strong>{item.name}</Text>
                  {item.description ? (
                    <Text type="secondary" className="oferta-aula-select-modal__desc">
                      {item.description}
                    </Text>
                  ) : null}
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
