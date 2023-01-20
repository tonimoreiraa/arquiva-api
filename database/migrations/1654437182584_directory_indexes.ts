import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'directory_indexes'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('mantainer_id').notNullable().references('mantainers.id')
      table.integer('directory_id').notNullable().references('directories.id')
      table.string('name').notNullable()
      table.string('type').notNullable()
      table.string('display_as')
      table.boolean('not_nullable').notNullable().defaultTo(false)
      table.bigInteger('min')
      table.bigInteger('max')
      table.bigInteger('min_length')
      table.bigInteger('max_length')
      table.string('regex')

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
