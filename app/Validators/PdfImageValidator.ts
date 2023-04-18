import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class PdfImageValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    image: schema.file({size: '100mb', extnames: ['jpg', 'png'] }),
    index: schema.number()
  })

  public messages: CustomMessages = {}
}
