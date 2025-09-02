
![ynodesk](https://user-images.githubusercontent.com/2998216/201456135-270da105-a4fa-4976-a69a-3a69e5d3fe59.png)

A desktop client for [Yume Nikki Online](https://ynoproject.net/) with optional Discord Rich Presence. Show your friends what game you're playing and what room you're in. Also looks pretty cool as an installed program.

Created as a simple Electron wrapper around the website, with optional `discord-rpc` integration and some hacks to make save exporting/importing work.

## Features

- Optional Discord Rich Presence to display your game status and room information to friends on Discord.
- Easy installation and setup.
- Smooth integration with Yume Nikki Online.

## Rich Presence

![Rich Presence Example 1](https://user-images.githubusercontent.com/2998216/201456282-6337d763-db5c-4fc2-b399-00b3513b1f7b.png)

![Rich Presence Example 2](https://user-images.githubusercontent.com/2998216/201456297-8cb36ebb-6400-4ae8-9804-ce51bcf3c1b5.png)

## Download

The releases are currently Windows-only.

[Click here to go to the download page for the latest release.](https://github.com/aguish/ynodesktop/releases/latest)

## Development Setup

To set up the project locally, you need to have [Node.js](https://nodejs.org/) and [Yarn](https://yarnpkg.com/) installed. Then follow these steps:

1. Clone the repository:

```sh
git clone https://github.com/aguish/ynodesktop.git

cd ynodesktop
```

2. Install dependencies:

```sh
yarn install
```

3. Run the application:

To run the application, use the following command:

```sh
yarn start
```

If you prefer to run the application without Discord RPC, use the following command:

```sh
yarn start-nodrpc
```

## Building the Project

To build the project, use the following command:

```sh
yarn dist
```

If you need to build the project without Discord RPC, use the following command and edit main entrypoint in package.json:

```sh
yarn dist-nodrpc
```

This will create the distributable files in the `dist` directory.

## Project Structure

- `main.js`: The main entry point of the application.
- `main-nodrpc.js`: The main entry point of the no Discord RPC version of the application.
- `preload.js`: A script that runs before the main process, often used to set up initial configurations or preload certain resources.
- `scripts/discordRpcUtils.js`: Utility functions for handling Discord RPC (Remote Procedure Call) integrations.
- `scripts/promptinjection.js`: Handles prompt injection logic for the application.
- `scripts/titlebar.js`: Manages the title bar functionality and customization.
- `package.json`: Contains project metadata and dependencies.
- `yarn.lock`: Dependency lock file to ensure consistent setups.


## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## YNOproject

Click on the heading to check out the [Yume Nikki Online Project](https://github.com/ynoproject)!  
Make sure to check out Collective Unconscious, YNO's own multiplayer collaborative Yume Nikki Fangame!
