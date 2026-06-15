/**
 * Modal de búsqueda/selección de una actividad del catálogo maestro.
 * Mismo enfoque que el selector de asignación docente (buscador + lista de filas
 * seleccionables). Avisa qué actividades ya están programadas en la gestión
 * (con su fecha de inicio) para que el usuario decida si las reutiliza.
 */

import { createElement, useDeferredValue, useMemo, useState } from 'react';
import { Button, Empty, Flex, Modal, Space, Tag, Tooltip, Typography } from 'antd';
import { PlusOutlined, StarFilled, CalendarOutlined } from '@ant-design/icons';
import { SearchBar } from '@atoms';
import { getActivityIconComponent } from '@config/icons';
import { getActividadTipoLabel } from '@application-institucional/actual/config/actividadPill.js';
import { formatFechaCorta } from '@application-institucional/actual/utils/bimestresTimeline.js';

const { Text, Paragraph } = Typography;

const CronogramaActividadSelectorModal = ({
  open,
  onClose,
  catalogo = [],
  usadas = new Map(),
  selectedId = null,
  onSelect,
  onCrearNueva = null,
}) => {
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);

  const items = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    const base = !q
      ? catalogo
      : catalogo.filter((a) =>
          [a.nombre, getActividadTipoLabel(a.tipo)]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(q)),
        );
    // El elemento ya seleccionado queda primero en la lista.
    if (selectedId == null) return base;
    return [...base].sort((a, b) => {
      const sa = Number(a.id) === Number(selectedId) ? 0 : 1;
      const sb = Number(b.id) === Number(selectedId) ? 0 : 1;
      return sa - sb;
    });
  }, [catalogo, deferredSearch, selectedId]);

  return (
    <Modal
      title="Seleccionar actividad del catálogo"
      width={760}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      classNames={{ header: 'crono-selector__header' }}
    >
      <Flex vertical gap="middle" style={{ width: '100%' }}>
        <Paragraph type="secondary" className="crono-selector__desc">
          Busca y elige una actividad del catálogo maestro. Las que ya están programadas en esta
          gestión muestran su fecha de inicio: puedes reutilizarlas si corresponde.
        </Paragraph>

        <Flex gap="small" align="center" wrap>
          <SearchBar
            allowClear
            placeholder="Buscar actividad por nombre o tipo…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            enterButton={false}
            style={{ flex: 1, minWidth: 240 }}
          />
          <Tooltip
            title={
              onCrearNueva
                ? 'Crear una nueva actividad del catálogo maestro'
                : 'Disponible al habilitar el catálogo maestro (Fase B).'
            }
          >
            <Button
              icon={<PlusOutlined />}
              onClick={onCrearNueva || undefined}
              disabled={!onCrearNueva}
            >
              Nueva actividad
            </Button>
          </Tooltip>
        </Flex>

        <div className="crono-selector__list">
          {items.length === 0 ? (
            <Empty description="Sin actividades en el catálogo" />
          ) : (
            items.map((item) => {
              const seleccionada = Number(selectedId) === Number(item.id);
              const fechasUsadas = usadas.get(Number(item.id)) ?? [];
              const yaUsada = fechasUsadas.length > 0;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`crono-selector__row${seleccionada ? ' crono-selector__row--selected' : ''}${
                    yaUsada ? ' crono-selector__row--usada' : ''
                  }`}
                  onClick={() => onSelect?.(item)}
                >
                  <span className="crono-selector__icon" aria-hidden>
                    {createElement(getActivityIconComponent(item.icono))}
                  </span>
                  <Space direction="vertical" size={0} style={{ minWidth: 0, flex: 1 }}>
                    <Text strong ellipsis>
                      {item.nombre}
                    </Text>
                    <Text type="secondary" className="crono-selector__tipo">
                      {getActividadTipoLabel(item.tipo)}
                    </Text>
                    {yaUsada ? (
                      <span className="crono-selector__usada">
                        <CalendarOutlined />
                        Ya programada: {fechasUsadas.map((f) => formatFechaCorta(f)).join(' · ')}
                      </span>
                    ) : null}
                  </Space>
                  {item.esDestacada ? (
                    <StarFilled className="crono-selector__star" aria-label="Destacada" />
                  ) : null}
                  {seleccionada ? <Tag color="processing">Seleccionada</Tag> : null}
                </button>
              );
            })
          )}
        </div>
      </Flex>
    </Modal>
  );
};

export default CronogramaActividadSelectorModal;
