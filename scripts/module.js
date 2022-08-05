const regex = /(-?[0-9]+\.?[0-9]*)[^(]? /g

function convertVectorIntoArray(vector, regex, scale = true) {
    vector = [...vector.matchAll(regex)]
    let array = []
    for (let number of vector) {
        number = parseFloat(number[1])
        if (scale) {
            number = (number / 256) * canvas.scene.dimensions.size
        }
        array.push(number)
    }
    return array
}

function drawWalls(walls) {
    let numericalWalls = []
    for (let wallInfo of walls) {
        let wall = convertVectorIntoArray(wallInfo.points, regex)
        for (let i = 0; i < wall.length - 2; i += 2) {
            numericalWalls.push({c: [wall[i], wall[i + 1], wall[i + 2], wall[i + 3]]})
        }
        if (wallInfo.loop) {
            numericalWalls.push({c: [wall[0], wall[1], wall[wall.length - 2], wall[wall.length - 1]]})
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
    let numericalPortals = []
    for (let portalInfo of portals) {
        let portal = convertVectorIntoArray(portalInfo.position, regex);
        let scale = convertVectorIntoArray(portalInfo.scale, regex, false)
        let rotation = [canvas.scene.dimensions.size, 0]
        rotation = applyRotation(rotation, portalInfo.rotation)
        rotation = [rotation[0] * scale[0], rotation[1] * scale[1]]
        numericalPortals.push({
            c: [portal[0] - rotation[0] / 2, portal[1] - rotation[1] / 2, portal[0] + rotation[0] / 2, portal[1] + rotation[1] / 2],
            door: 1
        })
    }
    canvas.scene.createEmbeddedDocuments("Wall", numericalPortals)
}

function drawLights(lights, nightTime) {
    let numericalLights = []
    let lightConfig;
    for (let lightInfo of lights) {
        let light = convertVectorIntoArray(lightInfo.position, regex)
        let dimLight = lightInfo.range * canvas.scene.dimensions.distance
        let brightLight = dimLight * (lightInfo.intensity / 3)
        let colorLight = "#" + lightInfo.color.substring(2, lightInfo.color.length)
        if (nightTime) {
            lightConfig = {
                dim: dimLight,
                bright: brightLight,
                color: colorLight,
                alpha: 0.25,
                contrast: 0,
                gradual: true,
                luminosity: 0.5,
                saturation: 0.25,
                shadows: 0.15,
            }
        } else {
            lightConfig = {
                dim: dimLight,
                bright: brightLight,
                color: colorLight,
                alpha: 0,
                contrast: 0,
                gradual: true,
                luminosity: 0,
                saturation: 0,
                shadows: 0,
            }
        }
        numericalLights.push({
            x: light[0], y: light[1],
            config: lightConfig
        })

    }
    canvas.scene.createEmbeddedDocuments("AmbientLight", numericalLights)
    canvas.scene.update({darkness: +nightTime})
}

function drawPaths(paths) {
    let numericalPaths = []
    for (let pathInfo of paths) {
        if (pathInfo.block_light) {
            let pathPosition = convertVectorIntoArray(pathInfo.position, regex)
            let initialCoordinates = [...pathPosition]
            let path = convertVectorIntoArray(pathInfo.edit_points, regex)
            for (let i = 0; i < path.length - 1; i += 2) {
                numericalPaths.push({c: [initialCoordinates[0] + path[i], initialCoordinates[1] + path[i + 1], pathPosition[0], pathPosition[1]]})
                pathPosition[0] = initialCoordinates[0] + path[i]
                pathPosition[1] = initialCoordinates[1] + path[i + 1]
            }
            if (pathInfo.loop) {
                numericalPaths.push({c: [initialCoordinates[0], initialCoordinates[1], pathPosition[0], pathPosition[1]]})
            }
        }
    }
    canvas.scene.createEmbeddedDocuments("Wall", numericalPaths)
}

function drawData(json, nightTime = false) {
    const walls = json["world"]["levels"]["0"]["walls"]
    const portals = json["world"]["levels"]["0"]["portals"]
    const lights = json["world"]["levels"]["0"]["lights"]
    const paths = json["world"]["levels"]["0"]["paths"]
    drawWalls(walls)
    drawPortals(portals)
    drawLights(lights, nightTime)
    drawPaths(paths)
}

async function drawScene() {
    await new Dialog({
        content: await renderTemplate("modules/foundryvtt-dungeondraft-integration/templates/dialogue.html",),
        buttons: {
            one: {
                label: "Dark Map", callback: () => {
                    const results = document.getElementById("dungeondraftFile").files[0]
                    results.text().then((text) => drawData(JSON.parse(text), false))
                }
            },
            two: {
                label: "Light Map", callback: () => {
                    const results = document.getElementById("dungeondraftFile").files[0]
                    results.text().then((text) => drawData(JSON.parse(text), true))
                }
            }
        }
    }).render(true)
}

Hooks.on("getSceneControlButtons", (controls) => {
    let wallTools = controls.find((x) => x["name"] === "walls").tools;
    wallTools.splice(wallTools.length - 2, 0, {
        icon: "fas fa-landmark",
        name: "dungeondraftButton",
        title: "Draw Dungeondraft Walls",
        onClick: async () => {
            await drawScene();
        }
    });

});