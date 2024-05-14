import { Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { Question } from '@/domain/forum/enterprise/entities/question'
import { Injectable } from '@nestjs/common'
import { QuestionsRepository } from '../repositories/questions-repository'

interface GetQuestionBySlugUseCaseRequest {
  slug: string
}

type GetQuestionBySlugUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    question: Question
  }
>
@Injectable()
export class GetQuestionBySlugUseCase {
  constructor(private questionsRepository: QuestionsRepository) {}

  async execute({
    slug,
  }: GetQuestionBySlugUseCaseRequest): Promise<GetQuestionBySlugUseCaseResponse> {
    const question = await this.questionsRepository.findBySlug(slug)

    console.log('question')

    if (!question) {
      return left(new ResourceNotFoundError())
    }

    return right({
      question,
    })
  }
}
