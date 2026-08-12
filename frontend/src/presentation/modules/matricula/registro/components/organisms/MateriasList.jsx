/**
 * MateriasList - Lista seleccionable de materias para el paso Periodo y materias
 *
 * Usa SelectableDataList con renderItem para materia (avatar, nombre, sigla).
 * Props: data, selectedIds, onSelectionChange, loading, emptyMessage, disabled, showSelectAll, showInfo.
 */

import React from 'react';
import { Flex, Typography } from 'antd';
import SelectableDataList from '@molecules/SelectableDataList';

const { Text } = Typography;

function getMateriaAvatar(materia) {
  const letter = materia?.nombre?.[0]?.toUpperCase() || materia?.sigla?.[0]?.toUpperCase() || 'M';
  return (
    <Flex
      className="materias-list-item-avatar"
      align="center"
      justify="center"
      style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: 'var(--color-success)',
        color: '#fff',
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      {letter}
    </Flex>
  );
}

function renderMateriaItem(materia) {
  const title = materia?.nombre || materia?.codigo || 'Sin nombre';
  const caption = materia?.sigla ? (
    <Text type="secondary" style={{ fontSize: 12 }}>
      Sigla: {materia.sigla}
    </Text>
  ) : null;
  return {
    avatar: getMateriaAvatar(materia),
    title,
    caption,
  };
}

const MateriasList = ({
  data = [],
  selectedIds = [],
  onSelectionChange,
  loading = false,
  emptyMessage = 'No hay materias.',
  disabled = false,
  showSelectAll = false,
  showInfo = false,
}) => (
  <SelectableDataList
    data={data}
    selectedIds={selectedIds}
    onSelectionChange={onSelectionChange}
    loading={loading}
    emptyMessage={emptyMessage}
    renderItem={renderMateriaItem}
    getItemId={(item) => item?.id}
    disabled={disabled}
    showSelectAll={showSelectAll}
  />
);

export default MateriasList;
