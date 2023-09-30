// Update with your config settings.

module.exports = {
  client: 'postgresql',
  connection: {
    database: 'rifas2023',
    user:     'postgres',
    password: '816573'
  },
  pool: {
    min: 2,
    max: 50
  },
  migrations: {
    tableName: 'knex_migrations'
  }
}
