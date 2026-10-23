import { SkillError } from '@prisme/publish-skill/internal/client.error.ts'
import { parseSourceData } from '@prisme/publish-skill/internal/source/parsing.ts'
import { sourceConfig } from '@prisme/publish-skill/internal/source/source.config.ts'
import {
  blockSourceSchema,
  dictionarySourceSchema,
  pageSourceSchema,
  styleSourceSchema,
} from '@prisme/publish-skill/internal/source/source.schema.ts'
import type {
  ProjectSource,
  ReadSourceFile,
} from '@prisme/publish-skill/internal/source/source.type.ts'
import { err, ok, safeTry } from 'neverthrow'

function readStyles(paths: readonly string[], read: ReadSourceFile) {
  return safeTry(async function* () {
    const styles = new Map<string, unknown>()

    for (const path of paths) {
      const data = yield* read(path)
      const source = yield* parseSourceData(styleSourceSchema, data, path)
      for (const [name, style] of Object.entries(source.styles)) {
        if (styles.has(name)) {
          return err(new SkillError('SOURCE_DUPLICATE', { file: path }))
        }
        styles.set(name, style)
      }
    }

    return ok(Object.fromEntries(styles))
  })
}

function readBlocks(paths: ProjectSource['blocks'], read: ReadSourceFile) {
  return safeTry(async function* () {
    const entries: [string, unknown][] = []
    for (const [name, path] of Object.entries(paths)) {
      const data = yield* read(path)
      const block = yield* parseSourceData(blockSourceSchema, data, path)
      entries.push([name, block])
    }
    return ok(Object.fromEntries(entries))
  })
}

function readSections(sections: ProjectSource['sections'], read: ReadSourceFile) {
  return safeTry(async function* () {
    const result = []
    for (const section of sections) {
      const steps = []
      for (const path of section.pages) {
        const data = yield* read(path)
        const { format: _format, ...page } = yield* parseSourceData(pageSourceSchema, data, path)
        steps.push(page)
      }
      result.push({ id: section.id, title: section.title, steps })
    }
    return ok(result)
  })
}

function readDictionary(path: string | undefined, fallback: unknown, read: ReadSourceFile) {
  if (!path) return Promise.resolve(ok(fallback))
  return read(path).andThen((data) => parseSourceData(dictionarySourceSchema, data, path))
}

export function assembleProject(project: ProjectSource, read: ReadSourceFile) {
  return safeTry(async function* () {
    const tokens = yield* await readDictionary(project.tokens, {}, read)
    const defaults = yield* await readDictionary(project.defaults, { css: {} }, read)
    const styles = yield* readStyles(project.styles, read)
    const blocks = yield* readBlocks(project.blocks, read)
    const sections = yield* readSections(project.sections, read)

    return ok({
      format: sourceConfig.presentationFormat,
      title: project.title,
      description: project.description,
      lots: project.lots,
      tokens,
      defaults,
      styles,
      blocks,
      sections,
    })
  })
}
