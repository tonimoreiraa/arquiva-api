// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Storage from "App/Models/Storage"

export default class StoragesController {
    async index() {
        const storages = await Storage.query()
            .withCount('documents', (query) => query.as('documentsCount'))
            .withCount('documents', (query) => query.sum('size').as('usedSpace'))
        return storages.map(storage => ({...storage.serialize(), ...storage.$extras}))
    }

    async show({request}) {
        const storageId = request.param('id')
        const storage = await Storage.findOrFail(storageId)
        
        return storage.serialize()
    }

    async store({request, auth, logger}) {
        const data = request.only(['name', 'path'])
        const storage = await Storage.create(data)

        logger.info(`Storage ${storage.id} created by user ${auth.user.id}`)
        
        return storage.serialize()
    }
}
