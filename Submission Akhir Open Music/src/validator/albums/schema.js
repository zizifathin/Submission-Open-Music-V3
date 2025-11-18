const Joi = require('joi');

const AlbumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().integer().min(2000).max(2025).required(),
});

module.exports = { AlbumPayloadSchema };
