// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import User from "App/Models/User"
import LoginValidator from "App/Validators/LoginValidator"
import Hash from '@ioc:Adonis/Core/Hash'
import CreateUserValidator from "App/Validators/CreateUserValidator"

export default class AuthController {

    async signIn({request, auth, logger, response}) {
        await request.validate(LoginValidator)

        const email = request.input('email')
        const password = request.input('password')

        const user = await User.findByOrFail('email', email)

        if (!(await Hash.verify(user.password, password))) {
            logger.info(`Usuário ${user.id} falhou autenticação no IP ${request.ip()}`)
            return response.badRequest({message: 'Senha incorreta.'})
        }

        const token = await auth.use('api').generate(user)

        logger.info(`Usuário ${user.id} autenticou no IP ${request.ip()}`)

        return { user, token }
    }

    async signUp({ request, logger, auth }) {
        const payload = await request.validate(CreateUserValidator)

        const user = await User.create(payload)
        logger.info(`User ${user.id} registered.`)

        const token = await auth.use('api').generate(user)
        
        return { user: user.serialize(), token }
    }

    async getUserData({ auth })
    {
        return auth.user
    }

}
