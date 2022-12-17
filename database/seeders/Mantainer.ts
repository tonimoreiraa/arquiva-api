import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Mantainer from 'App/Models/Mantainer'

export default class extends BaseSeeder {
  public async run () {
    // Write your database queries inside the run method
    await Mantainer.create({
      name: 'Default',
      authorizedDomains: ['localhost']
    })
  }
}
