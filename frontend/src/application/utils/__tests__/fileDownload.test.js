import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { downloadBlob, downloadFile } from '../fileDownload';

describe('fileDownload', () => {
  let click;
  beforeEach(() => {
    vi.useFakeTimers();
    window.URL.createObjectURL = vi.fn(() => 'blob:x');
    window.URL.revokeObjectURL = vi.fn();
    click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('downloadBlob exige un Blob', () => {
    expect(() => downloadBlob('x', 'a')).toThrow('Blob válido');
  });
  it('downloadBlob dispara el click y libera la URL', () => {
    downloadBlob(new Blob(['a']), 'a.txt');
    expect(click).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(100);
    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:x');
  });
  it('downloadFile normaliza la ruta y descarga vía fetch', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, blob: async () => new Blob(['a']) });
    vi.stubGlobal('fetch', fetchMock);
    await downloadFile('../uploads//doc.pdf', 'doc.pdf');
    expect(fetchMock).toHaveBeenCalledWith(`${window.location.origin}/uploads/doc.pdf`);
    expect(click).toHaveBeenCalled();
  });
  it('downloadFile cae al enlace directo si fetch falla', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404, statusText: 'NF' }));
    await downloadFile('uploads/x.pdf');
    expect(click).toHaveBeenCalledTimes(1);
    expect(window.URL.createObjectURL).not.toHaveBeenCalled();
  });
});
