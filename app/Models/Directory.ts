import { DateTime } from 'luxon'
import { column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import DirectoryIndex from './DirectoryIndex'
import { CamelCaseNamingStrategy } from '../../providers/AppProvider'
import AppBaseModel from './AppBaseModel'

export default class Directory extends AppBaseModel {
  @column({ isPrimary: true })
  public id: number

  @hasMany(() => DirectoryIndex)
  public indexes: HasMany<typeof DirectoryIndex>

  @column()
  public organizationId: number

  @column()
  public name: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
