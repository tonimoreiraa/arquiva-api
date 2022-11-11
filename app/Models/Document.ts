import { DateTime } from 'luxon'
import { BelongsTo, belongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import DocumentIndex from './DocumentIndex'
import AppBaseModel from './AppBaseModel'
import Organization from './Organization'
import Directory from './Directory'
import User from './User'

export default class Document extends AppBaseModel {
  @column({ isPrimary: true })
  public id: number

  @belongsTo(() => Organization)
  public organization: BelongsTo<typeof Organization>

  @belongsTo(() => Directory)
  public directory: BelongsTo<typeof Directory>

  @belongsTo(() => User, {foreignKey: 'editorId'})
  public editor: BelongsTo<typeof User>

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
