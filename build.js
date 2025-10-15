const fs = require("fs");

const builder = require('electron-builder')
const JavaScriptObfuscator = require('javascript-obfuscator');
const nodeFetch = require('node-fetch')
const png2icons = require('png2icons');
const Jimp = require('jimp');

const { preductname } = require('./package.json');

class Index {
    async init() {
        this.obf = true
        this.Fileslist = []
        process.argv.forEach(async val => {
            if (val.startsWith('--icon')) {
                return this.iconSet(val.split('=')[1])
            }

            if (val.startsWith('--obf')) {
                this.obf = JSON.parse(val.split('=')[1])
                this.Fileslist = this.getFiles("src");
            }

            if (val.startsWith('--build')) {
                let buildType = val.split('=')[1]
                if (buildType == 'platform') return await this.buildPlatform()
            }
        });
    }

    async Obfuscate() {
        if (fs.existsSync("./app")) fs.rmSync("./app", { recursive: true })

        for (let path of this.Fileslist) {
            let fileName = path.split('/').pop()
            let extFile = fileName.split(".").pop()
            let folder = path.replace(`/${fileName}`, '').replace('src', 'app')

            if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true })

            if (extFile == 'js') {
                let code = fs.readFileSync(path, "utf8");
                code = code.replace(/src\//g, 'app/');
                if (this.obf) {
                    await new Promise((resolve) => {
                        console.log(`Obfuscate ${path}`);
                        let obf = JavaScriptObfuscator.obfuscate(code, { optionsPreset: 'medium-obfuscation', disableConsoleOutput: false });
                        resolve(fs.writeFileSync(`${folder}/${fileName}`, obf.getObfuscatedCode(), { encoding: "utf-8" }));
                    })
                } else {
                    console.log(`Copy ${path}`);
                    fs.writeFileSync(`${folder}/${fileName}`, code, { encoding: "utf-8" });
                }
            } else {
                fs.copyFileSync(path, `${folder}/${fileName}`);
            }
        }
    }

    async buildPlatform() {
        await this.Obfuscate();
        builder.build({
            config: {
                generateUpdatesFilesForAllChannels: false,
                appId: preductname,
                productName: preductname,
                copyright: 'Copyright © 2020-2024 Luuxis',
                artifactName: "${productName}-${os}-${arch}.${ext}",
                extraMetadata: { main: 'app/app.js' },
                files: ["app/**/*", "package.json", "LICENSE.md"],
                directories: { 
                    "output": "dist"
                },
                compression: 'normal',
                asar: true,
                electronDownload: {
                    cache: "./node_modules/.cache/electron"
                },
                nodeGypRebuild: false,
                npmRebuild: true,
                publish: [{
                    provider: "github",
                    releaseType: 'release',
                }],
                win: {
                    icon: "./app/assets/images/icon.ico",
                    target: [{
                        target: "nsis",
                        arch: "x64"
                    }]
                },
                nsis: {
                    oneClick: true,
                    allowToChangeInstallationDirectory: false,
                    createDesktopShortcut: true,
                    runAfterFinish: true
                },
                mac: {
                    icon: "./app/assets/images/icon.icns",
                    category: "public.app-category.games",
                    identity: null,
                    hardenedRuntime: false,
                    gatekeeperAssess: false,
                    mergeASARs: true,
                    singleArchFiles: "node_modules/sqlite3/**/*",
                    target: [{
                        target: "dmg",
                        arch: "universal"
                    },
                    {
                        target: "zip", 
                        arch: "universal"
                    }]
                },
                dmg: {
                    sign: false,
                    contents: [
                        { x: 130, y: 220 },
                        { x: 410, y: 220, type: 'link', path: '/Applications' }
                    ],
                    artifactName: "${productName}-mac-${arch}.${ext}",
                    format: "ULFO"
                },
                linux: {
                    icon: "./app/assets/images/icon.png",
                    target: [{
                        target: "AppImage",
                        arch: "x64"
                    }]
                }
            }
        }).then(() => {
            console.log('le build est terminé')
        }).catch(err => {
            console.error('Error during build!', err)
        })
    }

    getFiles(path, file = []) {
        if (fs.existsSync(path)) {
            let files = fs.readdirSync(path);
            if (files.length == 0) file.push(path);
            for (let i in files) {
                let name = `${path}/${files[i]}`;
                if (fs.statSync(name).isDirectory()) this.getFiles(name, file);
                else file.push(name);
            }
        }
        return file;
    }

    async iconSet(url) {
        let Buffer = await nodeFetch(url)
        if (Buffer.status == 200) {
            Buffer = await Buffer.buffer()
            const image = await Jimp.read(Buffer);
            Buffer = await image.resize(256, 256).getBufferAsync(Jimp.MIME_PNG)
            fs.writeFileSync("src/assets/images/icon.icns", png2icons.createICNS(Buffer, png2icons.BILINEAR, 0));
            fs.writeFileSync("src/assets/images/icon.ico", png2icons.createICO(Buffer, png2icons.HERMITE, 0, false));
            fs.writeFileSync("src/assets/images/icon.png", Buffer);
            console.log('new icon set')
        } else {
            console.log('connection error')
        }
    }
}

new Index().init();
