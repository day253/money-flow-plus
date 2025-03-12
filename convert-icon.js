const sharp = require('sharp');
const fs = require('fs');

// 确保 images 目录存在
if (!fs.existsSync('images')) {
    fs.mkdirSync('images');
}

// 读取 SVG 文件并转换为 PNG
sharp('images/icon.svg')
    .resize(128, 128) // 确保输出大小为 128x128
    .png()
    .toFile('images/icon.png')
    .then(info => { console.log('Icon generated successfully:', info); })
    .catch(err => { console.error('Error generating icon:', err); }); 