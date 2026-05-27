import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';
import path from 'path';

function copyDirSafe(src: string, dest: string) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  let entries: fs.Dirent[] = [];
  try { entries = fs.readdirSync(src, { withFileTypes: true }); } catch { return; }
  for (const entry of entries) {
    const srcPath  = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    try {
      if (entry.isDirectory()) {
        copyDirSafe(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    } catch {
      // skip locked / temporarily unavailable files silently
    }
  }
}

const safeCopyPublic: Plugin = {
  name: 'safe-copy-public',
  apply: 'build',
  closeBundle() {
    const outDir = resolve(__dirname, 'dist');
    copyDirSafe(resolve(__dirname, 'public'), outDir);
  },
};

export default defineConfig({
  plugins: [react(), safeCopyPublic],
  publicDir: false,
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      input: {
        main:  resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html'),
      },
    },
  },
});
