import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'documents'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').notNullable().primary().unique()
      table.integer('organization_id').notNullable().references('organizations.id')
      table.integer('directory_id').notNullable().references('directories.id')
      table.integer('storage_id').notNullable().references('storages.id')
      table.integer('editor_id').notNullable().references('users.id')
      table.integer('version').notNullable()
      table.string('path').notNullable()
      table.string('secret_key').notNullable()

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
