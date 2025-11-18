require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const path = require('path');

const ClientError = require('./exceptions/ClientError');

const albums = require('./api/albums');
const songs = require('./api/songs');
const users = require('./api/users');
const playlists = require('./api/playlist');
const authentications = require('./api/authentications');
const playlistSongs = require('./api/playlistSongs');
const collaborations = require('./api/collaborations');
const activities = require('./api/activities');
const _exports = require('./api/exports');
const uploads = require('./api/uploads');
const userAlbumLikes = require('./api/userAlbumLikes');

const AlbumsValidator = require('./validator/albums');
const SongsValidator = require('./validator/songs');
const UsersValidator = require('./validator/users');
const AuthenticationsValidator = require('./validator/authentications');
const PlaylistsValidator = require('./validator/playlist');
const PlaylistSongsValidator = require('./validator/playlistSongs');
const CollaborationsValidator = require('./validator/collaborations');
const ExportsValidator = require('./validator/exports');
const UploadsValidator = require('./validator/uploads');

const AlbumsService = require('./services/postgres/AlbumsService');
const SongsService = require('./services/postgres/SongsService');
const UsersService = require('./services/postgres/UsersService');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const PlaylistSongsService = require('./services/postgres/PlaylistSongsServices');
const CollaborationsService = require('./services/postgres/CollaborationsServices');
const ActivitiesService = require('./services/postgres/ActivitiesService');
const ProducerService = require('./services/rabbitmq/ProducerService');
const StorageService = require('./services/storage/StorageService');
const UserAlbumLikesService = require('./services/postgres/UserAlbumLikesService');

const TokenManager = require('./tokenize/TokenManager');
const CacheService = require('./services/redis/CacheService');

const init = async () => {
  const cacheService = new CacheService();

  const userService = new UsersService();
  const collaborationsService = new CollaborationsService(userService);
  const playlistService = new PlaylistsService(collaborationsService);
  const playlistSongsService = new PlaylistSongsService();
  const albumService = new AlbumsService(cacheService);
  const songService = new SongsService();
  const authenticationService = new AuthenticationsService();
  const activitiesService = new ActivitiesService();
  const userAlbumLikesService = new UserAlbumLikesService(cacheService);
  const storageService = new StorageService(
  path.resolve(__dirname, '../src/api/uploads/file/images')
);


  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    { plugin: Jwt },
    { plugin: Inert }
  ]);

  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: { aud: false, iss: false, sub: false, maxAgeSec: process.env.ACCESS_TOKEN_AGE },
    validate: (artifacts) => ({
      isValid: true,
      credentials: { id: artifacts.decoded.payload.id },
    }),
  });

  await server.register([
    { plugin: albums, options: { service: albumService, validator: AlbumsValidator } },
    { plugin: songs, options: { service: songService, validator: SongsValidator } },
    { plugin: users, options: { service: userService, validator: UsersValidator } },
    { plugin: authentications, options: { authenticationsService: authenticationService, usersService: userService, tokenManager: TokenManager, validator: AuthenticationsValidator } },
    { plugin: playlists, options: { service: playlistService, activitiesService, validator: PlaylistsValidator } },
    { plugin: playlistSongs, options: { playlistSongsService, playlistsService: playlistService, songsService: songService, activitiesService, validator: PlaylistSongsValidator } },
    { plugin: collaborations, options: { collaborationsService, playlistsService: playlistService, usersService: userService, validator: CollaborationsValidator } },
    { plugin: activities, options: { playlistsService: playlistService, activitiesService } },
    { plugin: _exports, options: { service: ProducerService, playlistsService: playlistService, validator: ExportsValidator } },
    { plugin: uploads, options: { service: storageService, albumsService: albumService, validator: UploadsValidator } },
    { plugin: userAlbumLikes, options: { userAlbumLikesService, albumService } },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({ status: 'fail', message: response.message });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      if (!response.isServer) return h.continue;

      const newResponse = h.response({ status: 'error', message: 'Maaf, terjadi kegagalan pada server kami.' });
      newResponse.code(500);
      console.error(response);
      return newResponse;
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
