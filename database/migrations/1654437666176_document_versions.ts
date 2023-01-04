import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'document_versions'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('mantainer_id').notNullable().references('maintainers.id')
      table.string('document_id').notNullable()
      table.integer('storage_id').notNullable().references('storages.id')
      table.string('path').notNullable()
      table.integer('editor_id').notNullable().references('users.id')
      table.integer('version').notNullable()
      table.string('hash').notNullable()
      table.bigInteger('size')
      table.boolean('s3_synced').notNullable()

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
