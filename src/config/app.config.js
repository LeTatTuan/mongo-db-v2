'use strict'
import { env } from "@/utils/function";

const dev = {
    app: {
        port: env('DEV_APP_PORT', 3000),
        prefix: env('DEV_ROUTER_PREFIX', '/api/v1'),
        secret_access: env('ACCESS_TOKEN_SECRET'),
        secret_refresh: env('REFRESH_TOKEN_SECRET'),
    },
    encrypt: {
        secret_key: env('DEV_ENCRYPT_KEY'),
        algorithm: env('DEV_ENCRYPTION_ALGORITHM')
    },
    db: {
        port: env('PORT'),
        host: env('HOST'),
        database: env('DB_NAME')
    }

}
const pro = {
    app: {
        port: env('PRO_APP_PORT', 3000),
        prefix: env('PRO_ROUTER_PREFIX', '/api/v1'),
        secret_access: env('ACCESS_TOKEN_SECRET'),
        secret_refresh: env('REFRESH_TOKEN_SECRET'),
    },
    encrypt: {
        secret_key: env('PRO_ENCRYPT_KEY'),
        algorithm: env('PRO_ENCRYPTION_ALGORITHM')
    },
    db: {
        port: env('PORT'),
        host: env('HOST'),
        database: env('DB_NAME')
    }
}

const config = { dev, pro }
const node = env("NODE_ENV", "dev")
export default config[node];