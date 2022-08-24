import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, beforeDelete, beforeSave, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import fs from 'fs'
import Storage from './Storage'
import md5File from 'md5-file';
import Document from './Document';
import User from './User';
import Drive from '@ioc:Adonis/Core/Drive'
import Env from '@ioc:Adonis/Core/Env'
export default class DocumentVersion extends BaseModel {
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

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  public async getLocalPath(): Promise<string> {
    const storage = await Storage.findOrFail(this.storageId)
    return `${storage.path}/${this.path}/${this.documentId}/${this.documentId}-v${this.version}.ged`
  }

  @beforeCreate()
  public static async createHash(version: DocumentVersion) {
    const filePath = await version.getLocalPath()
    if (fs.existsSync(filePath)) {
      version.hash = await md5File(filePath)
    } else {
      throw Error('Arquivo não existe.')
    }
  }

  @beforeSave()
  public static async awsSync(version: DocumentVersion) {
    if (Env.get('AWS_SYNC') === false) {
      return false
    }

    // create paths
    const localPath = await version.getLocalPath()
    const driverPath = `storage-${version.storageId}/${version.path}/${version.documentId}/${version.documentId}-v${version.version}.ged`

    // send to aws
    const s3 = Drive.use('s3')
    const file = fs.createReadStream(localPath)
    await s3.putStream(driverPath, file)
  }

  @beforeDelete()
  public static async deleteLocalFile(version: DocumentVersion) {
    const documentsUsing = await Document.query().where('document_id', version.documentId).where('version', version.version)
    if (documentsUsing.length) {
      throw new Error('Existem documentos utilizando esta versão.')
    }
    const filePath = await version.getLocalPath()
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  }
}
