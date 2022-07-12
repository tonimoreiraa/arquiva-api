// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import User from "App/Models/User"
import UserDirectory from "App/Models/UserDirectory"

export default class UserDirectoriesController {

    async index({request}) {
        const userId = request.param('userId')
        const user = await User.findOrFail(userId)
        await user.load('directories')

        return user.directories.map(directory => directory.serialize())
    }

    async store({request, response}) {
        const userId = request.param('userId')
        const directoryId = request.input('directoryId')
        
        const pivots = await UserDirectory.query()
        .where('user_id', userId)
        .where('directory_id', directoryId)
        
        if (pivots.length) {
            return response.badRequest({message: 'O usuário já possuí essa permissão.'})
        }

        const pivot = await UserDirectory.create({userId, directoryId})

        return pivot.serialize()
    }

    async destroy({request, response}) {
        const userId = request.param('userId')
        const directoryId = request.param('id')
        
        const pivot = await UserDirectory.query()
        .where('user_id', userId)
        .where('directory_id', directoryId)
        .first()
        
        if (!pivot) {
            return response.badRequest({message: 'O usuário não possuí essa permissão.'})
        }

        await pivot.delete()

        return { message: 'Permissão removida.' }
    }

}
