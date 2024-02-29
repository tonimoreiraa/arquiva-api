import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Directory from "App/Models/Directory"
import Document from "App/Models/Document"
import { v4 as uuid } from 'uuid';
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import DocumentIndex from "App/Models/DocumentIndex";
import CreateDocumentValidator from "App/Validators/CreateDocumentValidator";
import fs from 'fs';
import DirectoryIndex from "App/Models/DirectoryIndex";
import DocumentVersion from "App/Models/DocumentVersion";
import AdmZip from 'adm-zip';
import { Readable } from 'stream';
import DirectoryIndexListValue from "App/Models/DirectoryIndexListValue";
import Storage from 'App/Models/Storage';
export default class DocumentsController {

    async show({request}) {
        const documentId = request.param('id')
        const document = await Document.query().where('id', documentId)
        .preload('directory', query => query.preload('indexes'))
        .preload('editor')
        .firstOrFail()

        const documentIndexes = await DocumentIndex.query().preload('index').where('documentId', document.id)
        
        return {
            ...document.serialize(),
            indexes: await Promise.all(documentIndexes.map(async (index) => {
                var val: any = index[index.index.type]
                const directoryIndex: any = document.directory.indexes.find(i => i.id === index.indexId)
                if (directoryIndex.type == 'select') {
                    const value = await DirectoryIndexListValue.findOrFail(index[directoryIndex.type])
                    val = value
                }
                return {
                    id: index.index.id,
                    name: index.index.name,
                    type: index.index.type,
                    displayAs: index.index.displayAs,
                    value: val
                }
            })
        )}
    }

    paginate (arr, size: number) {
        return arr.reduce((acc, val, i) => {
            let idx = Math.floor(i / size)
            let page = acc[idx] || (acc[idx] = [])
            page.push(val)
        
            return acc
        }, [])
    }

    async search({ request }) {
        const directoryId = request.input('directoryId')
        const directory = await Directory.findOrFail(directoryId)
        const indexes = await DirectoryIndex.query().select('id', 'type', 'name', 'displayAs').where('directory_id', directory.id)

        const documentIndexesRaw = await DocumentIndex.query().where('index_id', 'IN', indexes.map(index => index.id))

        var documents: any = Object.fromEntries(documentIndexesRaw.map(i => [i.documentId, {}]))
        for (const index of indexes) {
            for (const documentIndex of documentIndexesRaw.filter(x => x.indexId == index.id)) {
                documents[documentIndex.documentId][index.id] = index.type == 'select' ? (await DirectoryIndexListValue.findOrFail(documentIndex[index.type])).serialize() : documentIndex[index.type]
            }
        }

        documents = Object.entries(documents).map((entry: any) => ({documentId: entry[0], ...entry[1]}))

        const userIndexes = request.input('indexes')
        for (const indexId in userIndexes) {
            var {operator, value} = userIndexes[indexId]
            documents = documents.filter(document => {
                if (operator == 'interval') {
                    const index = indexes.find(i => i.id == Number(indexId))
                    if (index?.type == 'datetime') {
                        value = value.map(v => new Date(v).getTime())
                        document[indexId] = new Date(document[indexId]).getTime()
                    }
                    return document[indexId] >= value[0] && document[indexId] <= value[1]
                }

                return eval(`(typeof document[indexId] == 'object' ? document[indexId].id : document[indexId]) ${operator} value`)
            })
        }

        // if no index query, select all documents
        if (!userIndexes || !Object.values(userIndexes).length) {
            documents = await Promise.all((await Document.query().select('id').where('directoryId', directory
            .id)
            .preload('indexes', index => index.orderBy('indexId')))
            .map(async (document) => {
                const d = {documentId: document.id}
                const d2 = Object.fromEntries(await Promise.all(document.indexes.map(async (index) => {
                    const directoryIndex: any = indexes.find(i => i.id === index.indexId)
                    if (directoryIndex.type == 'select') {
                        const value = await DirectoryIndexListValue.findOrFail(index[directoryIndex.type])
                        return [index.indexId, value]
                    }
                    return [index.indexId, index[directoryIndex.type]]
                })))
                return {...d, ...d2}
            }))
        }


        var page = request.input('page')
        page = page ? page - 1 : 0
        const perPage = request.input('pageLimit') ?? 25
        const pagination = this.paginate(documents, perPage)

        return {
            perPage,
            currentPage: page + 1,
            lastPage: pagination.length,
            total: documents.length,
            results: pagination[page] ?? [],
            indexes
        }
    }

    async duplicate({request, auth}) {
        const documentId = request.param('id')
        const document = await Document.findOrFail(documentId)
        const duplicate = await Document.create({...document.toJSON(), id: undefined, editorId: auth.user.id, createdAt: undefined, updatedAt: undefined})

        const documentIndexes = await DocumentIndex.query().preload('index').where('documentId', document.id)

        for (const indexKey in documentIndexes) {
            const index = documentIndexes[indexKey]
            documentIndexes[indexKey] = await DocumentIndex.create({...index.toJSON(), documentId: duplicate.id, id: undefined})
        }

        return duplicate
    }

    async store({request, auth, logger, response}: HttpContextContract) {
        const storage = await Storage.firstOrFail()
        await request.validate(CreateDocumentValidator)
        // verify if document already exists
        
        if (await Document.query().where('documentId', request.input('documentId')).first()) {
            return response.status(409).send({message: 'O arquivo já foi enviado.'})
        }
        
        const directoryId = request.input('directoryId')
        const directory = await Directory.findOrFail(directoryId)
        await directory.load('indexes')

        // validate indexes
        const s = schema.create(Object.fromEntries(directory.indexes.map(index => {
            const schemaType = {
                datetime: 'date',
                select: 'number'
            }[index.type] ?? index.type
            
            const args: any = []

            args.push([])
            if (index.minLength) args[0].push(rules.minLength(index.minLength))
            if (index.maxLength) args[0].push(rules.maxLength(index.maxLength))
            if (index.min || index.max) args[0].push(rules.range(index.min, index.max))
            if (index.regex) args[0].push(rules.regex(new RegExp(index.regex)))
            if (index.type == 'select') args[0].push(rules.exists({table: 'directory_index_list_values', column: 'id'}))
            if (schemaType == 'string') args.unshift({})

            return ['index-' + index.id, index.notNullable ? schema[schemaType](...args) : schema[schemaType].optional(...args)]
        })))
        const documentIndexesValues = await request.validate({ schema: s })
        console.log(documentIndexesValues)

        // define properties
        const data: any = request.only(['directoryId', 'documentId'])
        data.editorId = auth.user?.id
        data.version = 1
        data.secretKey = uuid()

        const now = new Date()
        const documentPath = `${now.getFullYear()}/${('00' + Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (60*60*24*1000))).slice(-3)}/${data.documentId}`
        fs.mkdirSync(`${storage.path}/${documentPath}`, {recursive: true})
        const file = request.file('file')

        fs.renameSync(file?.tmpPath as string, `${storage.path}/${documentPath}/${data.documentId}-v${data.version}.arq`, )

        await DocumentVersion.create({
            documentId: data.documentId,
            version: data.version,
            editorId: auth.user?.id,
            storageId: storage.id,
            path: documentPath,
            type: `${file?.type}/${file?.subtype}`,
            extname: file?.extname,
            size: file?.size
        })

        // create document
        const document = await Document.create(data)
        
        // save indexes
        for (const indexKey in documentIndexesValues) {
            const indexId = parseInt(indexKey.slice(6))
            const indexValue = documentIndexesValues[indexKey]
            const index = directory.indexes.find(x => x.id == indexId)
            
            if (index) {
                await DocumentIndex.create({documentId: document.id, indexId, [index.type]: indexValue})
            }
        }

        logger.info(`User ${auth.user?.id} created document ${document.id}`)
        
        return document.serialize()
    }

    async download({request, response, auth, logger}: HttpContextContract) {
        const documentId = request.param('id')
        const document = await Document.findOrFail(documentId)

        const download = await Document.export(document, auth.user?.id as number)

        response.header('Content-Type', download.version.type)
        response.header('download-id', download.download.id)
        response.header('Extname', download.version.extname)
        response.header('Access-Control-Expose-Headers', 'Extname')

        response.download(download.path, true)
        logger.info(`User ${auth.user?.id} download document ${document.id}. DownloadID: ${download.download.id}`)
    }

    async exportList({request, auth, response})
    {
        const indexesIDs = request.input('indexes')
        const indexes = await DirectoryIndex.findMany(indexesIDs)
        const documentsIDs = request.input('documents')
        const documents = await Document.findMany(documentsIDs)
        const zip = new AdmZip()

        for (const document of documents) {
            const d = await Document.export(document, auth.user.id)
            await document.load('indexes', query => query.where('index_id', 'IN', indexesIDs))
            const documentIndexes = document.indexes
            var path = [...indexesIDs.map(id => {
                const index: any = indexes.find(i => i.id == id)
                // @ts-ignore
                return documentIndexes.find(i => i.indexId == index.id)[index.type].toLocaleString().replace('/', '-').replace('\\', '-')
            }), document.id]

            zip.addFile(path.join('-') + '.' + d.version.extname, fs.readFileSync(d.path))
        }

        response.header('Content-Type', 'application/zip')

        return response.stream(Readable.from(zip.toBuffer()))
    }

}
