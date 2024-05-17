import AWSS3UploadAsh from 'aws-s3-upload-ash';

const config = {
  bucketName: process.env.REACT_APP_AWS_bucketname,
  dirName: 'uploads',
  region: process.env.REACT_APP_AWS_region,
  accessKeyId: process.env.REACT_APP_AWS_accessKeyId,
  secretAccessKey: process.env.REACT_APP_AWS_secretAccessKey,
  s3Url: process.env.REACT_APP_AWS_s3url
}

export const uploadFileToS3 = async (file) => {
  const S3CustomClient = new AWSS3UploadAsh(config);
  try {
    // @ts-ignore
    const response = await S3CustomClient.uploadFile(file, file.type, undefined, file.name, "public-read");
    console.log(response, new Date().toString())
  } catch (error) {
    console.error(error)
  }

  console.log("Arquivo enviado com sucesso para o Amazon S3!");
};