export const DEFAULT_AUTH_CALLBACK_URL = "/dashboard";

export function normalizeCallbackUrl(callbackUrl?: string | null) {
  if (!callbackUrl) {
    return DEFAULT_AUTH_CALLBACK_URL;
  }

  const trimmedValue = callbackUrl.trim();

  try {
    const parsedUrl = trimmedValue.startsWith("/")
      ? new URL(trimmedValue, "http://localhost")
      : new URL(trimmedValue);
    const normalizedPath = `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;

    if (
      normalizedPath === "/sign-in" ||
      normalizedPath.startsWith("/api/auth")
    ) {
      return DEFAULT_AUTH_CALLBACK_URL;
    }

    return normalizedPath.startsWith("/")
      ? normalizedPath
      : DEFAULT_AUTH_CALLBACK_URL;
  } catch {
    if (
      trimmedValue.startsWith("/") &&
      trimmedValue !== "/sign-in" &&
      !trimmedValue.startsWith("/api/auth")
    ) {
      return trimmedValue;
    }

    return DEFAULT_AUTH_CALLBACK_URL;
  }
}

export function buildSignInPath(callbackUrl?: string | null) {
  const normalizedCallbackUrl = normalizeCallbackUrl(callbackUrl);

  if (normalizedCallbackUrl === DEFAULT_AUTH_CALLBACK_URL) {
    return "/sign-in";
  }

  return `/sign-in?callbackUrl=${encodeURIComponent(normalizedCallbackUrl)}`;
}
