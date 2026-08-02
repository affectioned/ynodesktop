

![ynodesk](https://user-images.githubusercontent.com/2998216/201456135-270da105-a4fa-4976-a69a-3a69e5d3fe59.png)

Un cliente de escritorio para [Yume Nikki Online](https://ynoproject.net/) con Discord Rich Presence opcional. Muestra a tus amigos qué juego estás jugando y en qué habitación te encuentras.

[![Build and Release](https://github.com/aguish/ynodesktop/actions/workflows/release.yml/badge.svg)](https://github.com/aguish/ynodesktop/actions/workflows/release.yml)

## Descarga

[**→ Último lanzamiento**](https://github.com/aguish/ynodesktop/releases/latest)

| Plataforma | Archivo |
|----------|------|
| Windows | `YNOdesktop-*-win-*.exe` — portátil, no requiere instalación |
| macOS (Intel) | `YNOdesktop-*-mac-x64.dmg` |
| macOS (Apple Silicon) | `YNOdesktop-*-mac-arm64.dmg` |
| Linux | `YNOdesktop-*-linux-*.AppImage` |

### Nota para macOS

macOS bloqueará la aplicación al iniciarla por primera vez porque no está certificada. Para permitir su ejecución:

```sh
xattr -cr /Applications/YNOdesktop.app
```

O haz clic derecho en la aplicación → Abrir → Abrir.

### Nota para Linux

Haz que el AppImage sea ejecutable antes de ejecutarlo:

```sh
chmod +x YNOdesktop-*.AppImage
./YNOdesktop-*.AppImage
```

## Discord Rich Presence

![Rich Presence Example 1](https://user-images.githubusercontent.com/2998216/201456282-6337d763-db5c-4fc2-b399-00b3513b1f7b.png)

![Rich Presence Example 2](https://user-images.githubusercontent.com/2998216/201456297-8cb36ebb-6400-4ae8-9804-ce51bcf3c1b5.png)

Haz clic en el icono de Discord en la barra de título para activar o desactivar Rich Presence en cualquier momento.

## Configuración de desarrollo

Requiere [Node.js](https://nodejs.org/) y [Yarn](https://yarnpkg.com/).

```sh
git clone https://github.com/aguish/ynodesktop.git
cd ynodesktop
yarn install
yarn start
```

## Compilación

Compila para la plataforma actual:

```sh
yarn dist
```

O apunta a una plataforma específica:

```sh
yarn dist-win      # .exe portátil de Windows
yarn dist-linux    # AppImage de Linux
yarn dist-mac      # dmg + zip de macOS (x64 y arm64)
```

Los archivos resultantes se colocan en el directorio `dist/`.

Los lanzamientos se compilan automáticamente mediante GitHub Actions cuando se publica una etiqueta de versión:

```sh
git tag v1.2.7
git push origin v1.2.7
```

## Estructura del proyecto

```
src/
  main.js                    # Punto de entrada de la aplicación
  createApp.js               # Ventana, IPC, sesión, menú contextual
  preload.js                 # Superficie de API contextBridge para el renderer
  scripts/
    discordRpcUtils.js       # Lógica de Discord Rich Presence
    titlebar.js              # Barra de título personalizada inyectada
    promptinjection.js       # Diálogo de guardado (reemplaza window.prompt)
    utils.js                 # Funciones auxiliares para análisis de URL
assets/
  logo.png / logo.ico        # Iconos de la aplicación
.github/workflows/
  release.yml                # CI: compilar y publicar lanzamientos
```

## YNOproject

¡Echa un vistazo al [Proyecto Yume Nikki Online](https://github.com/ynoproject)!
