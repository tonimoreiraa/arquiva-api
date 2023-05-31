import { DateTime } from 'luxon'
import { BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import DirectoryIndex from './DirectoryIndex'
import AppBaseModel from './AppBaseModel'

export default class DocumentIndex extends AppBaseModel {

  public static table = 'document_indexes'

  @column({ isPrimary: true })
  public id: number

  @column()
  public documentId: number

  @column()
  public indexId: number

  @belongsTo(() => DirectoryIndex, {foreignKey: 'indexId'})
  public index: BelongsTo<typeof DirectoryIndex>

  @column()
  public number: number

  @column()
  public string: string

  @column()
  public boolean: boolean
  
  @column()
  public list: number

  @column()
  public datetime: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
