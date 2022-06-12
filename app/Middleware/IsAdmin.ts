import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class IsAdmin {
  public async handle({auth, response}: HttpContextContract, next: () => Promise<void>) {
    if (!auth.user || auth.user.type != 'admin') return response.status(403)
    await next()
  }
}
