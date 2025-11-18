// migrations/1760967132451_create-table-albums.js
// eslint-disable camelcase
exports.up = (pgm) => {
  pgm.createTable('albums', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    name: {
      type: 'TEXT',
      notNull: true,
    },
    year: {
      type: 'INTEGER',
      notNull: true,
    },
  })
};


exports.down = (pgm) => {
  pgm.dropTable('albums');
};
