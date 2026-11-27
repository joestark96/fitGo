import { describe, it, expect, vi, afterEach } from 'vitest';
import { compareSemver, checkForAppUpdate } from './updateService';

describe('updateService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('compares semantic versions accurately', () => {
    expect(compareSemver('1.0.7', '1.0.6')).toBe(1);
    expect(compareSemver('v1.1.0', '1.0.9')).toBe(1);
    expect(compareSemver('1.0.6', '1.0.6')).toBe(0);
    expect(compareSemver('1.0.5', '1.0.6')).toBe(-1);
  });

  it('detects when a newer version is available on GitHub', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ version: '1.0.7' }),
    } as Response);

    const info = await checkForAppUpdate('1.0.6');
    expect(info).not.toBeNull();
    expect(info?.hasUpdate).toBe(true);
    expect(info?.latestVersion).toBe('1.0.7');
    expect(info?.apkDownloadUrl).toContain('fittrack-v1.0.7.apk');
  });

  it('reports no update when installed version matches GitHub', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ version: '1.0.6' }),
    } as Response);

    const info = await checkForAppUpdate('1.0.6');
    expect(info).not.toBeNull();
    expect(info?.hasUpdate).toBe(false);
  });

  it('returns null gracefully when offline or GitHub fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));

    const info = await checkForAppUpdate('1.0.6');
    expect(info).toBeNull();
  });
});
