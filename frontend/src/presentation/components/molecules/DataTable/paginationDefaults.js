/** Props del Select de tamaño de página (paginación de tablas INCOS). */
export const DATA_TABLE_PAGINATION_SIZE_CHANGER = {
  showSearch: false,
  popupMatchSelectWidth: true,
  classNames: {
    popup: {
      root: 'data-table-pagination-size-dropdown',
    },
  },
};

export function resolvePaginationSizeChanger(showSizeChanger) {
  if (showSizeChanger === false) return false;
  if (showSizeChanger === true || showSizeChanger == null) {
    return { ...DATA_TABLE_PAGINATION_SIZE_CHANGER };
  }

  const { popupClassName, classNames, ...rest } = showSizeChanger;
  const popupRoot =
    classNames?.popup?.root ??
    popupClassName ??
    DATA_TABLE_PAGINATION_SIZE_CHANGER.classNames.popup.root;

  return {
    ...DATA_TABLE_PAGINATION_SIZE_CHANGER,
    ...rest,
    classNames: {
      ...DATA_TABLE_PAGINATION_SIZE_CHANGER.classNames,
      ...classNames,
      popup: {
        ...DATA_TABLE_PAGINATION_SIZE_CHANGER.classNames.popup,
        ...classNames?.popup,
        root: popupRoot,
      },
    },
  };
}

export const DATA_TABLE_PAGINATION_BASE = {
  showQuickJumper: false,
  className: 'data-table-pagination',
  showTotal: (total, range) => `Mostrando ${range[0]}-${range[1]} de ${total} registros`,
  pageSizeOptions: ['10', '20', '50', '100'],
  locale: { items_per_page: 'registros / página' },
  get showSizeChanger() {
    return resolvePaginationSizeChanger(true);
  },
};
