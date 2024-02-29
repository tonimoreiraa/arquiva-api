import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import DirectoryShare from 'App/Models/DirectoryShare'
import User from 'App/Models/User'
import DirectoryShareValidator from 'App/Validators/DirectoryShareValidator'

export default class DirectorySharesController {

    async invite({ request }: HttpContextContract)
    {
        const payload = await request.validate(DirectoryShareValidator)
        const user = await User.findByOrFail('email', payload.email)

        await DirectoryShare.create({
            directoryId: payload.directoryId,
            userId: user.id,
            type: payload.type,
            accepted: false,
        })
    }

}
