import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common'
import slugify from 'slugify'
import { z } from 'zod'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'

const createQuestionBodySchema = z.object({
  title: z.string(),
  content: z.string(),
})
const bodyValidationPipe = new ZodValidationPipe(createQuestionBodySchema)
type CreateQuestionBodySchema = z.infer<typeof createQuestionBodySchema>

@Controller('/questions')
@UseGuards(JwtAuthGuard)
export class CreateQuestionController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Body(bodyValidationPipe) body: CreateQuestionBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { content, title } = body
    const userId = user.sub

    const questionAlreadyExists = await this.prisma.question.findUnique({
      where: {
        slug: slugify(title, { lower: true, strict: true }),
      },
    })

    if (questionAlreadyExists) {
      throw new BadRequestException('Question already exists')
    }

    const question = await this.prisma.question.create({
      data: {
        content,
        title,
        slug: slugify(title, { lower: true, strict: true }),
        authorId: userId,
      },
    })

    return question
  }
}
