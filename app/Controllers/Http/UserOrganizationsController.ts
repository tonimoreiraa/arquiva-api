// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import User from "App/Models/User"
import UserOrganization from "App/Models/UserOrganization"

export default class UserOrganizationsController {

    async index({request}) {
        const userId = request.param('userId')
        const user = await User.findOrFail(userId)
        await user.load('organizations')

        return user.organizations.map(organization => organization.serialize())
    }

    async store({request, response}) {
        const userId = request.param('userId')
        const organizationId = request.input('organizationId')
        
        const pivots = await UserOrganization.query()
        .where('user_id', userId)
        .where('organization_id', organizationId)
        
        if (pivots.length) {
            return response.badRequest({message: 'O usuário já possuí essa permissão.'})
        }

        const pivot = await UserOrganization.create({userId, organizationId})

        return pivot.serialize()
    }

    async destroy({request, response}) {
        const userId = request.param('userId')
        const organizationId = request.param('id')
        
        const pivots = await UserOrganization.query()
        .where('user_id', userId)
        .where('organization_id', organizationId)
        
        if (!pivots.length) {
            return response.badRequest({message: 'O usuário não possuí essa permissão.'})
        }

        await pivots[0].delete()

        return {message: 'Permissão removida.'}
    }

}
