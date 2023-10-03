import { DateTime } from 'luxon'
import { column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import DirectoryIndexListValue from './DirectoryIndexListValue'
import AppBaseModel from './AppBaseModel'

export default class DirectoryIndex extends AppBaseModel {

  public static table = 'directory_indexes'

  @column({ isPrimary: true })
  public id: number

  @hasMany(() => DirectoryIndexListValue, {foreignKey: 'indexId', localKey: 'id'})
  public listValues: HasMany<typeof DirectoryIndexListValue>

  @column()
  public directoryId: number

  @column()
  public name: string

  @column()
  public type: 'number'|'string'|'boolean'|'select'|'datetime'

  @column()
  public displayAs: 'cpf-cnpj'|'rg'|'bank-account-number'|'brl-money'|'date'|'datetime'|'integer'|'float'

  @column()
  public notNullable: boolean

  @column()
  public min: number

  @column()
  public max: number

  @column()
  public minLength: number

  @column()
  public maxLength: number

  @column()
  public regex: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
