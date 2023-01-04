// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Mantainer from "App/Models/Mantainer";
import CreateMantainerValidator from "App/Validators/CreateMantainerValidator";

export default class MantainersController {

    async index()
    {
        const mantainers = await Mantainer.all()
        return mantainers.map(mantainer => mantainer.serialize())
    }

    async store({request})
    {
        const payload = await request.validate(CreateMantainerValidator)
        const mantainer = await Mantainer.create(payload)
        return mantainer.serialize()
    }

}
