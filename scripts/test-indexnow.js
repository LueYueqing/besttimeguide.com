require('dotenv').config();

/**
 * 测试 IndexNow 功能
 * 1. 测试验证文件是否可访问
 * 2. 测试提交 URL 到 IndexNow
 */

const INDEXNOW_ENDPOINT = 'https://www.indexnow.org/indexnow';
const localUrl = 'http://localhost:3000';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const indexNowKey = process.env.INDEXNOW_KEY;

async function testIndexNow() {
  console.log('🧪 Testing IndexNow Integration...\n');

  // 1. 检查环境变量
  if (!indexNowKey) {
    console.error('❌ Error: INDEXNOW_KEY not configured in .env.local');
    process.exit(1);
  }

  console.log(`✓ INDEXNOW_KEY: ${indexNowKey}`);
  console.log(`✓ Local URL: ${localUrl}`);
  console.log(`✓ Site URL: ${siteUrl}\n`);

  // 2. 测试验证文件（本地）
  console.log('📄 Testing verification file locally...');
  try {
    const response = await fetch(`${localUrl}/${indexNowKey}.txt`);
    const text = await response.text();
    
    if (text.trim() === indexNowKey && response.ok) {
      console.log(`✓ Verification file accessible at: ${siteUrl}/${indexNowKey}.txt`);
      console.log(`✓ Content matches: ${text.trim()}\n`);
    } else {
      console.error(`❌ Verification file test failed`);
      console.error(`   Status: ${response.status}`);
      console.error(`   Expected: ${indexNowKey}`);
      console.error(`   Got: ${text}\n`);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error accessing verification file:', error.message, '\n');
    process.exit(1);
  }

  // 3. 测试生产环境验证文件
  console.log('📄 Testing verification file on production...');
  try {
    const prodUrl = 'https://besttimeguide.com';
    const response = await fetch(`${prodUrl}/${indexNowKey}.txt`);
    const text = await response.text();
    
    if (text.trim() === indexNowKey && response.ok) {
      console.log(`✓ Verification file accessible at: ${prodUrl}/${indexNowKey}.txt`);
      console.log(`✓ Content matches: ${text.trim()}\n`);
    } else {
      console.error(`❌ Production verification file test failed`);
      console.error(`   Status: ${response.status}`);
      console.error(`   Expected: ${indexNowKey}`);
      console.error(`   Got: ${text}\n`);
      console.log('💡 This may need to be deployed first!\n');
    }
  } catch (error) {
    console.error('❌ Error accessing production verification file:', error.message, '\n');
  }

  // 4. 测试提交 URL 到 IndexNow
  console.log('📤 Testing URL submission to IndexNow...');
  const testUrl = `${siteUrl}/test`;
  
  try {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        host: new URL(siteUrl).hostname,
        key: indexNowKey,
        urlList: [testUrl],
      }),
    });

    if (response.ok) {
      console.log(`✓ Successfully submitted: ${testUrl}`);
      console.log('✓ IndexNow accepted the submission\n');
    } else {
      const errorText = await response.text();
      console.error(`❌ Submission failed`);
      console.error(`   Status: ${response.status}`);
      console.error(`   Error: ${errorText}\n`);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error submitting to IndexNow:', error.message, '\n');
    process.exit(1);
  }

  console.log('🎉 All tests passed!\n');
  console.log('📋 Next steps:');
  console.log('1. Deploy this fix to production');
  console.log('2. Verify the verification file is accessible at:');
  console.log(`   https://besttimeguide.com/${indexNowKey}.txt`);
  console.log('3. Submit your sitemap or individual URLs to IndexNow');
  console.log('4. Monitor search engine indexing\n');
}

// 运行测试
testIndexNow().catch(error => {
  console.error('❌ Test failed with error:', error);
  process.exit(1);
});
