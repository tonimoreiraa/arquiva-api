import Database from '@ioc:Adonis/Lucid/Database'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Organization from 'App/Models/Organization'
import Storage from 'App/Models/Storage'
import Mantainer from 'App/Models/Mantainer'
import Directory from 'App/Models/Directory'
import DirectoryIndex from 'App/Models/DirectoryIndex'
import DirectoryIndexListValue from 'App/Models/DirectoryIndexListValue'
import axios from 'axios'
import https from 'https'
import md5 from 'md5'
import Logger from '@ioc:Adonis/Core/Logger'
import AdmZip from 'adm-zip'

const DirectoryIndexType = {
  text: 'string',
  select: 'list',
  date: 'datetime',
  url: 'string',
  email: 'string'
}

const directoryIndexDisplayAs = (index: any) => {
  if (index.accepts == 'date') return 'date'
  const name = index.name.toLowerCase()
  if (name.includes('cpf') || name.includes('cnpj')) {
    return 'cpf-cnpj'
  }
  return undefined
}

const agent = new https.Agent({  
  rejectUnauthorized: false
})

export default class extends BaseSeeder {
  public async run () {
    // Write your database queries inside the run method
    const storageId = (await Storage.firstOrFail()).id
    const mantainerId = (await Mantainer.firstOrFail()).id

    // connect to db
    Database.manager.add('old_ged', {
      client: 'pg',
      connection: {
        host: '172.16.50.99',
        port: 2022,
        user: 'digitaliza',
        password: 'D!git4liza@2',
        database: 'digitaliza'
      },
      migrations: {
        naturalSort: true,
      },
      healthCheck: false,
      debug: false
    })

    const oldGedDb = Database.connection('old_ged', {mode: 'read'})
    const companies = await oldGedDb.query().select('*').from('companies')
    
    for (const company of companies) {
      const organizationData = { name: company.completename, storageId, mantainerId }
      Logger.info(`Importando empresa: ${organizationData.name}`)
      const organization = await Organization.updateOrCreate(organizationData, organizationData)
      const trees = await oldGedDb.query().select('*').from('tree').where('tree_id', company.tree_id).orWhere('id', company.tree_id)

      for (const tree of trees) {
        const directoryData = {name: tree.name, organizationId: organization.id, mantainerId}
        const directory = await Directory.updateOrCreate(directoryData, directoryData)

        for (const treeIndex of tree.indexes) {
          const indexData = {name: treeIndex.name, directoryId: directory.id}
          const index = await DirectoryIndex.updateOrCreate(indexData, {
            ...indexData,
            type: DirectoryIndexType[treeIndex.accepts] ?? treeIndex.accepts,
            notNullable: !!treeIndex.not_null,
            displayAs: directoryIndexDisplayAs(treeIndex),
            min: treeIndex.min !== '' ? Number(treeIndex.min) : undefined,
            max: treeIndex.max !== '' ? Number(treeIndex.max) : undefined,
            minLength: treeIndex.min !== '' ? Number(treeIndex.min) : undefined,
            maxLength: treeIndex.max !== '' ? Number(treeIndex.max) : undefined,
            regex: treeIndex.pattern !== '' ? treeIndex.pattern : undefined
          })

          if (index.type == 'list' && treeIndex.options) {
            for (const treeOption of treeIndex.options) {
              const optionData = {indexId: index.id, value: treeOption}
              await DirectoryIndexListValue.updateOrCreate(optionData, optionData)
            }
          }
        }

        const documents = await oldGedDb.query().select('*').from('files').where('tree_id', tree.id)

        for (const document of documents) {
          console.log('http://172.16.50.99:8080/' + document.file_path.replace('/App/', ''))
          try {
            const {data} = await axios.get('http://172.16.50.99:8080/' + document.file_path.replace('/App/', ''), {responseType: 'arraybuffer', httpsAgent: agent, maxContentLength: Infinity})
            console.log(data.toString('utf-8'))
            const zip = new AdmZip(data)
            zip.extractAllTo('./', true, md5(organization.name));
          } catch (e) {
            Logger.error(e)
          }
        }
      }
      
    }

  }
}
