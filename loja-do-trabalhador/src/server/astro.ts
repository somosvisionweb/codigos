/** `clientAddress` lança erro em alguns adaptadores/ambientes; isola isso. */
export function safeIp(get: () => string): string | undefined {
  try {
    return get();
  } catch {
    return undefined;
  }
}
