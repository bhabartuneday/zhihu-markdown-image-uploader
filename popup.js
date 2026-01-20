/**
 * 知乎 Markdown 图片自动上传 - 弹窗脚本
 */

document.addEventListener('DOMContentLoaded', async () => {
  // 检查 Cookie 状态
  await checkCookieStatus();
  
  // 测试按钮点击事件
  document.getElementById('test-btn').addEventListener('click', testConnection);
});

/**
 * 检查 Cookie 状态
 */
async function checkCookieStatus() {
  const cookieStatusEl = document.getElementById('cookie-status');
  
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getCookie' });
    
    if (response.success && response.cookie) {
      cookieStatusEl.textContent = '✓ 已登录';
      cookieStatusEl.className = 'status-value success';
    } else {
      cookieStatusEl.textContent = '✗ 未登录';
      cookieStatusEl.className = 'status-value error';
    }
  } catch (error) {
    cookieStatusEl.textContent = '✗ 检查失败';
    cookieStatusEl.className = 'status-value error';
    console.error('检查 Cookie 失败:', error);
  }
}

/**
 * 测试连接
 */
async function testConnection() {
  const testBtn = document.getElementById('test-btn');
  const originalText = testBtn.textContent;
  
  testBtn.textContent = '测试中...';
  testBtn.disabled = true;
  
  try {
    // 获取 Cookie
    const cookieResponse = await chrome.runtime.sendMessage({ action: 'getCookie' });
    
    if (!cookieResponse.success || !cookieResponse.cookie) {
      alert('❌ 测试失败：未登录知乎\n\n请先登录知乎网站后再试');
      return;
    }
    
    // 测试上传一个示例图片（使用知乎的公开图片）
    const testImageUrl = 'https://pic1.zhimg.com/80/v2-d9e808ffbffec32169db2327f70069d9_1440w.jpg';
    
    const uploadResponse = await chrome.runtime.sendMessage({
      action: 'uploadImage',
      imageUrl: testImageUrl,
      cookie: cookieResponse.cookie
    });
    
    if (uploadResponse.success) {
      alert('✅ 测试成功！\n\n插件工作正常，可以正常上传图片到知乎');
    } else {
      alert(`❌ 测试失败\n\n错误信息: ${uploadResponse.error}\n\n请检查网络连接或稍后重试`);
    }
  } catch (error) {
    alert(`❌ 测试异常\n\n${error.message}`);
    console.error('测试连接失败:', error);
  } finally {
    testBtn.textContent = originalText;
    testBtn.disabled = false;
  }
}
