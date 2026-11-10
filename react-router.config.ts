import type { Config } from "@react-router/dev/config";

export default {
  // Server-side rendering is required because the SQLite-backed API and the
  // root bootstrap loader execute on the Node server.
  ssr: true,
} satisfies Config;
