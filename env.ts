/*
|--------------------------------------------------------------------------
| Validating Environment Variables
|--------------------------------------------------------------------------
|
| In this file we define the rules for validating environment variables.
| By performing validation we ensure that your application is running in
| a stable environment with correct configuration values.
|
| This file is read automatically by the framework during the boot lifecycle
| and hence do not rename or move this file to a different location.
|
*/

import Env from '@ioc:Adonis/Core/Env'

export default Env.rules({
    HOST: Env.schema.string({}),
    PORT: Env.schema.number(),
    APP_KEY: Env.schema.string(),
    APP_NAME: Env.schema.string(),
    DRIVE_DISK: Env.schema.enum(['local'] as const),
    NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
    PG_HOST: Env.schema.string({}),
    PG_PORT: Env.schema.number(),
    PG_USER: Env.schema.string(),
    PG_PASSWORD: Env.schema.string.optional(),
    PG_DB_NAME: Env.schema.string(),
    REDIS_CONNECTION: Env.schema.enum(['local'] as const),
    REDIS_HOST: Env.schema.string({}),
    REDIS_PORT: Env.schema.number(),
    REDIS_PASSWORD: Env.schema.string.optional(),
    S3_KEY: Env.schema.string(),
    S3_SECRET: Env.schema.string(),
    S3_BUCKET: Env.schema.string(),
    S3_REGION: Env.schema.string(),
    S3_ENDPOINT: Env.schema.string.optional(),
    S3_STORAGE_CLASS: Env.schema.string.optional(),
    AWS_SYNC: Env.schema.boolean(),
    STORAGES_PATH: Env.schema.string(),
})
