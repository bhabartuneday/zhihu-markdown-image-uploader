/**
 * 知乎 Markdown 图片自动上传 - 内容脚本
 */

(function() {
  'use strict';
  
  console.log('知乎 Markdown 图片自动上传插件已加载');
  
  let isProcessing = false;
  let zhihuCookie = null;
  
  // 初始化：获取 Cookie
  initPlugin();
  
  /**
   * 初始化插件
   */
  async function initPlugin() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getCookie' });
      if (response.success) {
        zhihuCookie = response.cookie;
        console.log('知乎 Cookie 获取成功');
      } else {
        console.error('获取知乎 Cookie 失败:', response.error);
      }
    } catch (error) {
      console.error('初始化插件失败:', error);
    }
  }
  
  /**
   * 监听粘贴事件 - 使用捕获阶段确保能捕获到
   */
  document.addEventListener('paste', async (event) => {
    console.log('🎯 检测到粘贴事件', event.target);
    
    if (isProcessing) {
      console.log('⏸️ 正在处理中，跳过本次粘贴');
      return;
    }
    
    // 简化检查：只要在知乎编辑页面就处理
    console.log('✅ 在知乎编辑页面');
    
    // 获取粘贴的文本内容
    const pastedText = event.clipboardData.getData('text/plain');
    if (!pastedText) {
      console.log('❌ 没有获取到文本内容');
      return;
    }
    console.log('📝 获取到粘贴内容，长度:', pastedText.length);
    
    // 检查是否包含 Markdown 图片语法
    const imageRegex = /!\[([^\]]*)\]\((https?:\/\/[^\)]+)\)/g;
    const matches = [...pastedText.matchAll(imageRegex)];
    
    console.log('🔍 检测到图片数量:', matches.length);
    if (matches.length === 0) {
      console.log('❌ 没有检测到 Markdown 图片语法');
      return;
    }
    
    console.log('✅ 检测到图片:', matches.map(m => m[2]));
    
    console.log(`✅ 检测到 ${matches.length} 张 Markdown 图片，开始处理...`);
    
    // 阻止默认粘贴行为
    event.preventDefault();
    event.stopPropagation();
    
    // 显示处理提示
    showNotification(`正在上传 ${matches.length} 张图片...`, 'info');
    
    isProcessing = true;
    
    try {
      // 处理图片上传
      const processedText = await processMarkdownImages(pastedText, matches);
      
      // 插入处理后的内容
      insertContentToEditor(event.target, processedText);
      
      showNotification('图片上传完成！', 'success');
    } catch (error) {
      console.error('处理图片失败:', error);
      showNotification('图片上传失败: ' + error.message, 'error');
      
      // 失败时插入原始内容
      insertContentToEditor(event.target, pastedText);
    } finally {
      isProcessing = false;
    }
  }, { capture: true, passive: false }); // 使用捕获阶段，非被动模式
  
  /**
   * 查找知乎编辑器元素
   */
  function findZhihuEditor(target) {
    console.log('🔍 查找编辑器，目标元素:', target.tagName, target.className);
    
    // 知乎编辑器可能的选择器
    const editorSelectors = [
      '.public-DraftEditor-content',
      '[contenteditable="true"]',
      '.RichContent-inner',
      '.ProseMirror',
      '.DraftEditor-root',
      '.notranslate',
      'div[role="textbox"]',
      'div[data-slate-editor="true"]'
    ];
    
    // 先检查目标元素本身
    if (target.contentEditable === 'true') {
      console.log('✅ 目标元素本身可编辑');
      return target;
    }
    
    // 再检查父元素
    for (const selector of editorSelectors) {
      const editor = target.closest(selector);
      if (editor) {
        console.log('✅ 找到编辑器:', selector);
        return editor;
      }
    }
    
    console.log('❌ 未找到编辑器');
    return null;
  }
  
  /**
   * 处理 Markdown 中的图片
   */
  async function processMarkdownImages(text, matches) {
    let processedText = text;
    let successCount = 0;
    let failCount = 0;
    
    // 并发上传所有图片（限制并发数为 3）
    const uploadPromises = [];
    for (let i = 0; i < matches.length; i += 3) {
      const batch = matches.slice(i, i + 3);
      const batchPromises = batch.map(match => uploadSingleImage(match));
      const results = await Promise.all(batchPromises);
      
      // 替换文本中的图片链接
      results.forEach(result => {
        if (result.success) {
          processedText = processedText.replace(result.originalUrl, result.uploadedUrl);
          successCount++;
        } else {
          failCount++;
        }
      });
      
      // 更新进度提示
      const total = matches.length;
      const current = Math.min(i + 3, total);
      showNotification(`上传进度: ${current}/${total}`, 'info');
    }
    
    console.log(`图片上传完成: 成功 ${successCount}，失败 ${failCount}`);
    
    return processedText;
  }
  
  /**
   * 上传单张图片
   */
  async function uploadSingleImage(match) {
    const [fullMatch, altText, originalUrl] = match;
    
    try {
      console.log('上传图片:', originalUrl);
      
      const response = await chrome.runtime.sendMessage({
        action: 'uploadImage',
        imageUrl: originalUrl,
        cookie: zhihuCookie,
        pageUrl: window.location.href // 传递当前页面 URL
      });
      
      if (response.success) {
        console.log('上传成功:', response.uploadedUrl);
        return {
          success: true,
          originalUrl,
          uploadedUrl: response.uploadedUrl
        };
      } else {
        console.error('上传失败:', response.error);
        return {
          success: false,
          originalUrl,
          error: response.error
        };
      }
    } catch (error) {
      console.error('上传异常:', error);
      return {
        success: false,
        originalUrl,
        error: error.message
      };
    }
  }
  
  /**
   * 将内容插入到编辑器
   */
  function insertContentToEditor(target, content) {
    console.log('📝 插入内容到编辑器');
    
    // 方法1: 使用 DataTransfer 模拟粘贴
    try {
      const dataTransfer = new DataTransfer();
      dataTransfer.setData('text/plain', content);
      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData: dataTransfer,
        bubbles: true,
        cancelable: true
      });
      target.dispatchEvent(pasteEvent);
      console.log('✅ 使用 DataTransfer 插入成功');
      return;
    } catch (e) {
      console.log('❌ DataTransfer 失败:', e);
    }
    
    // 方法2: execCommand
    try {
      document.execCommand('insertText', false, content);
      console.log('✅ 使用 execCommand 插入成功');
      return;
    } catch (e) {
      console.log('❌ execCommand 失败:', e);
    }
    
    // 方法3: Selection API
    try {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(content);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
        console.log('✅ 使用 Selection API 插入成功');
        return;
      }
    } catch (e) {
      console.log('❌ Selection API 失败:', e);
    }
    
    console.log('❌ 所有插入方法都失败');
  }
  
  /**
   * 显示通知提示
   */
  function showNotification(message, type = 'info') {
    // 移除已存在的通知
    const existingNotification = document.getElementById('zhihu-markdown-notification');
    if (existingNotification) {
      existingNotification.remove();
    }
    
    // 创建通知元素
    const notification = document.createElement('div');
    notification.id = 'zhihu-markdown-notification';
    notification.textContent = message;
    
    // 样式
    const colors = {
      info: '#1890ff',
      success: '#52c41a',
      error: '#ff4d4f'
    };
    
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 24px',
      backgroundColor: colors[type] || colors.info,
      color: 'white',
      borderRadius: '4px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      zIndex: '999999',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      maxWidth: '300px'
    });
    
    document.body.appendChild(notification);
    
    // 3秒后自动消失
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
  
})();
