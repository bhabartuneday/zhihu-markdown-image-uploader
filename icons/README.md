# 图标说明

本插件需要以下尺寸的图标：

- `icon16.png` - 16x16 像素（浏览器工具栏小图标）
- `icon48.png` - 48x48 像素（扩展程序管理页面）
- `icon128.png` - 128x128 像素（Chrome 应用商店）

## 生成图标

你可以使用以下工具生成图标：

1. **在线工具**
   - https://www.favicon-generator.org/
   - https://realfavicongenerator.net/

2. **设计软件**
   - Figma
   - Sketch
   - Photoshop

3. **AI 生成**
   - 使用 AI 绘图工具生成一个知乎风格的图标
   - 主题：文档、上传、图片
   - 配色：知乎蓝 (#0066FF)

## 临时方案

如果暂时没有图标，可以使用纯色占位图：

```bash
# 使用 ImageMagick 生成占位图标
convert -size 16x16 xc:#0066FF icon16.png
convert -size 48x48 xc:#0066FF icon48.png
convert -size 128x128 xc:#0066FF icon128.png
```

或者使用在线工具：
https://placeholder.com/
