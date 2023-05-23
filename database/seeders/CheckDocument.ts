import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import { DocumentVersion } from 'App/Models'
import fs from 'fs'
import Logger from '@ioc:Adonis/Core/Logger'

export default class extends BaseSeeder {
  public async run () {
    const encrypt = (await import('node-file-encrypt')).default
    const documentVersions = await DocumentVersion.query().preload('storage').preload('document')
    for (const version of documentVersions) {
      // decrypt file
      const encryptedFilePath = await version.getLocalPath()
      if (fs.existsSync(encryptedFilePath)) {
        const encryptedFile = new encrypt.FileEncrypt(encryptedFilePath, `${version.storage.path}/temp`)
        encryptedFile.openSourceFile()
        await encryptedFile.decryptAsync(version.document.secretKey)
        const data = fs.readFileSync(encryptedFile.decryptFilePath).toString('utf-8')

        if (!data.includes('%%EOF') || !data.includes('endstream')) {
          Logger.error(`O arquivo ${version.documentId} (versão ${version.version}) está corrompido.`)
        }
      } else {
        Logger.error(`O arquivo ${version.documentId} (versão ${version.version}) não existe`)
      }

    }
  }
}
