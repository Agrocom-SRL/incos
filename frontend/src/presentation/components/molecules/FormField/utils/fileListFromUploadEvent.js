/** normFile de Form.Item para Upload: devuelve la lista de archivos del evento. */
export const fileListFromUploadEvent = (e) => {
  if (Array.isArray(e)) return e;
  return e?.fileList;
};
