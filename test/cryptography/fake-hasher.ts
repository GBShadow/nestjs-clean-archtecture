import { HashCompare } from '@/domain/forum/application/cryptography/hash-compare'
import { HashGenerator } from '@/domain/forum/application/cryptography/hash-generator'

export class FakeHasher implements HashCompare, HashGenerator {
  async compare(plain: string, hashed: string): Promise<boolean> {
    return plain.concat('-hash') === hashed
  }

  async hash(plain: string): Promise<string> {
    return plain.concat('-hash')
  }
}
