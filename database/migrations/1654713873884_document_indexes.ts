import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'document_indexes'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('document_id').notNullable().references('documents.id')
      table.integer('index_id').notNullable().references('directory_indexes.id')
      table.float('number', 10, 2)
      table.string('string')
      table.boolean('boolean')
      table.integer('list').references('directory_index_list_values.id')
      table.datetime('datetime')

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
