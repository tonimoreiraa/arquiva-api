import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column } from '@ioc:Adonis/Lucid/Orm'
import fs from 'fs';

export default class Storage extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public path: string

  @column()
  public active: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static validate(storage: Storage) {
    if (!fs.existsSync(storage.path)) {
      throw new Error('Storage não existe.')
    }
    fs.mkdirSync(storage.path + '/temp')
  }
}
