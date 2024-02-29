import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class DirectoryShareValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    directoryId: schema.number([
        rules.exists({
        table: 'directories',
        column: 'id'
      })
    ]),
    email: schema.string([
      rules.email(),
      rules.exists({
        table: 'users',
        column: 'email'
      })
    ]),
    type: schema.enum(['read', 'write']) 
  })

  /**
   * Custom messages for validation failures. You can make use of dot notation `(.)`
   * for targeting nested fields and array expressions `(*)` for targeting all
   * children of an array. For example:
   *
   * {
   *   'profile.username.required': 'Username is required',
   *   'scores.*.number': 'Define scores as valid numbers'
   * }
   *
   */
  public messages: CustomMessages = {}
}
