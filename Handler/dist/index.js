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
const accessKeyId = process.env.ACCESS_KEY_ID;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;
const endpoint = process.env.ENDPOINT;
const region = process.env.REGION;
const s3 = new client_s3_1.S3Client({
    forcePathStyle: true,
    endpoint: "https://mbkpfcvfeibfxjjarpzl.supabase.co/storage/v1/s3",
    region: "ap-south-1",
    credentials: {
        accessKeyId: "aac48646ea30c2b4b097d5fa2f653b1b",
        secretAccessKey: "137b36dd4a6c19f10122ebdd113466c7b7916f79452feb16cdd614ec758db8b0",
    },
});
app.get("/*", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const command = new client_s3_1.GetObjectCommand({
            Bucket: "storagevercel",
            Key: key,
        });
        const { Body } = yield s3.send(command);
        if (Body instanceof stream_1.Readable) {
            const type = filePath.endsWith("html")
                ? "text/html"
                : filePath.endsWith("css")
                    ? "text/css"
                    : filePath.endsWith("svg")
                        ? "image/svg+xml"
                        : "application/javascript";
            res.setHeader("Content-Type", type);
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
