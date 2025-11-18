require('dotenv').config();
const amqp = require('amqplib');
const Listener = require('./listener');
const MailSender = require('./MailSender');
const PlaylistsService = require('./PlaylistsService');

const init = async () => {
  const playlistService = new PlaylistsService();
  const mailSender = new MailSender();
  const listener = new Listener(playlistService, mailSender);

  const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
  const channel = await connection.createChannel();
  await channel.assertQueue('export:playlists', { durable: true });

  await channel.consume('export:playlists', listener.listen, { noAck: true });

  console.log('Consumer is running...');
};

init();
