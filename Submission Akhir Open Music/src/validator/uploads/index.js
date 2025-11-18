const InvariantError = require('../../exceptions/InvariantError');
const { CoverHeadersSchema } = require('./schema');

const UploadsValidator = {
  validateImageHeaders: (headers) => {
    const contentType = headers['content-type']?.toLowerCase();

    const validationResult = CoverHeadersSchema.validate({
      'content-type': contentType,
    });

    if (validationResult.error) {
      throw new InvariantError('Tipe file tidak didukung');
    }
  },
};

module.exports = UploadsValidator;
