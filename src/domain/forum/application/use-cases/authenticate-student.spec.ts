import { FakeEncrypter } from 'test/cryptography/fake-encrypter'
import { FakeHasher } from 'test/cryptography/fake-hasher'
import { makeStudent } from 'test/factories/make-student'
import { InMemoryStudentRepository } from 'test/repositories/in-memory-register-student-repository'
import { AuthenticateStudentUseCase } from './authenticate-student'

let inMemoryStudentRepository: InMemoryStudentRepository
let fakeHasher: FakeHasher
let fakeEncrypter: FakeEncrypter
let sut: AuthenticateStudentUseCase

describe('Authenticate Student', () => {
  beforeEach(() => {
    inMemoryStudentRepository = new InMemoryStudentRepository()
    fakeHasher = new FakeHasher()
    fakeEncrypter = new FakeEncrypter()

    sut = new AuthenticateStudentUseCase(
      inMemoryStudentRepository,
      fakeHasher,
      fakeEncrypter,
    )
  })

  it('should be able authenticate a student', async () => {
    const student = makeStudent({
      email: 'john@doe.com',
      password: await fakeHasher.hash('123456'),
    })

    inMemoryStudentRepository.items.push(student)

    const result = await sut.execute({
      email: 'john@doe.com',
      password: '123456',
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      accessToken: expect.any(String),
    })
  })
})
