import express from "express";
import cors from "cors";
import generate from "./utils/generate";
import simpleGit from "simple-git";
import path from "path";
import fs from "fs";
import { getAllFiles } from "./file";
import { uploadFile } from "./aws";
import { createClient } from "redis";
import { createOrUpdateViteConfig } from "./ChangeBase";

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

    createOrUpdateViteConfig(id, path.join(__dirname, `output/${id}`));

    const files = getAllFiles(path.join(__dirname, `output/${id}`));

    await Promise.all(files.map(async file => {
        const filePath = file.replace(/\\/g, "/");
        await uploadFile(filePath.slice(__dirname.length + 1), file);
    }));

    publisher.lPush("build-queue", id);

    fs.rm(path.join(__dirname, `output/${id}`), { recursive: true, force: true }, (err) => {
        if (err) {
            console.error("Error deleting folder:", err);
        } else {
            console.log("Folder deleted successfully");
        }
    });

    res.json({
        "id": id
    });
});

app.listen(3000);
