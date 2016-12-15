module.exports = {
  cep         : { type: String, index: true },
  phoneNumber : { type: String, index: true },
  logradouro  : { type: String, default: '' },
  complemento : { type: String, default: '' },
  bairro      : { type: String, default: '' },
  localidade  : { type: String, default: '' },
  uf          : { type: String, default: '' },
  fila        : { type: String, default: '' },
  score       : { type: String, default: '' },
  nome        : { type: String, default: '' },

  site        : { type: String, default: '' },
  cidade      : { type: String, default: '' },
  cepBase     : { type: Number, default: 0  },
  segmentacao : { type: String, default: '' },
  area        : { type: String, default: '' },
  cepStatus   : { type: Number, default: 0  },

  createdAt   : { type : Date, default : new Date() },
  updatedAt   : { type : Date, default : new Date(-1) },
};