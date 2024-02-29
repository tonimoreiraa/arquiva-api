import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'directory_shares'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('user_id')
        .notNullable()
        .references('users.id')
      table.integer('directory_id')
        .notNullable()
        .references('directories.id')
      table.enum('type', ['read', 'write', 'owner'])
        .notNullable()
      table.boolean('accepted')
        .notNullable()
        .defaultTo(true)

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
