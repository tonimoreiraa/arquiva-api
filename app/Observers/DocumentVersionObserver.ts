import type { ObserverContract } from '@ioc:Adonis/Addons/LucidObserver'
import fs from 'fs'
import DocumentVersion from 'App/Models/DocumentVersion'
import md5File from 'md5-file';
import Drive from '@ioc:Adonis/Core/Drive'
import Env from '@ioc:Adonis/Core/Env'
import Logger from '@ioc:Adonis/Core/Logger'
import Document from 'App/Models/Document';

export default class DocumentVersionObserver implements ObserverContract {
  public async beforeCreate(version: DocumentVersion) {
    // create file hash
    const filePath = await version.getLocalPath()
    if (fs.existsSync(filePath)) {
      version.hash = await md5File(filePath)
    } else {
      throw Error('Arquivo não existe.')
    }

    // aws sync
    if (Env.get('AWS_SYNC')) {
      // create paths
      version.s3Synced = false
      try {
        const localPath = await version.getLocalPath()
        const driverPath = `storage-${version.storageId}/${version.path}/${version.documentId}/${version.documentId}-v${version.version}.ged`

        // send to aws
        const s3 = Drive.use('s3')
        const file = fs.createReadStream(localPath)
        await s3.putStream(driverPath, file)
        version.s3Synced = true
      } catch (e) {
        Logger.error(`Falha ao sincronizar com AWS S3 versão ${version.version} do documento ${version.documentId}. ` + e)
      }
    }
  }

  public async beforeDelete(version: DocumentVersion): Promise<void> {
    // delete from local file
    const documentsUsing = await Document.query().where('document_id', version.documentId).where('version', version.version)
    if (documentsUsing.length) {
      throw new Error('Existem documentos utilizando esta versão.')
    }

    // delete file
    const filePath = await version.getLocalPath()
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  }
}