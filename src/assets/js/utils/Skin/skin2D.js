/**
 * @author Luuxis
 * Luuxis License v1.0 (voir fichier LICENSE pour les détails en FR/EN)
 */
const nodeFetch = require('node-fetch')

export class skin2D {
    async creatHeadTexture(data) {
        let image = await getData(data)
        return await new Promise((resolve, reject) => {
            image.addEventListener('load', e => {
                let cvs = document.createElement('canvas');
                cvs.width = 8;
                cvs.height = 8;
                let ctx = cvs.getContext('2d');
                ctx.drawImage(image, 8, 8, 8, 8, 0, 0, 8, 8);
                ctx.drawImage(image, 40, 8, 8, 8, 0, 0, 8, 8);
                return resolve(cvs.toDataURL());
            });
        })
    }
}

async function getData(data) {
    if (data.startsWith('http')) {
        let response = await nodeFetch(data);
        let buffer = await response.buffer();
        data = `data:image/png;base64,${await buffer.toString('base64')}`;
    }
    let img = new Image();
    img.src = data;
    return img;
}