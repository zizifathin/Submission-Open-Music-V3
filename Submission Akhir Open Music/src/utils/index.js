const mapAlbumDBToModel = ({ id, name, year, coverUrl }) => ({
  id,
  name,
  year,
  coverUrl: coverUrl ?? null,
});

const mapSongDBToModel = ({ id, title, performer }) => ({
  id,
  title,
  performer,
});

module.exports = {
  mapAlbumDBToModel,
  mapSongDBToModel,
};
