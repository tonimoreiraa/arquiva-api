// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Directory from 'App/Models/Directory'
import Document from 'App/Models/Document'
import DocumentIndex from 'App/Models/DocumentIndex'

export default class DocumentIndexesController {

    async update({request}) {
        const documentId = request.param('documentId')
        const document = await Document.findOrFail(documentId)
        const directory = await Directory.findOrFail(document.directoryId)
        await directory.load('indexes')

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

            return ['index-' + index.id, schema[schemaType].optional(...args)]
        })))

        const indexes = await request.validate({schema: s})
        const documentIndexes: DocumentIndex[] = []

        for (const indexKey in indexes) {
            const indexId = parseInt(indexKey.slice(6))
            const indexValue = indexes[indexKey]
            const index = directory.indexes.find(x => x.id == indexId)
            
            if (index) {
                documentIndexes.push(await DocumentIndex.updateOrCreate({documentId: document.id, indexId}, {documentId: document.id, indexId, [index.type]: indexValue}))
            }
        }

        await Promise.all(documentIndexes.map(i => i.load('index')))

        return documentIndexes.map(index => index.serialize()).map(index => ({
            id: index.index.id,
            name: index.index.name,
            type: index.index.type,
            displayAs: index.index.displayAs,
            value: index[index.index.type]
        }))
    }
}
