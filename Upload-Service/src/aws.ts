// jwir7sh7q7m3a2iuovddgrmhg3ha 
// j3bvmm3tf4d3pec4b3khbfzxklcozw7ow6eqnm5xgmqvcilxbzyos 
// https://gateway.storjshare.io

import S3 from "aws-sdk/clients/s3";
import fs from "fs"
import 'dotenv/config'
require('dotenv').config()

const accessKeyId = process.env.accessKeyId
const secretAccessKey = process.env.secretAccessKey
const endpoint = process.env.endpoint

 const s3 = new S3({
  accessKeyId,
  secretAccessKey,
  endpoint
});

export const uploadFile = async (fileName: string, localFilePath: string) => {
    const fileContent = fs.readFileSync(localFilePath);
    const response = await s3.upload({
        Body: fileContent,
        Bucket: "vercel",
        Key: fileName,
    }).promise();
    console.log(response);
}