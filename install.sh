#!/usr/bin/env bash

set -e

APP_NAME="wyandexmusic"
BIN_DIR="$HOME/.local/bin"
DESKTOP_DIR="$HOME/.local/share/applications"
ICON_DIR="$HOME/.local/share/icons/hicolor/512x512/apps"
SYMBOLIC_ICON_DIR="$HOME/.local/share/icons/hicolor/symbolic/apps"

MISSING_DEPS=()

check_cmd() {
    if ! command -v "$1" > /dev/null 2>&1; then
        MISSING_DEPS+=("$1")
    fi
}

check_pkg() {
    if ! pkg-config --exists "$1" > /dev/null 2>&1; then
        MISSING_DEPS+=("$1")
    fi
}

echo ":: Проверка зависимостей..."

check_cmd node
check_cmd npm
check_cmd cargo
check_cmd rustc
check_cmd pkg-config

if command -v pkg-config > /dev/null 2>&1; then
    if ! pkg-config --exists webkit2gtk-4.1 > /dev/null 2>&1 && ! pkg-config --exists webkit2gtk-4.0 > /dev/null 2>&1; then
        MISSING_DEPS+=("webkit2gtk-4.1")
    fi
    check_pkg gtk+-3.0
    check_pkg openssl
fi

if [ ${#MISSING_DEPS[@]} -ne 0 ]; then
    echo "Ошибка: не найдены обязательные зависимости: ${MISSING_DEPS[*]}"

    DISTRO=""
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        DISTRO="${ID_LIKE:-$ID}"
    fi

    echo "Установите их командой:"
    case "$DISTRO" in
        *arch*|*cachyos*|*manjaro*)
            echo "  sudo pacman -S --needed base-devel nodejs npm rust webkit2gtk-4.1 gtk3 openssl libayatana-appindicator"
            ;;
        *debian*|*ubuntu*)
            echo "  sudo apt update && sudo apt install -y build-essential curl libwebkit2gtk-4.1-dev libgtk-3-dev libssl-dev libayatana-appindicator3-dev nodejs npm cargo rustc"
            ;;
        *fedora*)
            echo "  sudo dnf install -y webkit2gtk4.1-devel gtk3-devel openssl-devel libayatana-appindicator-devel nodejs npm cargo rust"
            ;;
        *)
            echo "  Установите эквиваленты пакетов: nodejs, npm, cargo, rust, webkit2gtk-4.1, gtk3, openssl"
            ;;
    esac
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo ":: Установка npm зависимостей..."
    npm install
fi

echo ":: Сборка приложения..."
npm run tauri build

SOURCE_BIN=""
if [ -f "src-tauri/target/release/wyandexmusic" ]; then
    SOURCE_BIN="src-tauri/target/release/wyandexmusic"
elif ls src-tauri/target/release/bundle/appimage/*.AppImage 1> /dev/null 2>&1; then
    SOURCE_BIN=$(ls src-tauri/target/release/bundle/appimage/*.AppImage | head -n 1)
fi

if [ -z "$SOURCE_BIN" ]; then
    echo "Ошибка: исполняемый файл не найден после сборки."
    exit 1
fi

echo ":: Установка..."
mkdir -p "$BIN_DIR" "$DESKTOP_DIR" "$ICON_DIR" "$SYMBOLIC_ICON_DIR"

cp "$SOURCE_BIN" "$BIN_DIR/$APP_NAME"
chmod +x "$BIN_DIR/$APP_NAME"

if [ -f "src-tauri/icons/icon.png" ]; then
    cp "src-tauri/icons/icon.png" "$ICON_DIR/$APP_NAME.png"
elif [ -f "src-tauri/icons/128x128.png" ]; then
    mkdir -p "$HOME/.local/share/icons/hicolor/128x128/apps"
    cp "src-tauri/icons/128x128.png" "$HOME/.local/share/icons/hicolor/128x128/apps/$APP_NAME.png"
fi

if [ -f "src-tauri/icons/tray.png" ]; then
    cp "src-tauri/icons/tray.png" "$SYMBOLIC_ICON_DIR/$APP_NAME-symbolic.png"
fi

cat <<EOF > "$DESKTOP_DIR/$APP_NAME.desktop"
[Desktop Entry]
Name=Wyandexmusic
Comment=Desktop client for Yandex Music
Exec=$BIN_DIR/$APP_NAME
Icon=$APP_NAME
Terminal=false
Type=Application
Categories=Audio;Music;Player;AudioVideo;
StartupWMClass=wyandexmusic
EOF

chmod +x "$DESKTOP_DIR/$APP_NAME.desktop"

if command -v update-desktop-database > /dev/null 2>&1; then
    update-desktop-database "$DESKTOP_DIR" > /dev/null 2>&1 || true
fi

if command -v kbuildsycoca6 > /dev/null 2>&1; then
    kbuildsycoca6 > /dev/null 2>&1 || true
fi

echo ":: Успешно установлено в $BIN_DIR/$APP_NAME"
