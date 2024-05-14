import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { GetQuestionBySlugUseCase } from '@/domain/forum/application/use-cases/get-question-by-slug'
import { BadRequestException, Controller, Get, Param } from '@nestjs/common'
import { QuestionPresenter } from '../presenters/question-presenter'

@Controller('/questions')
export class GetQuestionBySlugController {
  constructor(private getQuestionBySlug: GetQuestionBySlugUseCase) {}

  @Get(':slug')
  async handle(@Param('slug') slug: string) {
    const result = await this.getQuestionBySlug.execute({ slug })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new BadRequestException(error.message)
        default:
          throw new BadRequestException()
      }
    }

    const { question } = result.value

    return { question: QuestionPresenter.toHTTP(question) }
  }
}
