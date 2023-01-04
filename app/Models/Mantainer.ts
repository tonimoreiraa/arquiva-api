import { DateTime } from 'luxon'
import { afterCreate, BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import Redis from '@ioc:Adonis/Addons/Redis'
import { CamelCaseNamingStrategy } from '../../providers/AppProvider'

export default class Mantainer extends BaseModel {
  
  public static namingStrategy = new CamelCaseNamingStrategy()

  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column({
    consume: (v) => JSON.parse(v),
    prepare: (v) => JSON.stringify(v)
  })
  public authorizedDomains: string[]

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @afterCreate()
  public static async addToCache(maintainer: Mantainer)
  {
    for (const domain of maintainer.authorizedDomains) {
      await Redis.hset('authorized-domains', domain, maintainer.id)
    }
  }
}
