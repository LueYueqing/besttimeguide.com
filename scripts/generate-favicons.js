const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

// 源文件路径 - 使用 logo.png 生成 favicon
const sourceFile = path.join(__dirname, '../public/logo.png')
const publicDir = path.join(__dirname, '../public')

// 需要生成的 favicon 尺寸
const faviconSizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-48x48.png', size: 48 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
]

async function generateFavicons() {
  try {
    // 检查源文件是否存在
    if (!fs.existsSync(sourceFile)) {
      console.error(`❌ 源文件不存在: ${sourceFile}`)
      console.log('请确保 public/logo.png 文件存在')
      process.exit(1)
    }

    console.log('🔄 开始生成 favicon 文件...')
    console.log(`📁 源文件: ${sourceFile}`)

    // 生成所有尺寸的 favicon
    for (const { name, size } of faviconSizes) {
      const outputPath = path.join(publicDir, name)
      
      await sharp(sourceFile)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath)
      
      console.log(`✅ 已生成: ${name} (${size}x${size})`)
    }

    // 生成 favicon.ico (使用 32x32 作为基础)
    const icoPath = path.join(publicDir, 'favicon.ico')
    await sharp(sourceFile)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(icoPath)
    
    console.log(`✅ 已生成: favicon.ico (32x32)`)

    console.log('\n✨ 所有 favicon 文件生成完成！')
    console.log('\n📋 生成的文件列表:')
    faviconSizes.forEach(({ name }) => {
      console.log(`   - ${name}`)
    })
    console.log('   - favicon.ico')
    
  } catch (error) {
    console.error('❌ 生成 favicon 时出错:', error)
    process.exit(1)
  }
}

// 运行脚本
generateFavicons()
