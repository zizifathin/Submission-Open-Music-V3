//1762951396348_table-add-cover-url-column-to-albums-table.js
//eslint-disable camelcase
exports.up = (pgm) => {
  pgm.addColumn('albums', {
    cover_url: { type: 'TEXT', isNull: true },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('albums', 'cover_url');
};
