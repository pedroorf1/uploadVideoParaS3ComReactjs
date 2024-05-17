const { fork } = require('child_process')
const fs = require('fs-extra')
const s3Client = require('./awsS3')
const { PutObjectCommand } = require('@aws-sdk/client-s3')
const validarNomeVideo = require('./validar-nome-video')
// const cpulimit = require('cpulimit')

const handleUploadAws = async (params) => {
  try {
    await s3Client.send(new PutObjectCommand(params))
  } catch (e) {
    console.error(e)
  }
}

function convertedVideo(req, res, next) {
  const video = req.files.video
  const tempFilePath = `./temp/${validarNomeVideo(video.name).replace('.mp4', '')}/compressed-${validarNomeVideo(video.name)}`
  const { id_user } = req.params

  if (video && tempFilePath) {
    const child = fork('./helpers/convert-video.js')

    child.send({ tempFilePath, name: video.name })
    //cpulimit.limit(child.pid, 50, (err) => console.log("error on limit", err))
    child.on('message', async (message) => {
      const { statusCode } = message

      try {
        const folderPath = `./temp/${validarNomeVideo(video.name).replace('.mp4', '')}`
        const files = await fs.readdir(folderPath)

        const uploadPromises = files.map(async (file) => {
          const params = {
            Bucket: 'evideovsl',
            Key: `${id_user}/${validarNomeVideo(video.name).replace('.mp4', '')}/${file}`,
            Body: fs.createReadStream(`${folderPath}/${file}`),
            ACL: 'public-read',
          }
          await handleUploadAws(params)
        })

        if (statusCode === 200) {
          await Promise.all(uploadPromises)

          await fs.remove(folderPath)
          return next()
        }
      } catch (error) {
        console.error('Erro durante o processamento:', error)
        return res
          .status(400)
          .json({ success: false, message: 'Houve um erro no upload' })
      }
    })
  }
}

module.exports = convertedVideo
