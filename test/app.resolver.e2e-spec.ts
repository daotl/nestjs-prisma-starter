import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { FastifyInstance } from 'fastify'
import { Chance } from 'chance'
import request from 'supertest'
import { AppModule } from '~/app.module'

const chance = new Chance()

describe('AppResolver (e2e)', () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    )
    await app.init()
    await (app.getHttpAdapter().getInstance() as FastifyInstance).ready()
  })

  it('helloWorld (Query)', () => {
    // TODO assert return value
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: '{ helloWorld }',
      })
      .expect(200)
  })
  it('hello (Query)', () => {
    // TODO assert return value
    const name = chance.name()
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `{ hello(name: "${name}") }`,
      })
      .expect(200)
  })
})
