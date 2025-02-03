const canvas = document.getElementById("mazeCanvas");
const ctx = canvas.getContext("2d");

// Fonte arcade para os textos
ctx.font = "14px 'Press Start 2P'";
ctx.textAlign = "center";
ctx.textBaseline = "middle";

const cols = 10, rows = 10; // Grid 10x10
const squareSize = 80; // Tamanho do quadrado
const grid = [];
const openSet = [], closedSet = [];
let startNode, endNode, path = [];
let running = false;
let speed = 100; // Velocidade (ms)
let steps = 0; // Contador de passos
let selectingStart = false, selectingEnd = false;
const marioImg = new Image();
marioImg.src = "Mario.png";

// Flag para exibir valores
let showValues = false;

class Node {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.value = Math.floor(Math.random() * 5) + 1;
        this.g = 0;
        this.h = 0;
        this.f = 0;
        this.neighbors = [];
        this.previous = null;
        this.wall = false;
    }

    addNeighbors(grid) {
        if (this.x < cols - 1) this.neighbors.push(grid[this.x + 1][this.y]);
        if (this.x > 0) this.neighbors.push(grid[this.x - 1][this.y]);
        if (this.y < rows - 1) this.neighbors.push(grid[this.x][this.y + 1]);
        if (this.y > 0) this.neighbors.push(grid[this.x][this.y - 1]);
    }
}

function heuristic(a, b) {
    if (!a || !b) return Infinity;
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function setup() {
    canvas.width = cols * squareSize;
    canvas.height = rows * squareSize;

    for (let i = 0; i < cols; i++) {
        grid[i] = [];
        for (let j = 0; j < rows; j++) {
            grid[i][j] = new Node(i, j);
        }
    }

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            grid[i][j].addNeighbors(grid);
        }
    }

    startNode = null;
    endNode = null;
    openSet.length = 0;
    closedSet.length = 0;
    path.length = 0;
    steps = 0;
    showValues = false;
    draw();
}

canvas.addEventListener("click", (event) => {
    let rect = canvas.getBoundingClientRect();
    let x = Math.floor((event.clientX - rect.left) / squareSize);
    let y = Math.floor((event.clientY - rect.top) / squareSize);

    if (x >= 0 && x < cols && y >= 0 && y < rows) {
        if (selectingStart) {
            startNode = grid[x][y];
            startNode.wall = false;
            selectingStart = false;
        } else if (selectingEnd) {
            endNode = grid[x][y];
            endNode.wall = false;
            selectingEnd = false;
        } else {
            grid[x][y].wall = !grid[x][y].wall;
        }

        if (startNode && endNode) {
            showValues = true;
        }

        draw();
    }
});

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            let node = grid[i][j];
            if (!node) continue;

            ctx.fillStyle = node.wall ? "#1a1a1a" : "#f0f0f0";
            if (node === startNode) ctx.fillStyle = "#ffcc00";
            if (node === endNode) ctx.fillStyle = "#00ccff";

            ctx.fillRect(node.x * squareSize, node.y * squareSize, squareSize, squareSize);
            ctx.strokeStyle = "#333";
            ctx.strokeRect(node.x * squareSize, node.y * squareSize, squareSize, squareSize);

            if (showValues) {
                ctx.fillStyle = "black";
                ctx.font = "12px 'Press Start 2P'";
                ctx.fillText(
                    Math.round(node.f),
                    node.x * squareSize + squareSize / 2,
                    node.y * squareSize + squareSize / 2
                );
                ctx.fillText(
                    Math.round(node.g),
                    node.x * squareSize + 15,
                    node.y * squareSize + squareSize - 25
                );
                ctx.fillText(
                    Math.round(node.h),
                    node.x * squareSize + squareSize - 23,
                    node.y * squareSize + squareSize - 25
                );
            }
        }
    }

    for (let node of closedSet) {
        ctx.fillStyle = "#ff4d4d";
        ctx.globalAlpha = 0.6;
        ctx.fillRect(node.x * squareSize, node.y * squareSize, squareSize, squareSize);
        ctx.globalAlpha = 1.0;
    }

    for (let node of openSet) {
        ctx.fillStyle = "#4dff4d";
        ctx.fillRect(node.x * squareSize, node.y * squareSize, squareSize, squareSize);
    }

    for (let node of path) {
        ctx.fillStyle = "#4d4dff";
        ctx.fillRect(node.x * squareSize, node.y * squareSize, squareSize, squareSize);
    }

    if (startNode) {
        ctx.drawImage(marioImg, startNode.x * squareSize + 5, startNode.y * squareSize + 5, squareSize - 10, squareSize - 10);
    }

    document.getElementById("stepCounter").innerText = `Passos: ${steps}`;
}

function generateRandomObstacles() {
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            if (Math.random() < 0.3 && grid[i][j] !== startNode && grid[i][j] !== endNode) {
                grid[i][j].wall = true;
            } else {
                grid[i][j].wall = false;
            }
        }
    }
    draw();
}

function aStar() {
    if (!running || !startNode || !endNode) return;

    if (openSet.length > 0) {
        steps++;
        let lowestIndex = 0;
        for (let i = 1; i < openSet.length; i++) {
            if (openSet[i].f < openSet[lowestIndex].f) lowestIndex = i;
        }

        let current = openSet.splice(lowestIndex, 1)[0];
        closedSet.push(current);

        if (current === endNode) {
            path = [];
            let temp = current;
            while (temp.previous) {
                path.push(temp);
                temp = temp.previous;
            }
            path.push(startNode);
            path.reverse();
            draw();
            running = false;

            animateMarioPath(); // Adicionar a animação do Mario
            return;
        }

        for (let neighbor of current.neighbors) {
            if (!closedSet.includes(neighbor) && !neighbor.wall) {
                let tempG = current.g + 1;

                if (!openSet.includes(neighbor) || tempG < neighbor.g) {
                    neighbor.g = tempG;
                    neighbor.h = heuristic(neighbor, endNode);
                    neighbor.f = neighbor.g + neighbor.h;
                    neighbor.previous = current;

                    if (!openSet.includes(neighbor)) {
                        openSet.push(neighbor);
                    }
                }
            }
        }
    } else {
        running = false;
        return;
    }
    draw();
    setTimeout(aStar, speed);
}

function animateMarioPath() {
    if (path.length === 0) return;

    let i = 0;
    function moveMario() {
        if (i < path.length) {
            startNode = path[i]; // Atualizar a posição do Mario
            draw();
            i++;
            setTimeout(moveMario, speed);
        }
    }

    moveMario();
}

document.getElementById("startButton").addEventListener("click", () => {
    if (!startNode || !endNode) {
        alert("Por favor, selecione os pontos de início e fim antes de iniciar o algoritmo!");
        return;
    }

    running = true;
    openSet.length = 0;
    closedSet.length = 0;
    path.length = 0;
    steps = 0;
    openSet.push(startNode);
    aStar();
});

document.getElementById("resetButton").addEventListener("click", setup);
document.getElementById("selectStart").addEventListener("click", () => selectingStart = true);
document.getElementById("selectEnd").addEventListener("click", () => selectingEnd = true);
document.getElementById("generateObstaclesButton").addEventListener("click", generateRandomObstacles);


setup();
