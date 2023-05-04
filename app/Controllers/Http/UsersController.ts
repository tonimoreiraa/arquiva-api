// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import User from "App/Models/User";
import CreateUserValidator from "App/Validators/CreateUserValidator";

export default class UsersController {
    async index() {
        const users = await User.all()
        return users.map(user => user.serialize())
    }

    async show({request}) {
        const userId = request.param('id')
        const user = await User.findOrFail(userId)

        return user.serialize()
    }

    async store({request, auth, logger}) {
        await request.validate(CreateUserValidator)

        const data = request.only(['name', 'type', 'email', 'password', 'mantainerId'])
        const user = await User.create(data)
        logger.info(`User ${user.id} created by user ${auth.user.id}`)
        
        return user.serialize()
    }

    async update({request, auth, logger}) {
        const userId = request.param('id')
        const oldUser = await User.findOrFail(userId)

        const data = request.only(['name', 'type', 'email', 'password'])
        const user = await User.updateOrCreate({ id: oldUser.id }, data)

        logger.info(`User ${user.id} updated by user ${auth.user.id}`)
        
        return user.serialize()
    }

}
