import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { column, beforeSave, BaseModel, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import Organization from './Organization'
import Directory from './Directory'
import AppBaseModel from './AppBaseModel'

export default class User extends AppBaseModel {
  @column({ isPrimary: true })
  public id: number

  @manyToMany(() => Organization, {pivotTable: 'user_organizations'})
  public organizations: ManyToMany<typeof Organization>

  @manyToMany(() => Directory, {pivotTable: 'user_directories'})
  public directories: ManyToMany<typeof Directory>

  @column()
  public name: string

  @column()
  public type: 'client'|'operator'|'admin'|'super-admin'

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public rememberMeToken?: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword (user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }
}
