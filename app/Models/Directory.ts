import { DateTime } from 'luxon'
import { BaseModel, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import DirectoryIndex from './DirectoryIndex'

export default class Directory extends BaseModel {
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
