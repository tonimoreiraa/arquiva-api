// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Storage from 'App/Models/Storage'
import fs from 'fs/promises'
import syspath from 'path'
import Application from '@ioc:Adonis/Core/Application'
import Env from '@ioc:Adonis/Core/Env'
export default class PathsController {

    async index({request})
    {
        const path = request.input('path') ?? Env.get('STORAGES_PATH')

        const usedPaths = (await Storage.query().select('path')).map(s => s.path)

        var paths: any = await fs.readdir(path, { withFileTypes: true })

        paths = (await Promise.all(paths
        .filter(p => p.isDirectory())
        .map(async p => ({name: p.name, path: await fs.realpath(syspath.join(path, p.name))})))
        ).map(p => ({...p, used: usedPaths.includes(p.path)}))
        .filter(p => !p.path.includes(Application.appRoot) && !(/(^|\/)\.[^\/\.]/g).test(p.path))
        
        return {path, data: paths}
    }

}
