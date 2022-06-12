import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class DocumentVersion extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public documentId: string

  @column()
  public editorId: number

  @column()
  public version: number

  @column()
  public hash: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
