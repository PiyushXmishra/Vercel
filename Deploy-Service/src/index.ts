import { createClient ,commandOptions} from "redis";
import { copyFinalDist, downloadS3Folder } from "./aws";
import { buildProject } from "./command";
import 'dotenv/config'
require('dotenv').config()

const subscriber = createClient();
subscriber.connect();

async function main(){
    while(1){
        console.log(process.env.accessKeyId);
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


    }
}
main();
