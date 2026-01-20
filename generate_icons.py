#!/usr/bin/env python3
"""
生成插件图标的 Python 脚本
如果没有 ImageMagick，可以使用这个脚本生成简单的占位图标
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, output_path):
    """
    创建一个简单的图标
    
    Args:
        size: 图标尺寸 (width, height)
        output_path: 输出文件路径
    """
    # 创建图像（知乎蓝色背景）
    img = Image.new('RGB', size, color='#0066FF')
    draw = ImageDraw.Draw(img)
    
    # 绘制白色边框
    border_width = max(1, size[0] // 16)
    draw.rectangle(
        [(border_width, border_width), (size[0] - border_width, size[1] - border_width)],
        outline='white',
        width=border_width
    )
    
    # 绘制上传箭头符号
    center_x, center_y = size[0] // 2, size[1] // 2
    arrow_size = size[0] // 3
    
    # 箭头向上的三角形
    triangle = [
        (center_x, center_y - arrow_size // 2),  # 顶点
        (center_x - arrow_size // 2, center_y + arrow_size // 4),  # 左下
        (center_x + arrow_size // 2, center_y + arrow_size // 4),  # 右下
    ]
    draw.polygon(triangle, fill='white')
    
    # 箭头的竖线
    line_width = max(2, size[0] // 16)
    draw.rectangle(
        [
            (center_x - line_width // 2, center_y),
            (center_x + line_width // 2, center_y + arrow_size // 2)
        ],
        fill='white'
    )
    
    # 保存图标
    img.save(output_path, 'PNG')
    print(f'✅ 生成图标: {output_path}')

def main():
    """主函数"""
    # 创建 icons 目录
    icons_dir = 'icons'
    if not os.path.exists(icons_dir):
        os.makedirs(icons_dir)
        print(f'📁 创建目录: {icons_dir}')
    
    # 生成三种尺寸的图标
    sizes = [
        (16, 16, 'icon16.png'),
        (48, 48, 'icon48.png'),
        (128, 128, 'icon128.png')
    ]
    
    print('🎨 开始生成图标...\n')
    
    for width, height, filename in sizes:
        output_path = os.path.join(icons_dir, filename)
        create_icon((width, height), output_path)
    
    print('\n🎉 所有图标生成完成！')
    print('\n📝 下一步：')
    print('1. 在 Chrome 中打开 chrome://extensions/')
    print('2. 启用"开发者模式"')
    print('3. 点击"加载已解压的扩展程序"')
    print('4. 选择本项目文件夹')

if __name__ == '__main__':
    try:
        main()
    except ImportError:
        print('❌ 错误: 需要安装 Pillow 库')
        print('\n请运行以下命令安装:')
        print('  pip install Pillow')
        print('\n或者使用在线工具生成图标:')
        print('  https://www.favicon-generator.org/')
