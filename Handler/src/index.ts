import express from 'express';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'stream'; // To handle the stream
import cors from 'cors';
const app = express();
app.use(express.json());
app.use(cors())

const port = process.env.PORT || 3001;

const accessKeyId = process.env.ACCESS_KEY_ID;
const secretAccessKey = process.env.SECRET_ACCESS_KEY; 
const endpoint = process.env.ENDPOINT;
const region = process.env.REGION;

const s3 = new S3Client({
  forcePathStyle: true,
  endpoint: "https://mbkpfcvfeibfxjjarpzl.supabase.co/storage/v1/s3",
  region: "ap-south-1",
  credentials: {
    accessKeyId: "aac48646ea30c2b4b097d5fa2f653b1b",
    secretAccessKey: "137b36dd4a6c19f10122ebdd113466c7b7916f79452feb16cdd614ec758db8b0",
  },
});

app.get("/*", async (req, res) => {
  try {
    const host = req.path;
    console.log("Original Path: ", host);

    const pathSegments = host.split("/");
    const id = pathSegments[1];

    let filePath = pathSegments.slice(2).join("/");

    if (!filePath) {
      filePath = "/";
    }

    if (filePath !== "/" && !filePath.startsWith("/")) {
      filePath = `/${filePath}`;
    }

    if (filePath === "/") {
      filePath = "/index.html";
    }

    console.log("Extracted ID: ", id);
    console.log("Extracted File Path: ", filePath);

    const key = `dist/${id}${filePath}`;

    console.log("S3 Key: ", key);

    const command = new GetObjectCommand({
      Bucket: "storagevercel", 
      Key: key,
    });

    
    const { Body } = await s3.send(command);

    if (Body instanceof Readable) {
      const type = filePath.endsWith("html")
  ? "text/html"
  : filePath.endsWith("css")
  ? "text/css"
  : filePath.endsWith("svg")
  ? "image/svg+xml"
  : "application/javascript";

      res.setHeader("Content-Type", type);
      Body.pipe(res);
    } else {
      res.status(404).send('File not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Something went wrong');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

