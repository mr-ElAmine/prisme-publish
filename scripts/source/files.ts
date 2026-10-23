import { clientConfig } from '@prisme/publish-skill/internal/client.config.ts'
import { SkillError } from '@prisme/publish-skill/internal/client.error.ts'
import { sourceConfig } from '@prisme/publish-skill/internal/source/source.config.ts'
import type { SourceFiles } from '@prisme/publish-skill/internal/source/source.type.ts'
import fs from 'fs-extra'
import { ResultAsync } from 'neverthrow'
import { isAbsolute, relative, resolve } from 'pathe'

function withinRoot(root: string, file: string) {
  const path = relative(root, file)
  return !isAbsolute(path) && path.split('/')[0] !== '..'
}

export function resolveSourceEntry(path: string) {
  return ResultAsync.fromThrowable(
    async () => {
      const entry = resolve(path)
      const information = await fs.stat(entry)
      return fs.realpath(information.isDirectory() ? resolve(entry, sourceConfig.entry) : entry)
    },
    (cause) => new SkillError('FILE_READ_FAILED', { cause }),
  )()
}

export function readSourceFile(path: string, files: SourceFiles) {
  const file = relative(files.root, path)

  return ResultAsync.fromThrowable(
    async () => {
      if (!withinRoot(files.root, path)) {
        throw new SkillError('SOURCE_REFERENCE_INVALID', { file })
      }

      const physicalPath = await fs.realpath(path)
      if (!withinRoot(files.root, physicalPath)) {
        throw new SkillError('SOURCE_REFERENCE_INVALID', { file })
      }

      const cached = files.contents.get(physicalPath)
      if (cached !== undefined) return cached

      if (files.contents.size >= sourceConfig.maxFiles) {
        throw new SkillError('SOURCE_INVALID', { file })
      }

      const information = await fs.stat(physicalPath)
      if (information.size > files.remainingBytes) {
        throw new SkillError('SOURCE_TOO_LARGE', { file })
      }

      const source = await fs.readFile(physicalPath, 'utf8')
      const bytes = Buffer.byteLength(source, 'utf8')
      if (bytes > files.remainingBytes || bytes > clientConfig.maxYamlBytes) {
        throw new SkillError('SOURCE_TOO_LARGE', { file })
      }

      files.remainingBytes -= bytes
      files.contents.set(physicalPath, source)
      return source
    },
    (cause) =>
      cause instanceof SkillError ? cause : new SkillError('FILE_READ_FAILED', { file, cause }),
  )()
}
