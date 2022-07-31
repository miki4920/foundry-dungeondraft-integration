function convertVectorIntoArray(vector, regex, scale=true) {
    vector = [...vector.matchAll(regex)]
    let array = []
    for(let number of vector) {
        number = parseFloat(number[1])
        if (scale) {
            number = (number/256)*canvas.scene.dimensions.size
        }
        array.push(number)
    }
    return array
}

function drawWalls(walls) {
    const regex = /([0-9]+).? /g
    let numericalWalls = []
    for(let wallInfo of walls) {
        let wall = convertVectorIntoArray(wallInfo.points, regex)
        for(let i=0; i<wall.length-2;i+=2) {
            numericalWalls.push({c: [wall[i], wall[i+1], wall[i+2], wall[i+3]]})
        }
        if(wallInfo.loop) {
            numericalWalls.push({c: [wall[0], wall[1], wall[wall.length-2], wall[wall.length-1]]})
        }
    }
    canvas.scene.createEmbeddedDocuments("Wall", numericalWalls)
}

function applyRotation(array, angle) {
    let x = Math.cos(angle) * array[0] - Math.sin(angle) * array[1]
    let y = Math.sin(angle) * array[0] + Math.cos(angle) * array[1]
    return [Math.round(x), Math.round(y)]
}

function drawPortals(portals) {
    const regex = /([0-9]+)[^(]? /g
    let numericalPortals = []
    for(let portalInfo of portals) {
        let portal = convertVectorIntoArray(portalInfo.position, regex);
        let scale = convertVectorIntoArray(portalInfo.scale, regex, false)
        let rotation = [canvas.scene.dimensions.size, 0]
        rotation = applyRotation(rotation, portalInfo.rotation)
        rotation = [rotation[0] * scale[0], rotation[1] * scale[1]]
        numericalPortals.push({c: [portal[0]-rotation[0]/2, portal[1]-rotation[1]/2, portal[0] + rotation[0]/2, portal[1] + rotation[1]/2], door: 1})
    }
    canvas.scene.createEmbeddedDocuments("Wall", numericalPortals)
}

function drawLights(lights) {
    const regex = /([0-9]+)[^(]? /g
    let numericalLights = []
    for(let lightInfo of lights) {
        let light = convertVectorIntoArray(lightInfo.position, regex)
        numericalLights.push({c: light})

    }
    canvas.scene.createEmbeddedDocuments("Light", numericalLights)
}

function drawData(json) {
    const walls = json["world"]["levels"]["0"]["walls"]
    const portals = json["world"]["levels"]["0"]["portals"]
    const lights = json["world"]["levels"]["0"]["lights"]
    // drawWalls(walls)
    // drawPortals(portals)
    drawLights(lights)
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