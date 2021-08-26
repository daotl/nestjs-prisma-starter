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

describe('AppController (e2e)', () => {
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

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!')
  })

  it('/hello/:name (GET)', () => {
    const name = chance.name()
    return request(app.getHttpServer())
      .get(`/hello/${name}`)
      .expect(200)
      .expect(`Hello ${name}!`)
  })

  it('/hello (POST)', () => {
    const name = chance.name()
    return request(app.getHttpServer())
      .post(`/hello`)
      .send({ name })
      .expect(200)
      .expect(`Hello ${name}!`)
  })
})
