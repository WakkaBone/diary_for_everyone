const cloudinary = require('cloudinary').v2;
require('dotenv').config()

console.log(cloudinary.config().cloud_name)
// cloudinary.config({
//     cloud_name: 'dwwfvuomo',
//     api_key: '647332293216466',
//     api_secret: 'V3rTSFuQPM1b8PizDNtYMGpn3cw',
//     // secure: true
// })
module.exports = cloudinary