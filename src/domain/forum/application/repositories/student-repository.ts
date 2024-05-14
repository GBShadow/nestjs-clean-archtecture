import { Student } from '../../enterprise/entities/student'

export abstract class StudentRepository {
  abstract findByEmail(id: string): Promise<Student | null>
  abstract create(student: Student): Promise<void>
}
