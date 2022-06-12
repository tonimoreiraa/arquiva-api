// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Directory from "App/Models/Directory"

export default class DirectoriesController {

    async index({request}) {
        const organizationId = request.input('organizationId')
        const directories = await Directory.query().where('organization_id', organizationId)

        return directories.map(directory => directory.serialize())
    }

    async show({request}) {
        const directoryId = request.param('id')
        const directory = await Directory.findOrFail(directoryId)
        
        await directory.load('indexes')
        
        return directory.serialize()
    }

    async store({request, logger, auth}) {
        const data = request.only(['name', 'organizationId'])

        const directory = await Directory.create(data)

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
