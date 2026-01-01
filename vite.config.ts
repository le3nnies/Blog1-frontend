import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => {
  const useHttps = process.env.USE_HTTPS === 'true' || process.env.NODE_ENV === 'production';
  const backendProtocol = useHttps ? 'https' : 'http';
  const backendPort = process.env.BACKEND_PORT || '5000';

  return {
    plugins: [react()],
    server: {
      host: true,
      port: 8080,
      https: useHttps ? {
        key: './ssl/key.pem',
        cert: './ssl/cert.pem',
      } : undefined,
      proxy: {
        '/api': {
          target: `${backendProtocol}://localhost:${backendPort}`,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
  };
});
