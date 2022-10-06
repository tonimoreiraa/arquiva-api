import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column } from '@ioc:Adonis/Lucid/Orm'
import {v4 as uuid} from 'uuid';
import AppBaseModel from './AppBaseModel';

export default class DocumentDownload extends AppBaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public documentId: number

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
