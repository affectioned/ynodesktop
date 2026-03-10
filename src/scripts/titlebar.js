module.exports = function (win) {
  // Atomic in-flight guard: if a creation is already underway on this page,
  // skip the second call so did-finish-load can never inject duplicates.
  win.webContents
    .executeJavaScript(
      `
        if (window.__ynodTitlebarCreating || document.querySelector('#ynod-titlebar')) {
            false;
        } else {
            window.__ynodTitlebarCreating = true;
            true;
        }
      `
    )
    .then((shouldCreate) => {
      if (shouldCreate) createTitleBar();
    });

  function createTitleBar() {
    win.webContents.executeJavaScript(`
        document.body.insertAdjacentHTML('afterBegin', \`

        <div id="ynod-titlebar">
            <div id="ynod-titlebar-drag">
                <span id="ynod-titlebar-title">Yume Nikki Online Project</span>
            </div>
            <div id="ynod-titlebar-buttons">
                <div id="ynod-discord-toggle" class="ynod-titlebar-button" onclick="ynodToggleDiscord()" title="Toggle Discord Rich Presence">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="rgba(194, 146, 200, 1)" class="bi bi-discord" viewBox="0 0 16 16">
                        <path d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.384 8.384 0 0 0-.412-.833.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.051.051 0 0 0-.018-.011 8.875 8.875 0 0 1-1.248-.595.05.05 0 0 1-.02-.066.051.051 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.051.051 0 0 1-.004.085 8.254 8.254 0 0 1-1.249.594.05.05 0 0 0-.03.03.052.052 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019zm-8.198 7.307c-.789 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612zm5.316 0c-.788 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612z"/>
                    </svg>
                </div>
                <div id="ynod-titlebar-minimize" class="ynod-titlebar-button" onclick="window.electronAPI.minimize()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="rgba(194, 146, 200, 1)" class="bi bi-dash-lg" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M2 8a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 2 8Z"/>
                    </svg>
                </div>
                <div id="ynod-titlebar-maximize" class="ynod-titlebar-button" onclick="window.electronAPI.maximize()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="rgba(194, 146, 200, 1)" class="bi bi-dash-square" viewBox="0 0 16 16">
                        <path d="M3 3.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm1.5 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm1 .5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Z"/>
                        <path d="M.5 1a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 .5.5h15a.5.5 0 0 0 .5-.5v-13a.5.5 0 0 0-.5-.5H.5ZM1 5V2h14v3H1Zm0 1h14v8H1V6Z"/>
                    </svg>
                </div>
                <div id="ynod-titlebar-close" class="ynod-titlebar-button" onclick="window.close()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="rgba(194, 146, 200, 1)" class="bi bi-x-lg" viewBox="0 0 16 16">
                        <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                    </svg>
                </div>
            </div>
        </div>

        <style>
            #ynod-titlebar {
                position: sticky;
                top: 0;
                left: 0;
                width: 100%;
                height: 30px;
                background-color: #000000;
                z-index: 9999;
                display: flex;
                flex-direction: row;
            }
            #ynod-titlebar-drag {
                flex-grow: 1;
                display: flex;
                align-items: center;
                -webkit-app-region: drag;
            }
            #ynod-titlebar-buttons {
                display: flex;
                flex-direction: row;
            }
            .ynod-titlebar-button {
                width: 30px;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .ynod-titlebar-button:hover {
                background-color: #333333;
            }
            #ynod-titlebar-title {
                font-size: 14px;
                padding-left: 10px;
                color: rgba(194, 146, 200, 1);
            }
            body::-webkit-scrollbar {
                display: none;
            }
            /* Discord toggle: crossed-out state */
            #ynod-discord-toggle {
                position: relative;
            }
            #ynod-discord-toggle.ynod-rpc-disabled {
                opacity: 0.45;
            }
            #ynod-discord-toggle.ynod-rpc-disabled::after {
                content: '';
                position: absolute;
                width: 20px;
                height: 2px;
                background: rgba(194, 146, 200, 1);
                transform: rotate(-45deg);
                border-radius: 1px;
                pointer-events: none;
            }
        </style>

        \`)
        `);

    win.webContents.executeJavaScript(`
            window.__ynodTitlebarCreating = false;

            function updateTitle() {
                document.querySelector('#content')?.scrollTo(0,0)
                if (document.title != "YNOproject" && document.title.includes("YNOproject")) {
                    var titleEl = document.getElementById("ynod-titlebar-title");
                    if (!titleEl) return;
                    var noticeEl = document.querySelector('div.notice.version');
                    titleEl.textContent = noticeEl
                        ? noticeEl.innerText
                        : document.title.split(" - ")[0];
                }
            }
            updateTitle();
            setInterval(updateTitle, 1000);

            function ynodSetDiscordButtonState(enabled) {
                var btn = document.getElementById('ynod-discord-toggle');
                if (!btn) return;
                btn.classList.toggle('ynod-rpc-disabled', !enabled);
            }

            function ynodToggleDiscord() {
                window.electronAPI.toggleDiscordRpc().then(ynodSetDiscordButtonState);
            }

            window.electronAPI.getDiscordRpcEnabled().then(ynodSetDiscordButtonState);
        `);
  }
};
