import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import stream from 'stream';
import { promisify } from 'util';
import 'dotenv/config';

const pipeline = promisify(stream.pipeline);

const accessKeyId = process.env.accessKeyId!;
const secretAccessKey = process.env.secretAccessKey!;
const endpoint = process.env.endpoint!;
const region = 'ap-south-1';

const s3 = new S3Client({
  forcePathStyle: true, 
  region,
  endpoint,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export async function downloadS3Folder(prefix: string) {
  try {
    const command = new ListObjectsV2Command({
      Bucket: 'storagevercel', 
      Prefix: prefix,
    });

    const allFiles = await s3.send(command);

    const allPromises = allFiles.Contents?.map(async ({ Key }) => {
      return new Promise(async (resolve, reject) => {
        if (!Key) {
          resolve('');
          return;
        }

        const finalOutputPath = path.join(__dirname, Key);
        const dirName = path.dirname(finalOutputPath);

        if (!fs.existsSync(dirName)) {
          fs.mkdirSync(dirName, { recursive: true });
        }

        const getObjectCommand = new GetObjectCommand({
          Bucket: 'storagevercel',
          Key,
        });

        const { Body } = await s3.send(getObjectCommand);
        if (Body instanceof stream.Readable) {
          const writableStream = fs.createWriteStream(finalOutputPath);
          await pipeline(Body, writableStream);
          resolve('');
        } else {
          reject(new Error('Body is not a readable stream.'));
        }
      });
    }) || [];

    console.log('Downloading files...');
    await Promise.all(allPromises?.filter((x) => x !== undefined));
    console.log('Download complete.');
  } catch (error) {
    console.error('Error downloading folder:', error);
    throw error;
  }
}

const getAllFiles = (folderPath: string): string[] => {
  let response: string[] = [];

  const allFilesAndFolders = fs.readdirSync(folderPath);
  allFilesAndFolders.forEach((file) => {
    const fullFilePath = path.join(folderPath, file);
    if (fs.statSync(fullFilePath).isDirectory()) {
      response = response.concat(getAllFiles(fullFilePath));
    } else {
      response.push(fullFilePath);
    }
  });

  return response;
};

const uploadFile = async (fileName: string, localFilePath: string) => {
  try {
    const fileContent = fs.readFileSync(localFilePath);
    const command = new PutObjectCommand({
      Bucket: 'storagevercel',
      Key: fileName,
      Body: fileContent,
    });

    const response = await s3.send(command);
    console.log(`Uploaded: ${fileName}`, response);
  } catch (error) {
    console.error(`Error uploading file (${fileName}):`, error);
    throw error;
  }
};

export function copyFinalDist(id: string) {
  let folderPath = "";

  if (fs.existsSync(path.join(__dirname, `output/${id}/dist`))) {
    folderPath = path.join(__dirname, `output/${id}/dist`);
  } else if (fs.existsSync(path.join(__dirname, `output/${id}/build`))) {
    folderPath = path.join(__dirname, `output/${id}/build`);
  } else {
    console.error(`Neither 'dist' nor 'build' folder exists for ID: ${id}`);
    return;
  }

  const allFiles = getAllFiles(folderPath);

  allFiles.forEach((file) => {
    const filePath = file.replace(/\\/g, '/');
    const s3Key = `dist/${id}/` + filePath.slice(folderPath.length + 1);
    uploadFile(s3Key, file);
  });
}


export async function deleteFolder(bucketName: string, folderPath: string) {
  try {
    const listCommand = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: folderPath,
    });
    const listResponse = await s3.send(listCommand);

    if (listResponse.Contents && listResponse.Contents.length > 0) {
      const deleteCommand = new DeleteObjectsCommand({
        Bucket: bucketName,
        Delete: {
          Objects: listResponse.Contents.map((object) => ({
            Key: object.Key!,
          })),
        },
      });
      
      await s3.send(deleteCommand);
      console.log(`Folder '${folderPath}' and its contents have been deleted.`);
    } else {
      console.log(`Folder '${folderPath}' does not exist or is already empty.`);
    }
  } catch (error) {
    console.error('Error deleting folder:', error);
  }
}
