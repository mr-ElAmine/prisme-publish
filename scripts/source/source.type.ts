import type { SkillError } from '@prisme/publish-skill/internal/client.error.ts'
import type { projectSourceSchema } from '@prisme/publish-skill/internal/source/source.schema.ts'
import type { ResultAsync } from 'neverthrow'
import type { z } from 'zod'

export type ProjectSource = z.output<typeof projectSourceSchema>
export type ReadSourceFile = (reference: string) => ResultAsync<unknown, SkillError>

export type SourceFiles = {
  readonly root: string
  readonly contents: Map<string, string>
  remainingBytes: number
}
