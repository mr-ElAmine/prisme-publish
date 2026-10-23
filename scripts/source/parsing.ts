import { SkillError } from '@prisme/publish-skill/internal/client.error.ts'
import { sourceConfig } from '@prisme/publish-skill/internal/source/source.config.ts'
import { Result } from 'neverthrow'
import { isAlias, parseDocument, visit } from 'yaml'
import { z } from 'zod'

export function parseSourceYaml(source: string, file: string): Result<unknown, SkillError> {
  return Result.fromThrowable(
    () => {
      const document = parseDocument(source, {
        version: '1.2',
        schema: 'core',
        strict: true,
        uniqueKeys: true,
        prettyErrors: false,
      })

      if (document.errors.length || document.warnings.length) {
        throw new SkillError('SOURCE_INVALID', {
          file,
          issues: [...document.errors, ...document.warnings].map((issue) => ({
            path: '',
            code: issue.code,
          })),
        })
      }

      let nodes = 0
      visit(document, (_key, node, path) => {
        nodes += 1
        if (isAlias(node) || path.length > sourceConfig.maxDepth || nodes > sourceConfig.maxNodes) {
          throw new SkillError('SOURCE_INVALID', { file })
        }
      })

      return document.toJS({ maxAliasCount: 0 })
    },
    (cause) =>
      cause instanceof SkillError ? cause : new SkillError('SOURCE_INVALID', { file, cause }),
  )()
}

export function parseSourceData<Data>(schema: z.ZodType<Data>, data: unknown, file: string) {
  return Result.fromThrowable(
    () => schema.parse(data),
    (cause) =>
      new SkillError('SOURCE_INVALID', {
        file,
        cause,
        issues:
          cause instanceof z.ZodError
            ? cause.issues.map((issue) => ({ path: issue.path.join('.'), code: issue.code }))
            : [],
      }),
  )()
}
