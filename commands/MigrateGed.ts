import { BaseCommand } from '@adonisjs/core/build/standalone'

export default class MigrateGed extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'migrate:ged'

  /**
   * Command description is displayed in the "help" output
   */
  public static description = ''

  public static settings = {
    /**
     * Set the following value to true, if you want to load the application
     * before running the command. Don't forget to call `node ace generate:manifest` 
     * afterwards.
     */
    loadApp: false,

    /**
     * Set the following value to true, if you want this command to keep running until
     * you manually decide to exit the process. Don't forget to call 
     * `node ace generate:manifest` afterwards.
     */
    stayAlive: false,
  }

  public async run() {

    const {default: Database} = await import('@ioc:Adonis/Lucid/Database')
    const {default: Organization} = await import('App/Models/Organization')
    const {default: Storage} = await import('App/Models/Storage')
    const storages = await Storage.query().where('active', true)
    const storageId = await this.prompt.choice('Selecione o storage destino', storages.map(storage => ({
      name: String(storage.id),
      message: storage.name
    })))

    console.log(storageId)


    Database.manager.add('old_ged', {
      client: 'pg',
      connection: {
        host: '172.16.50.99',
        port: 2022,
        user: 'digitaliza',
        password: 'D!git4liza@2',
        database: 'digitaliza'
      },
      migrations: {
        naturalSort: true,
      },
      healthCheck: false,
      debug: true
    })

    const oldGedDb = Database.connection('old_ged', {mode: 'read'})
    const oldDirectories = []
    const companies = await oldGedDb.query().select('*').from('companies')
    
    for (const company of companies) {
      const organization = await Organization.updateOrCreate({name: company.completename}, {
        name: company.completename
      })
      const trees = await oldGedDb.query().select('*').from('tree').where('tree_id', company.tree_id).orWhere('id', company.tree_id)
      console.log(trees)
    }
  }
}
