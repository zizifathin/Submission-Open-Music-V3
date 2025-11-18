class Listener {
  constructor(playlistService, mailSender) {
    this._playlistService = playlistService;
    this._mailSender = mailSender;

    this.listen = this.listen.bind(this);
  }

  async listen(message) {
    try {
      const { playlistId, targetEmail } = JSON.parse(message.content.toString());

      const payload = await this._playlistService.getPlaylistSongs(playlistId);

      await this._mailSender.sendEmail(targetEmail, JSON.stringify(payload));
      console.log('Export playlist terkirim ke email:', targetEmail);
    } catch (e) {
      console.error('Gagal memproses pesan export:', e);
    }
  }
}

module.exports = Listener;
