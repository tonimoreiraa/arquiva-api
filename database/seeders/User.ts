import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'

export default class extends BaseSeeder {
  public async run () {
    await User.create({
      name: 'Administrador',
      email: 'admin@digitaliza.com',
      password: 'D1gitaliza@2022$',
    })
  }
}
