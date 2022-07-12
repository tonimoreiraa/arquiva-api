// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import DirectoryIndexListValue from "App/Models/DirectoryIndexListValue";

export default class DirectoryIndexesListValuesController {
    async index({request}) {
        const indexId = request.param('indexId')
        const values = await DirectoryIndexListValue.query().where('index_id', indexId)

        return values.map(value => value.serialize())
    }

    async store({request}) {
        const indexId = request.param('indexId')
        const valueName = request.input('value')
        const data = {indexId, value: valueName}

        const value = await DirectoryIndexListValue.updateOrCreate(data, data)

        return value.serialize()
    }

    async destroy({request}) {
        const indexId = request.param('indexId')
        const valueName = request.param('id')

        const value = await DirectoryIndexListValue.query().where('index_id', indexId).where('value', valueName).firstOrFail()
        await value.delete()

        return { message: 'OK' }
    }
}
