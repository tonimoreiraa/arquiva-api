import { BasePolicy } from '@ioc:Adonis/Addons/Bouncer'
import User from 'App/Models/User'
import Organization from 'App/Models/Organization'

export default class OrganizationsPolicy extends BasePolicy {
	public async view(user: User, organization: Organization) {
		if (user.type == 'super-admin') return true
		if (!user.organizations) await user.load('organizations')
		const allowedOrganizations = user.organizations.map(organization => organization.id)
		return allowedOrganizations.includes(organization.id) || user.type == 'admin'
	}
	public async update(user: User, organization: Organization) {
		if (!user.organizations) await user.load('organizations')
		const allowedOrganizations = user.organizations.map(organization => organization.id)
		return allowedOrganizations.includes(organization.id) && user.type == 'admin'
	}
	public async delete(user: User, organization: Organization) {
		if (!user.organizations) await user.load('organizations')
		const allowedOrganizations = user.organizations.map(organization => organization.id)
		return allowedOrganizations.includes(organization.id) && user.type == 'admin'
	}
}
