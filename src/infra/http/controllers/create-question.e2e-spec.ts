import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { StudentFactory } from 'test/factories/make-student'

describe('CreateQuestionController (E2E)', () => {
  let app: INestApplication
  let studentFactory: StudentFactory
  let jwt: JwtService
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory],
    }).compile()

    app = moduleRef.createNestApplication()
    studentFactory = moduleRef.get(StudentFactory)
    prisma = moduleRef.get(PrismaService)
    jwt = moduleRef.get(JwtService)
    await app.init()
  })
  test('[POST] /questions', async () => {
    const user = await studentFactory.makePrismaStudent({
      name: 'John Doe',
      email: 'john@dev.com',
      password: '123456',
    })

    const accessToken = jwt.sign({
      sub: user.id.toString(),
    })

    const response = await request(app.getHttpServer())
      .post('/questions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'New Question 1',
        content: 'Content Question 1',
      })

    expect(response.statusCode).toBe(201)

    const questionOnDatabase = await prisma.question.findUnique({
      where: {
        slug: 'new-question-1',
      },
    })

    expect(questionOnDatabase).toBeTruthy()
  })
})
