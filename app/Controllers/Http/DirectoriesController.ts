import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Directory from "App/Models/Directory"
import DirectoryShare from "App/Models/DirectoryShare"
import UserDirectory from "App/Models/UserDirectory"

export default class DirectoriesController {

    async index({ auth }: HttpContextContract) {
        const userId = auth.user?.id as number

        const directoryQuery = Directory.query()
        directoryQuery.whereRaw(`id IN (SELECT id FROM directory_shares WHERE user_id = ${userId} and accepted = true)`)
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
        await DirectoryShare.create({
            userId: auth.user.id,
            directoryId: directory.id,
            type: 'owner',
            accepted: true
        })

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
