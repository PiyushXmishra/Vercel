import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import 'dotenv/config';

const accessKeyId = process.env.accessKeyId;
const secretAccessKey = process.env.secretAccessKey;
const endpoint = process.env.endpoint; 
const region = 'ap-south-1'; 

const s3 = new S3Client({
  forcePathStyle: true, 
  endpoint: endpoint,
  region: region, 
  credentials: {
    accessKeyId: accessKeyId!,
    secretAccessKey: secretAccessKey!,
  },
});

export const uploadFile = async (fileName: string, localFilePath: string) => {
  try {
    const fileContent = fs.readFileSync(localFilePath);

    const command = new PutObjectCommand({
      Bucket: 'storagevercel',
      Key: fileName,
      Body: fileContent,
      ACL: 'public-read', 
    });

    const response = await s3.send(command);
    console.log('File uploaded successfully:', response);
    return response;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};
