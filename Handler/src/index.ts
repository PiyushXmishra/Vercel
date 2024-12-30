import express from 'express';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'stream'; // To handle the stream

const app = express();
app.use(express.json());

const port = process.env.PORT || 3001;

const accessKeyId = process.env.ACCESS_KEY_ID;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;
const endpoint = process.env.ENDPOINT;
const region = process.env.REGION;

const s3 = new S3Client({
  forcePathStyle: true,
  endpoint: endpoint,
  region: region,
  credentials: {
    accessKeyId: accessKeyId!,
    secretAccessKey: secretAccessKey!,
  },
});

app.get('/:id/*', async (req, res) => {
  try {
    const id = req.params.id; 
    let filePath = req.path.replace(`/${id}`, ''); 
    if (filePath === '/') {
      filePath = '/index.html';
    }

    console.log("filepath", filePath);
    console.log("id", id);
    console.log("key", `dist/${id}${filePath}`);

    const command = new GetObjectCommand({
      Bucket: "storagevercel", 
      Key: `dist/${id}${filePath}`,
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
