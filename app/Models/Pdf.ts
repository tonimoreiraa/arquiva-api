import { DateTime } from 'luxon'
import { HasMany, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import AppBaseModel from './AppBaseModel'
import PdfImage from './PdfImage'

export default class Pdf extends AppBaseModel {
  @column({ isPrimary: true })
  public id: number

  @hasMany(() => PdfImage)
  public images: HasMany<typeof PdfImage>

  @column()
  public userId: number

  @column()
  public outputPath: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
