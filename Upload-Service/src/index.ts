import express from "express";
import cors from "cors";
import generate from "./utils/generate";
import simpleGit from "simple-git";
import path from "path";
import { getAllFiles } from "./file";
import { uploadFile } from "./aws";
import { createClient } from "redis";

const publisher = createClient({
    url: `${process.env.REDIS_URL}`
});
publisher.connect();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/deploy", async (req, res) => {
    const repoUrl = req.body.repoUrl;
    const id = generate();
    await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`));

    const files = getAllFiles(path.join(__dirname, `output/${id}`));

    await Promise.all(files.map(async file => {
        const filePath = file.replace(/\\/g, "/");
        await uploadFile(filePath.slice(__dirname.length + 1), file);
    }));

    publisher.lPush("build-queue", id);

    res.json({
        "id": id
    });
});

app.listen(3000);
