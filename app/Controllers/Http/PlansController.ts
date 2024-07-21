import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { DocumentVersion } from 'App/Models'
import Directory from 'App/Models/Directory'

export default class PlansController {

    async getStorage({ auth }: HttpContextContract)
    {
        const userId: number = auth.user?.id || 0

        const dics = await Directory.query()
            .whereRaw(`id IN (SELECT directory_id as id FROM directory_shares WHERE user_id = ${userId} and type = 'owner')`)

        const all = await DocumentVersion.query()
            .count('*', 'documents')
            .sum('size', 'usage')
            .where('editor_id', userId)
            .firstOrFail()

        const directories = await Promise.all(dics.map(async (directory) => {
            const all = await DocumentVersion.query()
            .count('*', 'documents')
            .sum('size', 'usage')
            .whereRaw(`document_id IN (SELECT document_id FROM documents WHERE directory_id = ${directory.id})`)
            .firstOrFail()

            return {...directory.serialize(), ...all.$extras}
        }))

        return { plan: all.$extras, directories }
    }

}
