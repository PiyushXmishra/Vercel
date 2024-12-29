"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_s3_1 = require("@aws-sdk/client-s3");
const stream_1 = require("stream"); // To handle the stream
const app = (0, express_1.default)();
app.use(express_1.default.json());
const port = process.env.PORT || 3001;
const accessKeyId = "aac48646ea30c2b4b097d5fa2f653b1b";
const secretAccessKey = "137b36dd4a6c19f10122ebdd113466c7b7916f79452feb16cdd614ec758db8b0";
const endpoint = "https://mbkpfcvfeibfxjjarpzl.supabase.co/storage/v1/s3";
const region = 'ap-south-1';
const s3 = new client_s3_1.S3Client({
    forcePathStyle: true,
    endpoint: endpoint,
    region: region,
    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
    },
});
app.get("/*", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const host = req.hostname;
        const id = host.split(".")[0];
        let filePath = req.path;
        if (filePath === "/") {
            filePath = "/index.html";
        }
        console.log("filepath", filePath);
        console.log("id", id);
        console.log("key", `dist/${id}${filePath}`);
        const command = new client_s3_1.GetObjectCommand({
            Bucket: "storagevercel",
            Key: `dist/${id}${filePath}`,
        });
        const { Body } = yield s3.send(command);
        // Ensure the Body is a readable stream
        if (Body instanceof stream_1.Readable) {
            // Set the appropriate Content-Type for the file based on its extension
            const type = filePath.endsWith("html")
                ? "text/html"
                : filePath.endsWith("css")
                    ? "text/css"
                    : filePath.endsWith("svg")
                        ? "image/svg+xml"
                        : "application/javascript";
            res.setHeader("Content-Type", type);
            // Pipe the file directly to the response
            Body.pipe(res);
        }
        else {
            res.status(404).send('File not found');
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong');
    }
}));
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
