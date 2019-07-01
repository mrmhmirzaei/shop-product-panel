const Liara = require('@liara/sdk'),
    fs = require('fs'),
    path = require('path');

require('dotenv').config()

const liaraClient = new Liara.Storage.Client({
    accessKey: process.env.ACCESSKEY,
    secretKey: process.env.SECRATKEY,
    endPoint: '5cd29b67848c9d00174059a3.storage.liara.ir'
});


function upload(file = '', name = '') {
    let ext = path.extname(file);
    let filePath = 'https://5cd29b67848c9d00174059a3.storage.liara.ir/product/' + name + ext;
    return new Promise(async(resolve, reject) => {
        if (await fs.existsSync(file)) {
            const fileContents = await fs.createReadStream(file);
            liaraClient.putObject('product', name + ext, fileContents)
                .then(async() => {
                    resolve(filePath);
                })
                .catch(error => {
                    console.log(error);

                    reject(false)
                });
        } else {
            reject(false);
        }
    })
}

module.exports = upload;