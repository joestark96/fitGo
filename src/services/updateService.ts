import { APP_VERSION } from '../types';

export interface AppUpdateInfo {
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  apkDownloadUrl: string;
  githubPagesUrl: string;
}

const GITHUB_PACKAGE_JSON_URL =
  'https://raw.githubusercontent.com/joestark96/fitGo/main/package.json';
const GITHUB_PAGES_BASE_URL = 'https://joestark96.github.io/fitGo';

export function compareSemver(versionA: string, versionB: string): number {
  const parse = (v: string) =>
    v
      .replace(/^v/i, '')
      .split('.')
      .map((part) => {
        const n = parseInt(part, 10);
        return Number.isNaN(n) ? 0 : n;
      });

  const a = parse(versionA);
  const b = parse(versionB);
  const len = Math.max(a.length, b.length, 3);

  for (let i = 0; i < len; i++) {
    const numA = a[i] ?? 0;
    const numB = b[i] ?? 0;
    if (numA > numB) return 1;
    if (numA < numB) return -1;
  }
  return 0;
}

export async function checkForAppUpdate(
  currentVersion: string = APP_VERSION
): Promise<AppUpdateInfo | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch(`${GITHUB_PACKAGE_JSON_URL}?t=${Date.now()}`, {
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!response.ok) return null;

    const data = (await response.json()) as { version?: string };
    const latestVersion = (data?.version || '').trim().replace(/^v/i, '');
    if (!latestVersion) return null;

    const hasUpdate = compareSemver(latestVersion, currentVersion) > 0;
    return {
      currentVersion: currentVersion.replace(/^v/i, ''),
      latestVersion,
      hasUpdate,
      apkDownloadUrl: `${GITHUB_PAGES_BASE_URL}/fittrack-v${latestVersion}.apk`,
      githubPagesUrl: `${GITHUB_PAGES_BASE_URL}/`,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

export function openUpdateDownload(info: AppUpdateInfo): void {
  const url = info.apkDownloadUrl || info.githubPagesUrl;
  window.open(url, '_system');
}
