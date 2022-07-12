// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import DirectoryIndex from "App/Models/DirectoryIndex"

export default class DirectoryIndexesController {

    async show({request}) {
        const indexId = request.param('id')
        const index = await DirectoryIndex.findOrFail(indexId)

        await index.load('listValues', (query) => query.orderByRaw('value COLLATE "pt_BR"'))
        
        return index.serialize()
    }

    async store({request, auth, logger}) {
        const data = request.only(['directoryId', 'name', 'type', 'displayAs', 'notNullable', 'min', 'max', 'minLength', 'maxLength', 'regex'])
        
        const index = await DirectoryIndex.create(data)

        logger.info(`User ${auth.user.id} created index ${index.id}`)
        
        return index.serialize()
    }

    async update({request, logger, auth}) {
        const indexId = request.param('id')
        const oldIndex = await DirectoryIndex.findOrFail(indexId)
        const data = request.only(['directoryId', 'name', 'type', 'displayAs', 'notNullable', 'min', 'max', 'minLength', 'maxLength', 'regex'])

        const index = await DirectoryIndex.updateOrCreate({id: oldIndex.id}, data)
        logger.info(`User ${auth.user.id} updated index ${index.id}`)
        
        return index.serialize()
    }
}
