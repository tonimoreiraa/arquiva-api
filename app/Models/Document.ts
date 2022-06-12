import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import DocumentIndex from './DocumentIndex'
import Storage from './Storage'

export default class Document extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @hasMany(() => DocumentIndex)
  public indexes: HasMany<typeof DocumentIndex>

  @column()
  public organizationId: number

  @column()
  public directoryId: number

  @column()
  public storageId: number

  @belongsTo(() => Storage)
  public storage: BelongsTo<typeof Storage>

  @column()
  public editorId: number

  @column()
  public version: number

  @column()
  public path: string

  @column()
  public secretKey: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
