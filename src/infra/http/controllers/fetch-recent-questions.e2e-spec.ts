import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import slugify from 'slugify'
import request from 'supertest'

describe('FetchRecentQuestionController (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    jwt = moduleRef.get(JwtService)
    await app.init()
  })
  test('[GET] /questions', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'john@dev.com',
        password: '123456',
      },
    })

    const accessToken = jwt.sign({
      sub: user.id,
    })

    await prisma.question.createMany({
      data: [
        {
          title: 'New Question 0',
          content: 'Content Question 0',
          slug: slugify('New Question 0', { lower: true, trim: true }),
          authorId: user.id,
        },
        {
          title: 'New Question 1',
          content: 'Content Question 1',
          slug: slugify('New Question 1', { lower: true, trim: true }),
          authorId: user.id,
        },
      ],
    })

    const response = await request(app.getHttpServer())
      .get('/questions')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      page: 1,
      questions: [
        expect.objectContaining({
          title: 'New Question 0',
        }),
        expect.objectContaining({
          title: 'New Question 1',
        }),
      ],
    })
  })
})
