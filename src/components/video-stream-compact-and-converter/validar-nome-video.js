function validarNomeVideo(texto) {
  const textoLimpo = texto.replace(/[^\w\d.\-]/g, '').replace(/\s/g, '-')
  return textoLimpo
}

module.exports = validarNomeVideo
