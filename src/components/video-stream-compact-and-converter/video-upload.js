// const multer = require('multer')
// const multerS3 = require('multer-s3')
// const path = require('path')
// const fs = require('fs')
// const s3Client = require('./awsS3')
import multer from 'multer'
import multerS3 from 'multer-s3'
import path from 'path'
import fs from 'fs'
import s3Client from './awsS3'

// Destination to store video
const videoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `public/videos/`)
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  },
})

const videoUpload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: 'evideovsl',
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname })
    },
    key: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname) // O caminho (key) do objeto no S3
    },
  }),
  fileFilter(req, file, cb) {
    if (!file.originalname.toLowerCase().match(/\.(mp4|mov|avi|mkv)$/)) {
      // upload only mp4, mov, avi, or mkv format
      return cb(
        new Error(
          'Por favor, envie apenas vídeos no formato mp4, mov, avi ou mkv!',
        ),
      )
    }
    cb(undefined, true)
  },
})

module.exports = { videoUpload }
