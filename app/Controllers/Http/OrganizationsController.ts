// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Organization from "App/Models/Organization";
import UserOrganization from "App/Models/UserOrganization";

export default class OrganizationsController {

    async index({auth}) {
        if (auth.user.type == 'super-admin') {
            return (await Organization.all()).map(o => o.serialize())
        }

        const userOrganizations = await UserOrganization.query().where('userId', auth.user.id)
        const organizations = await Organization.query().whereIn('id', userOrganizations.map(o => o.organizationId))

        return organizations.map(organization => organization.serialize())
    }

    async show({request, bouncer}) {
        const organizationId = request.param('id')
        const organization = await Organization.findOrFail(organizationId)
        await organization.load('directories', (query) => query.withCount('documents'))

        await bouncer.with('OrganizationsPolicy').authorize('view', organization)

        const totalDocuments = organization.directories.map(d => Number(d.$extras.documents_count)).reduce((x, y) => x + y, 0)

        return {
            ...organization.serialize(),
            totalDocuments,
            directories: organization.directories.map(directory => ({...directory.serialize(), documentsCount: directory.$extras.documents_count}))
        }
    }

    async store({request, auth, logger}) {
        const data = request.only(['name', 'storageId', 'mantainerId'])
        const organization = await Organization.create(data)

        await UserOrganization.create({userId: auth.user.id, organizationId: organization.id})
        
        logger.info(`Organization ${organization.id} created by user ${auth.user.id}`)
        
        return organization.serialize()
    }

    async update({request, auth, logger}) {
        const organizationId = request.param('id')
        const oldOrganization = await Organization.findOrFail(organizationId)
        
        const data = request.only(['name', 'storageId'])
        
        const organization = await Organization.updateOrCreate({id: oldOrganization.id}, data)
        
        logger.info(`Organization ${organization.id} updated by user ${auth.user.id}`)

        return organization.serialize()
    }

    async destroy({request, auth, logger}) {
        const organizationId = request.param('id')
        const organization = await Organization.findOrFail(organizationId)
        await organization.delete()

        logger.info(`Organization ${organization.id} deleted by user ${auth.user.id}`)

        return { message: 'OK' }
    }

}
