#!/bin/bash

# 知乎 Markdown 图片自动上传插件 - Git 初始化脚本

echo "🚀 初始化 Git 仓库..."

# 初始化 git
git init

# 添加所有文件
git add .

# 提交
git commit -m "🎉 Initial commit: 知乎 Markdown 图片自动上传插件 v1.0.1

功能特点：
- ✨ 自动识别并上传 Markdown 图片
- 🔄 支持批量处理
- 📊 实时进度提示
- 🎯 零配置开箱即用

支持页面：
- 知乎文章编辑
- 知乎问题回答
"

echo ""
echo "✅ Git 仓库初始化完成！"
echo ""
echo "📝 下一步操作："
echo "1. 在 GitHub 创建仓库: https://github.com/new"
echo "   仓库名: zhihu-markdown-image-uploader"
echo "   描述: 🚀 知乎 Markdown 图片自动上传 Chrome 插件 | 自动识别并上传外链图片到知乎图床"
echo ""
echo "2. 关联远程仓库并推送:"
echo "   git remote add origin https://github.com/liyupi/zhihu-markdown-image-uploader.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. 设置仓库标签 (在 GitHub 仓库页面):"
echo "   chrome-extension, zhihu, markdown, image-upload, browser-extension"
echo ""
