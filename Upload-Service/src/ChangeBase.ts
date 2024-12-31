import fs from "fs";
import path from "path";

export function createOrUpdateViteConfig(id: string, repoUrl: string): void {
  const viteConfigJsPath = path.join(repoUrl, "vite.config.js");
  const viteConfigTsPath = path.join(repoUrl, "vite.config.ts");

  let viteConfigPath: string | null = null;
  let isTsConfig = false;

  // Detect existing config file
  if (fs.existsSync(viteConfigJsPath)) {
    viteConfigPath = viteConfigJsPath;
    isTsConfig = false;
  }
  if (fs.existsSync(viteConfigTsPath)) {
    viteConfigPath = viteConfigTsPath;
    isTsConfig = true;
  }

  // Content template
  const pluginContent = `{
    name: 'prefix-relative-paths',
    transformIndexHtml(html) {
      return html.replace(/(src|href)="\\.\\/([^"]+)"/g, "$1='/${id}/$2'");
    },
  }`;

  const newConfigContent = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/${id}/',
  plugins: [
    react(),
    ${pluginContent}
  ],
})`;

  if (viteConfigPath === null) {
    const targetPath = isTsConfig ? viteConfigTsPath : viteConfigJsPath;
    fs.writeFileSync(targetPath, newConfigContent, "utf-8");
    console.log(`${isTsConfig ? "vite.config.ts" : "vite.config.js"} created.`);
  } else {
    let fileContent = fs.readFileSync(viteConfigPath, "utf-8");

    // Handle base
    if (fileContent.includes("base:")) {
      fileContent = fileContent.replace(/base:\s*'[^']*'/, `base: '/${id}/'`);
    } else {
      fileContent = fileContent.replace(
        "defineConfig({",
        `defineConfig({\n  base: '/${id}/',`
      );
    }

    // Handle plugins
    if (fileContent.includes("plugins:")) {
      fileContent = fileContent.replace(
        /plugins:\s*\[(.*?)\]/s,
        (match, existingPlugins) => {
          if (existingPlugins.includes("prefix-relative-paths")) {
            return match; // Plugin already added
          }
          return `plugins: [${existingPlugins.trim()},\n${pluginContent}]`;
        }
      );
    } else {
      fileContent = fileContent.replace(
        "defineConfig({",
        `defineConfig({\n  plugins: [\n${pluginContent}],`
      );
    }

    fs.writeFileSync(viteConfigPath, fileContent, "utf-8");
    console.log(
      `${
        isTsConfig ? "vite.config.ts" : "vite.config.js"
      } updated with plugins and base.`
    );
  }
}
