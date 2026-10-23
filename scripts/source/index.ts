import { clientConfig } from '@prisme/publish-skill/internal/client.config.ts'
import { SkillError } from '@prisme/publish-skill/internal/client.error.ts'
import { assembleProject } from '@prisme/publish-skill/internal/source/assembly.ts'
import { readSourceFile, resolveSourceEntry } from '@prisme/publish-skill/internal/source/files.ts'
import { parseSourceData, parseSourceYaml } from '@prisme/publish-skill/internal/source/parsing.ts'
import { sourceConfig } from '@prisme/publish-skill/internal/source/source.config.ts'
import { projectSourceSchema } from '@prisme/publish-skill/internal/source/source.schema.ts'
import type { SourceFiles } from '@prisme/publish-skill/internal/source/source.type.ts'
import { err, ok, Result, type ResultAsync, safeTry } from 'neverthrow'
import { basename, dirname, resolve } from 'pathe'
import { stringify } from 'yaml'
import { z } from 'zod'

function isProjectSource(data: unknown) {
  return z.object({ format: z.literal(sourceConfig.projectFormat) }).safeParse(data).success
}

// Read once, assemble once; validate and publish receive the same in-memory YAML string.
export function readPresentationSource(path: string): ResultAsync<string, SkillError> {
  return safeTry(async function* () {
    const entry = yield* resolveSourceEntry(path)
    const files: SourceFiles = {
      root: dirname(entry),
      contents: new Map(),
      remainingBytes: clientConfig.maxYamlBytes,
    }
    const entryName = basename(entry)
    const source = yield* readSourceFile(entry, files)
    const data = yield* parseSourceYaml(source, entryName)

    if (!isProjectSource(data)) return ok(source)

    const project = yield* parseSourceData(projectSourceSchema, data, entryName)
    const read = (reference: string) =>
      readSourceFile(resolve(files.root, reference), files).andThen((content) =>
        parseSourceYaml(content, reference),
      )
    const presentation = yield* assembleProject(project, read)
    const yaml = yield* Result.fromThrowable(
      () => stringify(presentation, { aliasDuplicateObjects: false, lineWidth: 100 }),
      (cause) => new SkillError('SOURCE_INVALID', { cause }),
    )()

    if (Buffer.byteLength(yaml, 'utf8') > clientConfig.maxYamlBytes) {
      return err(new SkillError('SOURCE_TOO_LARGE'))
    }

    return ok(yaml)
  })
}
