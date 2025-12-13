# Resources Directory

This directory contains assets required for packaging and distribution of Space Manager.

## Icons

Place application icons in the `icons/` directory:

### Windows
- `icon.ico` - Application icon (256x256, .ico format)
- `installer.ico` - Installer icon (256x256, .ico format)
- `uninstaller.ico` - Uninstaller icon (256x256, .ico format)

### macOS
- `icon.icns` - Application icon bundle (.icns format containing multiple sizes)

### Linux
- `icon.png` - Application icon (512x512, .png format)

## Installer

Place installer background images in the `installer/` directory:

- `background.png` - macOS DMG background image (540x380 pixels recommended)

## Generating Icons

Use tools like:
- **iconutil** (macOS) - For creating .icns files
- **png2ico** or **imagemagick** - For creating .ico files from PNG
- Online tools like https://cloudconvert.com/ico-converter

## Icon Sizes Recommended

| Platform | Sizes |
|----------|-------|
| Windows  | 256x256, 128x128, 64x64, 48x48, 32x32, 16x16 |
| macOS    | 1024x1024, 512x512, 256x256, 128x128, 64x64, 32x32, 16x16 |
| Linux    | 512x512, 256x256, 128x128, 64x64, 48x48, 32x32, 16x16 |
