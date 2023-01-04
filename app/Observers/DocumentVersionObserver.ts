import type { ObserverContract } from '@ioc:Adonis/Addons/LucidObserver'
import fs from 'fs'
import DocumentVersion from 'App/Models/DocumentVersion'
import md5File from 'md5-file';
import Env from '@ioc:Adonis/Core/Env'
import Document from 'App/Models/Document';

export default class DocumentVersionObserver implements ObserverContract {
  public async beforeCreate(version: DocumentVersion) {
    // create file hash
    const filePath = await version.getLocalPath()
    if (fs.existsSync(filePath)) {
      version.hash = await md5File(filePath)
      version.size = (fs.statSync(filePath)).size
    } else {
      throw Error('Arquivo não existe.')
    }

    // aws sync
    if (Env.get('AWS_SYNC')) {
      // create paths
      await version.awsSync()
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