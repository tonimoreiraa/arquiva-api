import { DateTime } from 'luxon'
import { column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import AppBaseModel from './AppBaseModel'
import Directory from './Directory'

export default class Organization extends AppBaseModel {

  @hasMany(() => Directory)
  public directories: HasMany<typeof Directory>

  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public storageId: number

  @column()
  public isDeleted: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
