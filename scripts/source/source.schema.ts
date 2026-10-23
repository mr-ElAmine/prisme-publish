import { sourceConfig } from '@prisme/publish-skill/internal/source/source.config.ts'
import { isAbsolute, normalize } from 'pathe'
import { z } from 'zod'

const name = z.string().min(1).max(100)
const reference = z
  .string()
  .endsWith('.yaml')
  .refine((path) => {
    const normalized = normalize(path)
    return !isAbsolute(normalized) && !normalized.split('/').includes('..')
  })

export const projectSourceSchema = z.strictObject({
  format: z.literal(sourceConfig.projectFormat),
  id: name,
  title: z.string().min(1),
  description: z.string().default(''),
  lots: z.array(z.json()).default([]),
  tokens: reference.optional(),
  defaults: reference.optional(),
  styles: z.array(reference).default([]),
  blocks: z.record(name, reference).default({}),
  sections: z
    .array(
      z.strictObject({
        id: name,
        title: z.string().min(1),
        pages: z.array(reference).min(1),
      }),
    )
    .min(1),
})

export const styleSourceSchema = z.strictObject({
  format: z.literal('prisme/styles@1'),
  styles: z.record(name, z.json()),
})

// The server owns props validation. Locally, only identify source documents and their container.
export const pageSourceSchema = z.looseObject({ format: z.literal('prisme/page@2') })
export const blockSourceSchema = z.looseObject({ format: z.literal('prisme/block@1') })
export const dictionarySourceSchema = z.record(z.string(), z.json())
