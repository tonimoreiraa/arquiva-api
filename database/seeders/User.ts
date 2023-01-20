import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Mantainer from 'App/Models/Mantainer'
import User from 'App/Models/User'

export default class extends BaseSeeder {
  public async run () {
    const mantainer = await Mantainer.firstOrFail()
    await User.create({
      name: 'Administrador',
      email: 'admin@digitaliza.com',
      type: 'super-admin',
      password: 'D1gitaliza@2022$',
      mantainerId: mantainer.id
    })
  }
}
