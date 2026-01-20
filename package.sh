#!/bin/bash

# 知乎 Markdown 图片自动上传插件 - 打包脚本

echo "🚀 开始打包插件..."

# 检查图标文件
if [ ! -f "icons/icon16.png" ] || [ ! -f "icons/icon48.png" ] || [ ! -f "icons/icon128.png" ]; then
    echo "❌ 错误: 缺少图标文件"
    echo "请先在 icons/ 目录下准备以下文件："
    echo "  - icon16.png (16x16)"
    echo "  - icon48.png (48x48)"
    echo "  - icon128.png (128x128)"
    echo ""
    echo "你可以使用以下命令生成占位图标："
    echo "  cd icons"
    echo "  convert -size 16x16 xc:#0066FF icon16.png"
    echo "  convert -size 48x48 xc:#0066FF icon48.png"
    echo "  convert -size 128x128 xc:#0066FF icon128.png"
    exit 1
fi

# 创建打包目录
PACKAGE_NAME="zhihu-markdown-uploader-v1.0.0"
rm -rf "$PACKAGE_NAME"
mkdir -p "$PACKAGE_NAME"

# 复制文件
echo "📦 复制文件..."
cp manifest.json "$PACKAGE_NAME/"
cp background.js "$PACKAGE_NAME/"
cp content.js "$PACKAGE_NAME/"
cp popup.html "$PACKAGE_NAME/"
cp popup.js "$PACKAGE_NAME/"
cp -r icons "$PACKAGE_NAME/"
cp README.md "$PACKAGE_NAME/"
cp INSTALL.md "$PACKAGE_NAME/"

# 创建 ZIP 包
echo "🗜️  创建 ZIP 包..."
zip -r "$PACKAGE_NAME.zip" "$PACKAGE_NAME"

# 清理临时目录
rm -rf "$PACKAGE_NAME"

echo "✅ 打包完成: $PACKAGE_NAME.zip"
echo ""
echo "📝 下一步操作："
echo "1. 解压 $PACKAGE_NAME.zip"
echo "2. 在 Chrome 中加载解压后的文件夹"
echo "3. 或者上传 ZIP 到 Chrome 应用商店"
