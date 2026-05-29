/**
 * URL de vista previa: archivo local (blob, instantáneo) o ruta guardada en servidor.
 */
import { useEffect, useState } from 'react';

const resolveLocalFile = (fileList) => {
  const item = fileList?.[0];
  if (!item) return null;
  if (item.originFileObj instanceof File) return item.originFileObj;
  if (item instanceof File) return item;
  return null;
};

export const useImageUploadPreviewUrl = (fileList, resolveStoredUrl) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const localFile = resolveLocalFile(fileList);

  useEffect(() => {
    if (!(localFile instanceof File)) {
      setBlobUrl(null);
      return undefined;
    }
    const url = URL.createObjectURL(localFile);
    setBlobUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [localFile]);

  if (blobUrl) {
    return blobUrl;
  }

  const stored = fileList?.[0]?.url;
  if (typeof stored === 'string' && stored) {
    return stored;
  }

  if (typeof resolveStoredUrl === 'function') {
    return resolveStoredUrl() ?? null;
  }

  return null;
};
