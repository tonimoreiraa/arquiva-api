import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Storage from './Storage'
import User from './User';
import { compose } from '@ioc:Adonis/Core/Helpers'
import { Observable } from '@ioc:Adonis/Addons/LucidObserver';
import DocumentVersionObserver from 'App/Observers/DocumentVersionObserver';
export default class DocumentVersion extends compose(BaseModel, Observable) {

  protected static $observers = [new DocumentVersionObserver()]

  @column({ isPrimary: true })
  public id: number

  @column()
  public storageId: number

  @belongsTo(() => Storage)
  public storage: BelongsTo<typeof Storage>

  @column()
  public path: string

  @column()
  public documentId: string

  @column()
  public editorId: number

  @belongsTo(() => User, {foreignKey: 'editorId'})
  public editor: BelongsTo<typeof User>

  @column()
  public version: number

  @column()
  public hash: string

  @column()
  public s3Synced: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  public async getLocalPath(): Promise<string> {
    const storage = await Storage.findOrFail(this.storageId)
    return `${storage.path}/${this.path}/${this.documentId}/${this.documentId}-v${this.version}.ged`
  }
}
