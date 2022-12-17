import Redis from '@ioc:Adonis/Addons/Redis'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class Mantainer {
  public async handle({request, response}: HttpContextContract, next: () => Promise<void>) {
    const domain = (new URL(request.completeUrl())).hostname
    const cachedMantainerId = await Redis.hget('authorized-domains', domain)
    
    if (!cachedMantainerId) {
      return response.abort('E_INVALID_DOMAIN', 412)
    }
    const body = request.body()
    const updatedBody = {...body, mantainerId: Number(cachedMantainerId)}
    request.updateBody(updatedBody)

    await next()
  }
}
