import {Plugin, PreviewServer, ViteDevServer} from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import https from "node:https";
import crypto from "node:crypto";
import c from 'picocolors';

const DEFAULT_CERTS_CACHE_DIR = 'node_modules/.vite/traefik.me';

const TRAEFIK_ME_CERTS_DOWNLOAD_URLS = {
    cert: 'https://traefik.me/cert.pem',
    key: 'https://traefik.me/privkey.pem',
    chain: 'https://traefik.me/chain.pem',
    fullchain: 'https://traefik.me/fullchain.pem',
};

async function downloadFile(url: string, filePath: string) {
    // Ensure cache directory exists
    fs.mkdirSync(DEFAULT_CERTS_CACHE_DIR, { recursive: true });

    return new Promise<void>((resolve, reject) => {
        const fileStream = fs.createWriteStream(filePath);

        https.get(url, (res) => {
            if (res.statusCode! >= 400) {
                fileStream.close();
                fs.unlinkSync(filePath);
                return reject(new Error(`Failed to download ${url}. Status Code: ${res.statusCode}`));
            }

            res.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close();
                resolve();
            });
            fileStream.on('error', (err) => {
                fileStream.close();
                fs.unlinkSync(filePath);
                reject(err);
            });
        }).on('error', (err) => {
            fs.unlinkSync(filePath);
            reject(err)
        });
    });
}

async function getCert() {
    fs.mkdirSync(DEFAULT_CERTS_CACHE_DIR, { recursive: true });

    const paths: Record<string, string> = {};
    for (const [name, url] of Object.entries(TRAEFIK_ME_CERTS_DOWNLOAD_URLS)) {
        const hash = crypto.createHash('sha256').update(url).digest('hex');
        const cachedFilePath = path.join(DEFAULT_CERTS_CACHE_DIR, `${name}-${hash}`);

        {
            const stats = fs.statSync(cachedFilePath, { throwIfNoEntry: false });
            const fileExists = stats !== undefined;

            // delete cached file if it's older than 1 day
            if (fileExists && (Date.now() - stats.ctime.getTime() > 1000 * 60 * 60 * 24)) {
                console.info(`Removing outdated cache: ${cachedFilePath}`);
                fs.unlinkSync(cachedFilePath);
            }
        }

        if (fs.existsSync(cachedFilePath)) {
            paths[name] = cachedFilePath
        } else {
            try {
                console.info(`Fetching: ${url}...`);
                await downloadFile(url, cachedFilePath);
            } catch (e: any) {
                console.error(`Failed to download ${url}: ${e.message}`);
                continue
            }

            paths[name] = cachedFilePath;
        }
    }

    return paths;
}

interface HttpsOptions {
    dev?: boolean; // enable https in dev server
    preview?: boolean; // enable https in preview server
    prefix?: string; // prefix for the serving domain
}

function vitePluginHttps(options: HttpsOptions = {}): Plugin {
    let servingDomain: string | undefined = undefined;

    function setAddrPrinter(server: ViteDevServer | PreviewServer) {
        const { config } = server;

        if (servingDomain && server.httpServer) {
            server.printUrls = new Proxy(server.printUrls, {
                apply(target, thisArg, args) {
                    const address = server.httpServer!.address();
                    const isHttps = config.server.https !== undefined || config.preview.https !== undefined;

                    if (address) {
                        const { port } = address as any;

                        config.logger.info(
                            c.greenBright('  ➜') +
                            c.bold(c.whiteBright('  Secure: ')) +
                            c.yellow(`https://${servingDomain}:${port}`) +
                            c.cyan(' -> ') +
                            c.yellow(`${isHttps ? 'https' : 'http'}://localhost:${port}`),
                        )
                    }

                    // call original function
                    return target.apply(thisArg, args as []);
                },
            });
        }
    }

    return {
        name: 'vite-plugin-secure-now',
        async configResolved(config) {
            const { cert, key } = await getCert();

            const https = () => ({ cert, key });

            const prefix = options.prefix ?? 'vite';
            const dev = options.dev ?? true;
            const preview = options.preview ?? true;

            let setHttps = false;

            if (dev && (config.server.https === undefined || !!config.server.https)) {
                config.server.https = Object.assign({}, config.server.https, https())
                config.server.host = '0.0.0.0';
                setHttps = true;
            }

            if (preview && (config.preview.https === undefined || !!config.preview.https)) {
                config.preview.https = Object.assign({}, config.preview.https, https())
                config.preview.host = '0.0.0.0';
                setHttps = true;
            }

            if (setHttps) {
                servingDomain = `${prefix}.traefik.me`;
            }
        },
        configureServer(server) {
            setAddrPrinter(server);
        },
        configurePreviewServer(server) {
            setAddrPrinter(server);
        },
    };
}

export {
    HttpsOptions,
};

export default vitePluginHttps;