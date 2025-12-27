require('dotenv').config();
const { submitToIndexNow } = require('../lib/indexnow');

/**
 * 提交单篇文章URL到IndexNow
 * 用法: node scripts/submit-article-to-indexnow.js <article-slug>
 */

async function main() {
  const slug = process.argv[2];

  if (!slug) {
    console.error('❌ Error: Article slug is required');
    console.log('\n📖 Usage:');
    console.log('   node scripts/submit-article-to-indexnow.js your-article-slug\n');
    console.log('💡 Example:');
    console.log('   node scripts/submit-article-to-indexnow.js how-to-create-qr-code');
    process.exit(1);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const indexNowKey = process.env.INDEXNOW_KEY;

  if (!indexNowKey) {
    console.error('❌ Error: INDEXNOW_KEY not configured in .env.local');
    console.log('   Please add it to your .env.local file:');
    console.log('   INDEXNOW_KEY=your-32-char-hex-key-here\n');
    console.log('   Generate a key with: node -e "console.log(Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, \'0\')).join(\'\'))"');
    process.exit(1);
  }

  const articleUrl = `${siteUrl}/${slug}`;
  console.log('🚀 Submitting article to IndexNow...\n');
  console.log(`📄 Article URL: ${articleUrl}\n`);

  try {
    const result = await submitToIndexNow(articleUrl);

    if (result.success) {
      console.log('✅ Success! Article submitted to IndexNow.');
      console.log(`🔗 URL: ${articleUrl}`);
      console.log('🔍 Search engines notified: Bing, Google, Yandex, and others\n');
      console.log('💡 Note: It may take several minutes to hours for search engines to index your content.');
    } else {
      console.error('❌ Failed to submit article to IndexNow');
      console.error(`Error: ${result.error}\n`);
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error submitting article to IndexNow:');
    console.error(error.message);
    process.exit(1);
  }
}

// 运行脚本
main();
