import fs from 'fs';
import path from 'path';

export function createOrUpdateViteConfig(id: string , repoUrl: string): void {
  // Define the possible paths for vite.config.js and vite.config.ts
  const viteConfigJsPath = path.join(repoUrl, 'vite.config.js');
  const viteConfigTsPath = path.join(repoUrl, 'vite.config.ts');

  let viteConfigPath: string | null = null;
  let isTsConfig = false;

  // Check if vite.config.js exists
  if (fs.existsSync(viteConfigJsPath)) {
    viteConfigPath = viteConfigJsPath;
    isTsConfig = false; // It's a JS file
  }
  
  // Check if vite.config.ts exists
  if (fs.existsSync(viteConfigTsPath)) {
    viteConfigPath = viteConfigTsPath;
    isTsConfig = true; // It's a TS file
  }

  // If neither config file exists, create one
  if (viteConfigPath === null) {
    const content = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/${id}/',
  plugins: [react()],
})
`;

    if (isTsConfig) {
      fs.writeFileSync(viteConfigTsPath, content, 'utf-8');
      console.log(`vite.config.ts created with base path: /${id}/`);
    } else {
      fs.writeFileSync(viteConfigJsPath, content, 'utf-8');
      console.log(`vite.config.js created with base path: /${id}/`);
    }
  } else {
    // Read the existing file content
    let fileContent = fs.readFileSync(viteConfigPath, 'utf-8');

    // Check if base configuration already exists
    if (fileContent.includes('base:')) {
      // Replace the existing base value
      fileContent = fileContent.replace(/base:\s*'.*?'/, `base: '/${id}'`);
    } else {
      // If base doesn't exist, insert it after defineConfig({
      fileContent = fileContent.replace('defineConfig({', `defineConfig({\n  base: '/${id}/',`);
    }

    // Write the updated content back to the file
    fs.writeFileSync(viteConfigPath, fileContent, 'utf-8');
    console.log(`${isTsConfig ? 'vite.config.ts' : 'vite.config.js'} updated with base path: /${id}/`);
  }
}


