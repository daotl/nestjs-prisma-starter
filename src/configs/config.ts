import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'
import deepmerge from 'deepmerge'
import { envToClass } from 'env-to-class'
import { Config } from './config.schema'

const env = dotenv.config()
dotenvExpand(env)

const defaultConf: Config = deepmerge(new Config(), {
  nest: {
    port: 3000,
  },
  cors: {
    enabled: true,
  },
  swagger: {
    enabled: true,
    title: 'Nestjs FTW',
    description: 'The  nestjs API description',
    version: '1.5',
    path: 'api',
  },
  graphql: {
    playgroundEnabled: true,
    debug: true,
    schemaDestination: './src/schema.graphql',
    sortSchema: true,
  },
  security: {
    jwt: {
      expiresIn: '2m',
      refreshIn: '7d',
    },
    passwordBcryptRound: 10,
  },
})

const [errs, config] = envToClass(Config, defaultConf, {
  overrideExistingValues: false,
})
if (errs.length) {
  throw new Error(JSON.stringify(errs))
}

export default (): Config => config
