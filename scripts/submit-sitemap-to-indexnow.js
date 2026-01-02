require('dotenv').config({ path: '.env.local' });

/**
 * 提交sitemap到IndexNow
 * 这个脚本会读取sitemap.xml并提交所有URL到IndexNow
 * 支持的搜索引擎：Bing、Google、Yandex等
 */

const INDEXNOW_ENDPOINT = 'https://www.bing.com/indexnow';

async function submitBatchToIndexNow(urls) {
  try {
    const key = process.env.INDEXNOW_KEY;
    
    if (!key) {
      console.error('[IndexNow] INDEXNOW_KEY not configured');
      return { success: false, error: 'INDEXNOW_KEY not configured' };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://besttimeguide.com';
    
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        host: new URL(siteUrl).hostname,
        key: key,
        urlList: urls,
      }),
    });

    if (response.ok) {
      console.log(`[IndexNow] Successfully submitted ${urls.length} URLs`);
      return { success: true };
    } else {
      const errorText = await response.text();
      console.error(`[IndexNow] Failed to submit batch:`, errorText);
      return { success: false, error: `HTTP ${response.status}: ${errorText}` };
    }
  } catch (error) {
    console.error('[IndexNow] Error submitting batch:', error);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🚀 Starting sitemap submission to IndexNow...\n');

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://besttimeguide.com';
  const indexNowKey = process.env.INDEXNOW_KEY;

  if (!indexNowKey) {
    console.error('❌ Error: INDEXNOW_KEY not configured in .env.local');
    console.log('   Please add it to your .env.local file:');
    console.log('   INDEXNOW_KEY=your-32-char-hex-key-here\n');
    console.log('   Generate a key with: node -e "console.log(Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, \'0\')).join(\'\'))"');
    process.exit(1);
  }

  try {
    // 获取sitemap内容
    const sitemapUrl = `${siteUrl}/sitemap.xml`;
    console.log(`📄 Fetching sitemap from: ${sitemapUrl}`);

    const response = await fetch(sitemapUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch sitemap: HTTP ${response.status}`);
    }

    const sitemapContent = await response.text();
    
    // 解析XML提取URLs
    const urlRegex = /<loc>(.*?)<\/loc>/g;
    const urls = [];
    let match;
    
    while ((match = urlRegex.exec(sitemapContent)) !== null) {
      urls.push(match[1]);
    }

    console.log(`✅ Found ${urls.length} URLs in sitemap\n`);

    if (urls.length === 0) {
      console.log('⚠️  No URLs found in sitemap. Exiting...');
      return;
    }

    // 提交URLs到IndexNow
    console.log('📤 Submitting URLs to IndexNow...');
    const result = await submitBatchToIndexNow(urls);

    if (result.success) {
      console.log('\n✅ Success! URLs submitted to IndexNow.');
      console.log(`📊 Summary: ${urls.length} URLs submitted`);
      console.log('🔍 Search engines notified: Bing, Google, Yandex, and others\n');
      console.log('💡 Note: It may take several minutes to hours for search engines to index your content.');
    } else {
      console.error('\n❌ Failed to submit URLs to IndexNow');
      console.error(`Error: ${result.error}\n`);
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Error submitting sitemap to IndexNow:');
    console.error(error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Hint: Make sure your development server is running:');
      console.log('   npm run dev');
    }
    
    process.exit(1);
  }
}

// 运行脚本
main();
