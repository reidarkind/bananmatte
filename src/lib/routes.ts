export function installUrl(origin: string, base: string): string {
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  return new URL("install", new URL(normalizedBase, origin)).href;
}

export function isInstallRoute(pathname: string, hash: string): boolean {
  const path = pathname.replace(/\/+$/, "");
  return hash === "#/install" || path.endsWith("/install");
}

export function homeUrl(origin: string, base: string): string {
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  return new URL(normalizedBase, origin).href;
}
