/**
 * 知乎 Markdown 图片自动上传 - 后台脚本
 */

// 监听来自 content script 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'uploadImage') {
    uploadImageToZhihu(request.imageUrl, request.cookie, request.pageUrl)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // 保持消息通道开启
  }
  
  if (request.action === 'getCookie') {
    getZhihuCookie()
      .then(cookie => sendResponse({ success: true, cookie }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

/**
 * 获取知乎 Cookie
 */
async function getZhihuCookie() {
  const cookies = await chrome.cookies.getAll({ domain: '.zhihu.com' });
  return cookies.map(c => `${c.name}=${c.value}`).join('; ');
}

/**
 * 从 Cookie 中提取 XSRF Token
 */
function extractXsrfToken(cookie) {
  const match = cookie.match(/_xsrf=([^;]+)/);
  return match ? match[1] : '';
}

/**
 * 上传图片到知乎
 * @param {string} imageUrl - 图片 URL
 * @param {string} cookie - 知乎 Cookie
 * @param {string} pageUrl - 当前页面 URL（用于判断使用哪个 API）
 * @returns {Promise<{success: boolean, uploadedUrl?: string, error?: string}>}
 */
async function uploadImageToZhihu(imageUrl, cookie, pageUrl = '') {
  try {
    // 根据页面 URL 选择不同的上传 API
    const isQuestionPage = pageUrl.includes('www.zhihu.com/question');
    
    if (isQuestionPage) {
      // 问题回答页面使用 v4 API
      return await uploadToQuestionApi(imageUrl, cookie);
    } else {
      // 专栏文章使用原 API
      return await uploadToArticleApi(imageUrl, cookie);
    }
  } catch (error) {
    console.error('上传图片失败:', error);
    return {
      success: false,
      error: error.message,
      originalUrl: imageUrl
    };
  }
}

/**
 * 专栏文章上传 API
 */
async function uploadToArticleApi(imageUrl, cookie) {
  const UPLOAD_URL = 'https://zhuanlan.zhihu.com/api/uploaded_images';
  
  const formData = new FormData();
  formData.append('url', imageUrl);
  formData.append('source', 'article');
  
  const response = await fetch(UPLOAD_URL, {
    method: 'POST',
    headers: {
      'Accept': '*/*',
      'Cookie': cookie,
      'x-requested-with': 'fetch'
    },
    body: formData
  });
  
  if (!response.ok) {
    throw new Error(`上传失败，状态码: ${response.status}`);
  }
  
  const result = await response.json();
  
  if (result.src) {
    return { success: true, uploadedUrl: result.src };
  } else {
    throw new Error('响应中没有图片 URL');
  }
}

/**
 * 问题回答上传 API - 直接下载图片再上传
 */
async function uploadToQuestionApi(imageUrl, cookie) {
  try {
    // 先下载图片
    console.log('下载图片:', imageUrl);
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('下载图片失败');
    }
    
    const blob = await imageResponse.blob();
    console.log('图片下载成功，大小:', blob.size);
    
    // 提取 XSRF Token
    const xsrfToken = extractXsrfToken(cookie);
    
    // 上传到知乎
    const UPLOAD_URL = 'https://www.zhihu.com/api/v4/uploaded_images';
    const formData = new FormData();
    formData.append('picture', blob, 'image.jpg');
    formData.append('source', 'question');
    
    const response = await fetch(UPLOAD_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Cookie': cookie,
        'x-requested-with': 'fetch',
        'x-xsrftoken': xsrfToken
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`上传失败，状态码: ${response.status}, 响应: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('上传响应:', result);
    
    // v4 API 返回格式
    const uploadedUrl = result.src || result.url || result.image_url;
    
    if (uploadedUrl) {
      return { success: true, uploadedUrl };
    } else {
      throw new Error('响应中没有图片 URL: ' + JSON.stringify(result));
    }
  } catch (error) {
    console.error('问题页面上传失败:', error);
    // 降级：尝试使用专栏 API
    console.log('尝试使用专栏 API');
    return await uploadToArticleApi(imageUrl, cookie);
  }
}
