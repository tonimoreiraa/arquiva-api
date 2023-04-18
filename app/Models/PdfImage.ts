import { DateTime } from 'luxon'
import { BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Pdf from './Pdf'
import AppBaseModel from './AppBaseModel'

export default class PdfImage extends AppBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public pdfId: number

  @belongsTo(() => Pdf)
  public pdf: BelongsTo<typeof Pdf>

  @column()
  public index: number

  @column()
  public path: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
