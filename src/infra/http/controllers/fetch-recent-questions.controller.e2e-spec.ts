import { Slug } from '@/domain/forum/enterprise/entities/value-objects/slug'
import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { QuestionFactory } from 'test/factories/make-question'
import { StudentFactory } from 'test/factories/make-student'

describe('FetchRecentQuestionController (E2E)', () => {
  let app: INestApplication
  let jwt: JwtService
  let studentFactory: StudentFactory
  let questionFactory: QuestionFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, QuestionFactory],
    }).compile()

    app = moduleRef.createNestApplication()
    studentFactory = moduleRef.get(StudentFactory)
    questionFactory = moduleRef.get(QuestionFactory)
    jwt = moduleRef.get(JwtService)
    await app.init()
  })
  test('[GET] /questions', async () => {
    const user = await studentFactory.makePrismaStudent({
      name: 'John Doe',
      email: 'john@dev.com',
      password: '123456',
    })

    const accessToken = jwt.sign({
      sub: user.id.toString(),
    })

    await questionFactory.makePrismaQuestion({
      title: 'New Question 0',
      content: 'Content Question 0',
      slug: Slug.create('new-question-0'),
      authorId: user.id,
    })
    await questionFactory.makePrismaQuestion({
      title: 'New Question 1',
      content: 'Content Question 1',
      slug: Slug.create('new-question-1'),
      authorId: user.id,
    })

    const response = await request(app.getHttpServer())
      .get('/questions')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      page: 1,
      questions: expect.arrayContaining([
        expect.objectContaining({
          title: 'New Question 1',
        }),
        expect.objectContaining({
          title: 'New Question 0',
        }),
      ]),
    })
  })
})
