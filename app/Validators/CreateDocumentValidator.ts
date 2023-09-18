import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateDocumentValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    directoryId: schema.number([rules.exists({table: 'directories', column: 'id'})]),
    documentId: schema.string({})
  })

  public messages: CustomMessages = {
    'documentId.required': 'Você precisa enviar um documentId.',
  }
}
