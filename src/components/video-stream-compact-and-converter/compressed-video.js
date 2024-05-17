import { fork } from 'child_process'
import fs from 'fs-extra'
//const cpulimit = require('cpulimit');


function compressedVideo(req, res, next) {
  const video = req.files.video
  const tempFilePath = video.tempFilePath

  if (video && tempFilePath) {
    const child = fork('./helpers/compress-video.js')

    child.send({ tempFilePath, name: video.name })

    //cpulimit.limit(child.pid, 50, (err) => console.log("error on limit", err))

    child.on('message', async (message) => {
      const { statusCode } = message

      fs.unlinkSync(tempFilePath)
      try {
        if (statusCode === 200) {
          console.log('Vídeo comprimido com sucesso')
          return next()
        }
      } catch (error) {
        console.error('Erro durante o processamento:', error)
        return res
          .status(400)
          .json({ success: false, message: 'Houve um erro na compressão' })
      }
    })
  }
}

module.exports = compressedVideo
