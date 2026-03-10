// This module is a hack to make YNOonline prompts work with Electron.
// SweetAlert2 is bundled locally (node_modules) instead of loaded from a CDN
// to eliminate the runtime supply-chain risk of an unsigned external script.

const fs = require('fs');
const path = require('path');

// Read the SweetAlert2 all-in-one bundle (JS + CSS) once at startup
let swal2Source = null;
try {
  swal2Source = fs.readFileSync(
    path.join(__dirname, '../../node_modules/sweetalert2/dist/sweetalert2.all.min.js'),
    'utf8'
  );
} catch (err) {
  console.error('promptinjection: could not load SweetAlert2 bundle:', err);
}

const SWAL_CONFIG = JSON.stringify({
  title: 'Save slot?',
  icon: 'question',
  input: 'range',
  inputLabel: 'Slot number',
  inputAttributes: { min: 1, max: 15, step: 1 },
  inputValue: 1,
});

module.exports = function (win) {
  if (!swal2Source) return; // skip if bundle failed to load

  // Inject SweetAlert2 into the renderer once per page load.
  // The guard prevents double-injection on re-entrant calls.
  win.webContents.executeJavaScript(
    'if(!window.__ynodSwal2){window.__ynodSwal2=true;' + swal2Source + '}'
  ).catch(console.error);

  // Set up download/upload button overrides that use the locally-injected Swal
  win.webContents.executeJavaScript(`
    (function() {
      if (window.__ynodPromptInjected) return;

      var poll = setInterval(function() {
        if (document.title === "Yume Nikki Online Project") {
          clearInterval(poll);
          return;
        }
        var dlBtn = document.querySelector("#downloadButton");
        if (!dlBtn?.onclick) return;

        clearInterval(poll);
        window.__ynodPromptInjected = true;

        var originalDownloadClick = dlBtn.onclick;
        dlBtn.onclick = function() {
          Swal.fire(${SWAL_CONFIG}).then(function(result) {
            window.prompt = function() { return result.value; };
            originalDownloadClick();
          });
        };

        var ulBtn = document.querySelector("#uploadButton");
        if (ulBtn?.onclick) {
          var originalUploadClick = ulBtn.onclick;
          ulBtn.onclick = function() {
            Swal.fire(${SWAL_CONFIG}).then(function(result) {
              window.prompt = function() { return result.value; };
              originalUploadClick();
            });
          };
        }
      }, 200);
    })();
  `).catch(console.error);
};
