// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import User from "App/Models/User"
import LoginValidator from "App/Validators/LoginValidator"
import Hash from '@ioc:Adonis/Core/Hash'

export default class AuthController {

    async login({request, auth, logger, response}) {
        await request.validate(LoginValidator)

        const email = request.input('email')
        const password = request.input('password')

        const user = await User.findByOrFail('email', email)

        if (!(await Hash.verify(user.password, password))) {
            logger.info(`Usuário ${user.id} falhou autenticação no IP ${request.ip()}`)
            return response.badRequest({message: 'Senha incorreta.'})
        }

        const {token} = await auth.use('api').generate(user)

        logger.info(`Usuário ${user.id} autenticou no IP ${request.ip()}`)

        return { user, token }
    }

}
