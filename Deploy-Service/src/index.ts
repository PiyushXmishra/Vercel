import { createClient ,commandOptions} from "redis";
import { copyFinalDist, downloadS3Folder , deleteFolder } from "./aws";
import { buildProject } from "./command";
import 'dotenv/config'
require('dotenv').config()
import * as fs from 'fs';
import * as path from 'path';

const subscriber = createClient({
    url: `${process.env.REDIS_URL}`
});
subscriber.connect();

async function main(){
    while(1){
        const response = await subscriber.brPop(commandOptions({isolated:true}),
        'build-queue', 0
        );
        //@ts-ignore
        const id = response.element;

        await downloadS3Folder(`output/${id}`);
        console.log("dowloaded");

        await buildProject(id);
        console.log("build done");

        copyFinalDist(id);
        fs.rm(path.join(__dirname, `output/${id}`), { recursive: true, force: true }, (err) => {
            if (err) {
                console.error("Error deleting folder:", err);
            } else {
                console.log("Folder deleted successfully");
            }
        });
    
    

    }
}
main();
