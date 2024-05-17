const ffmpeg = require('fluent-ffmpeg')
const validarNomeVideo = require('./validar-nome-video')

 //const cpulimit = require('cpulimit')
/* 

Se estiver em  ambiente de desenvolvimento comentar linhas referentes ao cpulimit

Caso esteja no ambiente de produção descomentar as linhas
*/

process.on('message', async (payload) => {
  const { tempFilePath, name } = payload

  const endProcess = (endPayload) => {
    const { statusCode, text } = endPayload

    process.send({ statusCode, text })
    process.exit()
  }

  ffmpeg(tempFilePath)
    .fps(30)
    .screenshots({
      count: 1,
      timestamps: ['00:00:00'],
      filename: `${validarNomeVideo(name).replace('.mp4', '')}.jpg`,
      folder: `./temp/${validarNomeVideo(name).replace('.mp4', '')}`,
    })
    .outputOptions([
      '-c:v',
      'copy',
      '-bsf:v',
      'h264_mp4toannexb',
      '-hls_time',
      '2',
      '-hls_playlist_type',
      'vod',
    ])
    .save(
      `./temp/${validarNomeVideo(name).replace(
        '.mp4',
        '',
      )}/compressed-${validarNomeVideo(name).replace('.mp4', '')}.m3u8`,
    )
    .on('end', () => {
      endProcess({ statusCode: 200, text: 'Success' })
    })
    .on('error', (err) => {
      console.log(err.message)
      endProcess({ statusCode: 500, text: err.message })
    })

    
/* 
    const commandFFmpeg =ffmpeg(tempFilePath)
    .fps(30)
    .screenshots({
      count: 1,
      timestamps: ['00:00:00'],
      filename: `${validarNomeVideo(name).replace('.mp4', '')}.jpg`,
      folder: `./temp/${validarNomeVideo(name).replace('.mp4', '')}`,
    })
    .outputOptions([
      '-c:v',
      'copy',
      '-bsf:v',
      'h264_mp4toannexb',
      '-hls_time',
      '2',
      '-hls_playlist_type',
      'vod',
    ])
    .save(
      `./temp/${validarNomeVideo(name).replace(
        '.mp4',
        '',
      )}/compressed-${validarNomeVideo(name).replace('.mp4', '')}.m3u8`,
    )
    .on('end', () => {
      endProcess({ statusCode: 200, text: 'Success' })
    })
    .on('error', (err) => {
      console.log(err.message)
      endProcess({ statusCode: 500, text: err.message })
    })

    cpulimit.spawn(commandFFmpeg, 60); */


})
