function drawWalls(walls) {
    const regex = /([0-9]+).? /g
    let numericalWalls = []
    for(let wallInfo of walls) {
        let wall = wallInfo.points;
        wall = [...wall.matchAll(regex)]
        wall = wall.map((regexArray) => (parseFloat(regexArray[1])/256)*canvas.scene.dimensions.size)
        for(let i=0; i<wall.length-2;i+=2) {
            numericalWalls.push({c: [wall[i], wall[i+1], wall[i+2], wall[i+3]]})
        }
        if(wallInfo.loop) {
            numericalWalls.push({c: [wall[0], wall[1], wall[wall.length-2], wall[wall.length-1]]})
        }
    }
    canvas.scene.createEmbeddedDocuments("Wall", numericalWalls)
}

function drawData(json) {
    const walls = json["world"]["levels"]["0"]["walls"]
    drawWalls(walls)
}

async function drawScene() {
    await new Dialog({
        content: await renderTemplate("modules/foundryvtt-dungeondraft-integration/templates/dialogue.html",),
        buttons: {
            submit: {
                label: "Submit", callback: () => {
                    const results = document.getElementById("dungeondraftFile").files[0]
                    results.text().then((text) => drawData(JSON.parse(text)))
                }
            }
        }
    }).render(true)
}

Hooks.on("getSceneControlButtons", (controls) => {
    let wallTools = controls.find((x) => x["name"] === "walls").tools;
    wallTools.splice(wallTools.length-2, 0, {
        icon: "fas fa-landmark",
        name: "dungeondraftButton",
        title: "Draw Dungeondraft Walls",
        onClick: async () => {
            await drawScene();
        }
    });

});