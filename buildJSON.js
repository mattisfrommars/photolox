const Exif = require('exif').ExifImage;
const co = require('co');
const path = require('path');
const fs = require('fs');
const homedir = require('homedir')();

function promisedRead(path) {
    return new Promise(function (resolve) {
        new Exif({image: path}, function (err, response) {
            if (err) return resolve({}); // don't care about errors at this stage
            resolve(response);
        });
    });
}

const decimalMinute = 1 / 60;
const decimalSecond = decimalMinute / 60;
function toDecimal([deg, min, sec], isPositive) {
    const decVal = deg + (decimalMinute * min) + (decimalSecond * sec);
    return isPositive ? decVal : -1 * decVal;
}

co(function*() {
    try {
        const basePath = path.join(homedir, '/Dropbox/Camera Uploads');
        const contents = fs.readdirSync(basePath).filter(name => /\.jpg$/.test(name));
        // const contents = ['2016-04-11 06.38.42.jpg', '2013-07-16 13.24.56.jpg'];
        const results = yield Promise.all(contents.map(filename => {
            const imagePath = path.join(basePath, filename);
            return promisedRead(imagePath).then(exifData => {
                return Object.assign(exifData, {file: {path: imagePath}});
            });
        }));

        const latLongs = results.filter(result => {
            return result.gps && result.gps.GPSLatitudeRef;
        }).map(result => {
            const path = result.file.path;
            const isNorth = result.gps.GPSLatitudeRef === 'N';
            const isEast = result.gps.GPSLongitudeRef === 'E';
            const latitude = toDecimal(result.gps.GPSLatitude, isNorth);
            const longitude = toDecimal(result.gps.GPSLongitude, isEast);
            return {latitude, longitude, path};
        });

        fs.writeFileSync('./locations.json', JSON.stringify(latLongs));
    } catch (e) {
        console.error(e);
    }
});