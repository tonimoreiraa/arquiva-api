import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column } from '@ioc:Adonis/Lucid/Orm'
import {v4 as uuid} from 'uuid';

export default class DocumentDownload extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public documentId: string

  @column()
  public userId: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static genUuid(download: DocumentDownload) {
    download.id = uuid()
  }
}
