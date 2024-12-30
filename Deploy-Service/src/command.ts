import { spawn } from "child_process";
import path from "path";

export function buildProject(id: string) {
    return new Promise((resolve, reject) => {
        const dir = path.join(__dirname, `output/${id}`);

        // Run `npm install` first
        const npmInstall = spawn('npm', ['install', '--include=dev'], { cwd: dir });

        npmInstall.stdout?.on('data', (data) => {
            console.log('stdout (install): ' + data);
        });
        npmInstall.stderr?.on('data', (data) => {
            console.error('stderr (install): ' + data);
        });

        npmInstall.on('close', (code) => {
            if (code !== 0) {
                return reject(new Error(`npm install exited with code ${code}`));
            }

            // Run `npm run build` after install
            const npmBuild = spawn('npm', ['run', 'build'], { cwd: dir });

            npmBuild.stdout?.on('data', (data) => {
                console.log('stdout (build): ' + data);
            });
            npmBuild.stderr?.on('data', (data) => {
                console.error('stderr (build): ' + data);
            });

            npmBuild.on('close', (buildCode) => {
                if (buildCode === 0) {
                    resolve("Build completed successfully");
                } else {
                    reject(new Error(`npm build exited with code ${buildCode}`));
                }
            });
        });
    });
}
