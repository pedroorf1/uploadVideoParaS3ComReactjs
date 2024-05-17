import ffmpeg from 'fluent-ffmpeg'
import validarNomeVideo from './validar-nome-video'
import fs from 'fs'
// const cpulimit = require('cpulimit')
/*

Se estiver em  ambiente de desenvolvimento comentar linhas referentes ao cpulimit

Caso esteja no ambiente de produção descomentar as linhas
*/

process.on('message', async (payload) => {
  const { tempFilePath, name } = payload
  const nameVideoReplaced = validarNomeVideo(name).replace('.mp4', '')

  const endProcess = (endPayload) => {
    const { statusCode, text } = endPayload

    process.send({ statusCode, text })
    process.exit()
  }

  ffmpeg(tempFilePath)
    .fps(30)
    .addOptions(['-crf 36', '-preset faster'])
    .on('start', (command) => {
      fs.mkdirSync(`./temp/${nameVideoReplaced}`)
    })
    .save(
      `./temp/${validarNomeVideo(name).replace(
        '.mp4',
        '',
      )}/compressed-${validarNomeVideo(name)}`,
    )
    .on('end', () => {
      endProcess({ statusCode: 200, text: 'Success' })
    })
    .on('error', (err) => {
      endProcess({ statusCode: 500, text: err.message })
    })


  /*
      const commandFFmpeg = ffmpeg(tempFilePath)
      .fps(30)
      .addOptions(['-crf 32'])
      .on('start', (command) => {
        fs.mkdirSync(`./temp/${nameVideoReplaced}`)
      })
      .save(
        `./temp/${validarNomeVideo(name).replace(
          '.mp4',
          '',
        )}/compressed-${validarNomeVideo(name)}`,
      )
      .on('end', () => {
        endProcess({ statusCode: 200, text: 'Success' })
      })
      .on('error', (err) => {
        endProcess({ statusCode: 500, text: err.message })
      })

      cpulimit.spawn(commandFFmpeg, 60); */



})
