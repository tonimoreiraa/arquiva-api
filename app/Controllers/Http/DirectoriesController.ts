// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Directory from "App/Models/Directory"
import UserDirectory from "App/Models/UserDirectory"

export default class DirectoriesController {

    async index({request, auth}) {
        const userDirectories = await UserDirectory.query().where('userId', auth.user.id)
        
        const directoryQuery = Directory.query()
        if (auth.user.type !== 'super-admin') {
            directoryQuery.whereIn('id', userDirectories.map(d => d.directoryId))
        }
        directoryQuery.preload('indexes', (index) => index.orderBy('id'))

        const directories = await directoryQuery

        await Promise.all(directories.map(directory => Promise.all(directory.indexes.map(index => index.load('listValues', (query) => query.orderByRaw('value COLLATE "pt_BR"'))))))

        return directories.map(directory => directory.serialize())
    }

    async show({request}) {
        const directoryId = request.param('id')
        const directory = await Directory.findOrFail(directoryId)
        
        await directory.load('indexes')
        await Promise.all(directory.indexes.map(index => index.load('listValues', (query) => query.orderByRaw('value COLLATE "pt_BR"'))))
        
        return directory.serialize()
    }

    async store({request, logger, auth}) {
        const data = request.only(['name', 'mantainerId'])

        const directory = await Directory.create(data)

        await UserDirectory.create({userId: auth.user.id, directoryId: directory.id})

        logger.info(`User ${auth.user.id} created directory ${directory.id}`)

        return directory.serialize()
    }

    async update({request, logger, auth}) {
        const directoryId = request.param('id')
        const oldDirectory = await Directory.findOrFail(directoryId)

        const data = request.only(['name'])
        const directory = await Directory.updateOrCreate({id: oldDirectory.id}, data)

        logger.info(`User ${auth.user.id} updated directory ${directory.id}`)

        return directory.serialize()
    }

}
