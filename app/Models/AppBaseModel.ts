import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { CamelCaseNamingStrategy } from '../../providers/AppProvider'

export default class AppBaseModel extends BaseModel {
 
  public static namingStrategy = new CamelCaseNamingStrategy()

  @column()
  public mantainerId: number

}
