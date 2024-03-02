// Make sure that you have run used `coreDatabase/getCoreDetails.mjs` to get the necessary data before running this script
// ! May need to run multiple times to get all sprites, as server blocks requests
import fs from 'fs';
import fetch from 'node-fetch';

// Function to download the image
async function downloadImage(url, path) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to download image, status ${response.status}`);
    }

    const fileStream = fs.createWriteStream(path);
    await new Promise((resolve, reject) => {
        response.body.pipe(fileStream);
        response.body.on('error', err => {
            reject(err);
        });
        fileStream.on('finish', () => {
            resolve();
        });
    });
}

const data = fs.readFileSync(`coreDatabase/coreDetails.json`, `utf8`);
const coreDetails = JSON.parse(data);


let count = 0;
coreDetails.forEach((coreType) => {
    coreType.coreDetails.forEach((core) => {
        const spritePath = `coreDatabase/sprites/${core["coreName"]}.png`;
        // downloadImage(core["sprite"], spritePath);
        setTimeout(() => {
            const url = `https://mixmasteroficial.com.br/themes/default/img/Hench/${core["coreNumber"]}.png`;
            if(fs.existsSync(`sprites/${core["coreNumber"]}.png`)) {
                console.log(`Skipping ${core["coreNumber"]}`);
            }
            else {
                console.log(`Downloading ${core["coreNumber"]}`);
                downloadImage(url, `sprites/${core["coreNumber"]}.png`);
            }
        }, count * 100);
        count++;
    });
});



