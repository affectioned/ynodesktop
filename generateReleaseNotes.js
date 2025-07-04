const { exec } = require("child_process");
const fs = require("fs");

const oldVersion = "1.2.3";
const newVersion = "1.2.4";

exec(`git log ${oldVersion}..${newVersion} --oneline`, (error, stdout) => {
    const formattedOutput = stdout
        .split("\n") // Split commits into lines
        .filter(line => line.trim() !== "") // Remove empty lines
        .map(line => `- ${line}`) // Add a bullet point to each line
        .join("\n"); // Join the lines back into a single string

    const content = `# Release Notes for ${newVersion}\n\n## Changes between ${oldVersion} and ${newVersion}\n\n${formattedOutput}`;

    fs.writeFile(`release-notes-${newVersion}.md`, content, () => {});
});