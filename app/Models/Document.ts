import { DateTime } from 'luxon'
import { column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import DocumentIndex from './DocumentIndex'
import AppBaseModel from './AppBaseModel'

export default class Document extends AppBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public documentId: string

  @hasMany(() => DocumentIndex)
  public indexes: HasMany<typeof DocumentIndex>

  @column()
  public organizationId: number

  @column()
  public directoryId: number

  @column()
  public editorId: number

  @column()
  public version: number

  @column()
  public path: string

  @column({serializeAs: null})
  public secretKey: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
