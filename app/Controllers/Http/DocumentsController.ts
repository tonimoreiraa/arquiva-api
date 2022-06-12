// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Directory from "App/Models/Directory"
import Document from "App/Models/Document"
import Organization from "App/Models/Organization"
import Storage from "App/Models/Storage"
import { v4 as uuid } from 'uuid';
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import DocumentIndex from "App/Models/DocumentIndex";
import CreateDocumentValidator from "App/Validators/CreateDocumentValidator";
import fs from 'fs';
import DirectoryIndex from "App/Models/DirectoryIndex";
import encrypt from 'node-file-encrypt';
import DocumentDownload from "App/Models/DocumentDownload";

export default class DocumentsController {

    async show({request}) {
        const documentId = request.param('id')
        const document = await Document.findOrFail(documentId)

        const documentIndexes = await DocumentIndex.query().preload('index').where('documentId', document.id)
        
        return {
            ...document.serialize(),
            indexes: documentIndexes.map(index => ({
                id: index.index.id,
                name: index.index.name,
                type: index.index.type,
                displayAs: index.index.displayAs,
                value: index[index.index.type]
            })
        ) }
    }

    async search({request}) {
        const directoryId = request.input('directoryId')
        const directory = await Directory.findOrFail(directoryId)
        const indexes = await DirectoryIndex.query().select('id', 'type', 'name').where('directory_id', directory.id)

        const documentIndexesRaw = await DocumentIndex.query().where('index_id', 'IN', indexes.map(index => index.id))

        var documents: any = {}
        indexes.forEach(index => {
            documentIndexesRaw.filter(x => x.indexId == index.id).forEach(documentIndex => {
                if (!documents[documentIndex.documentId]) {documents[documentIndex.documentId] = {}}
                documents[documentIndex.documentId][index.id] = documentIndex[index.type]
            })
        })
        documents = Object.entries(documents).map((entry: any) => ({documentId: entry[0], ...entry[1]}))

        const userIndexes = request.input('indexes')
        for (const indexId in userIndexes) {
            const {operator, value} = userIndexes[indexId]
            documents = documents.filter(document => {
                if (operator == 'range') return document[indexId] >= value[0] && document[indexId] <= value[1]
                return eval(`${document[indexId]} ${operator} ${value}`)
            })
        }        

        return documents
    }

    async store({request, auth, logger}) {
        await request.validate(CreateDocumentValidator)
        
        const directoryId = request.input('directoryId')
        const directory = await Directory.findOrFail(directoryId)
        await directory.load('indexes')

        const organization = await Organization.findOrFail(directory.organizationId)
        const storage = await Storage.findOrFail(organization.storageId)

        // validate indexes
        const s = schema.create(Object.fromEntries(directory.indexes.map(index => {
            const schemaType = {
                datetime: 'date',
                list: 'number'
            }[index.type] ?? index.type
            
            const args: any = []

            if (schemaType == 'string') args.push({})
            args.push([])
            if (index.minLength) args[1].push(rules.minLength(index.minLength))
            if (index.maxLength) args[1].push(rules.maxLength(index.maxLength))
            if (index.min || index.max) args[1].push(rules.range(index.min, index.max))
            if (index.regex) args[1].push(rules.regex(new RegExp(index.regex)))
            if (index.type == 'list') args[1].push(rules.exists({table: 'directory_index_list_values', column: 'id'}))

            return ['index-' + index.id, index.notNullable ? schema[schemaType](...args) : schema[schemaType].optional(...args)]
        })))
        const documentIndexesValues = await request.validate({ schema: s })

        // define properties
        const data = request.only(['directoryId'])
        data.organizationId = organization.id
        data.storageId = storage.id
        data.editorId = auth.user.id
        data.version = 0
        data.secretKey = uuid()
        data.id = uuid()

        // create path
        const now = new Date()
        data.path = `${now.getFullYear()}/${('00' + Math.floor((now.getTime() - new 
        Date(now.getFullYear(), 0, 0).getTime()) / (60*60*24*1000))).slice(-3)}`
        if (!fs.existsSync(storage.path + '/' + data.path)) {
            const yearFolder = storage.path + '/' + data.path.split('/')[0]
            if (!fs.existsSync(yearFolder)) fs.mkdirSync(yearFolder)
            fs.mkdirSync(storage.path + '/' + data.path)
        }

        // encrypt and save file
        const file = request.file('file')
        const encryptedFile = new encrypt.FileEncrypt(file.tmpPath, `${storage.path}/${data.path}`, '.ged.tmp', false)
        encryptedFile.openSourceFile()
        await encryptedFile.encryptAsync(data.secretKey)
        fs.renameSync(encryptedFile.encryptFilePath, `${storage.path}/${data.path}/${data.id}-${data.version}.ged`)

        // create document
        const document = await Document.create(data)
        
        // save indexes
        for (const indexKey in documentIndexesValues) {
            const indexId = parseInt(indexKey.slice(6))
            const indexValue = documentIndexesValues[indexKey]
            const index = directory.indexes.find(x => x.id == indexId)
            
            if (index) {
                await DocumentIndex.create({
                    documentId: document.id,
                    indexId,
                    [index.type]: indexValue
                })
            }
        }
        
        logger.info(`User ${auth.user.id} created document ${document.id}`)
        
        return document.serialize()
    }

    async download({request, response, auth, logger}) {
        const documentId = request.param('id')
        const document = await Document.findOrFail(documentId)
        await document.load('storage')
        
        // decrypt file
        const encryptedFilePath = `${document.storage.path}/${document.path}/${document.id}-${document.version}.ged`
        const encryptedFile = new encrypt.FileEncrypt(encryptedFilePath, `${document.storage.path}/temp`)
        encryptedFile.openSourceFile()
        await encryptedFile.decryptAsync(document.secretKey)

        // create download
        const download = await DocumentDownload.create({documentId: document.id, userId: 1})

        response.header('Content-Type', 'application/pdf')
        response.header('download-id', download.id)

        response.download(encryptedFile.decryptFilePath, true)
        logger.info(`User ${auth.user.id} download document ${document.id}. DownloadID: ${download.id}`)
    }

}
