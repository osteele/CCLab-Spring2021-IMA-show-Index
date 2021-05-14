const headerHeight = 250;
const colWidth = 350;
const minRowHeight = 80;
const maxRowHeight = 130;
let rowHeight;
let projects = [];

let data;

function preload() {
  data = loadTable("projects.csv", "header");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  projects = Array.from(Object.values(data.rows).map((r) => r.obj)).map((o) =>
    renameKeys(o, lowerSnakeCase)
  );

  projects.forEach((p) => {
    p.name = p.name.trim();
    const img_url = `assets/images/${p.name}.jpg`;
    p.image = loadImage(img_url);
  });
  shuffle(projects, true);
}

function draw() {
  background("white");

  textAlign(CENTER);
  fill("aliceblue");
  textSize(40);
  text("Creative Coding Lab | Section 1", width / 2, 160);

  const selectedProject = findProjectUnderMouse();
  if (selectedProject) {
    drawHeaderProject(selectedProject, true);
  } else {
    push();
    const tx = -frameCount;
    const pw = width * 2 / 3;
    translate(tx % (3 * pw), 0);
    for (let i = 0; i < 10; i++) {
      drawHeaderProject(projects[i]);
      translate(pw, 0);
    }
    pop();
    fill(255, 150);
    noStroke();
    rect(0, 0, width, headerHeight)
  }

  computeLayout();
  projects.forEach((p) => drawProject(p, projectIsUnderMouse(p)));
}

function drawHeaderProject({ image: img, description, instructions }, includeInstructions) {
  const s = min(window.width / 3 / img.width, 250 / img.height);
  const w = img.width * s;
  const c1 = w + 10;
  const c2 = (2 * windowWidth) / 3;

  image(img, 0, 0, w, img.height * s);

  textAlign(LEFT);
  fill("black");
  textSize(12);

  textStyle(BOLD);
  // text("Description", c1, 20, windowWidth / 3 - 10);
  includeInstructions && instructions && text("Instructions", c2, 20, windowWidth / 3 - 10);
  textStyle(ITALIC);
  text(description, c1, 15, c2 - c1 - 10);
  textStyle(NORMAL);
  includeInstructions && text(instructions, c2, 40, windowWidth / 3 - 10);
}

function computeLayout() {
  rowHeight = maxRowHeight;
  projects.forEach((p) => (p.y = Infinity));
  const getBottom = () => Math.max(...projects.map((p) => p.y)) + rowHeight;
  for (; getBottom() > height && rowHeight > minRowHeight; rowHeight -= 10) {
    let cols = max(1, floor(width / colWidth));
    let tx = (width - cols * colWidth) / 2;
    projects.forEach((p, i) => {
      let col = i % cols;
      let row = floor(i / cols);
      let x = tx + colWidth * col;
      let y = headerHeight + rowHeight * row;
      projects[i] = { ...p, x, y, row, col };
    });
  }
  if (getBottom() > height) {
    resizeCanvas(width, getBottom());
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function drawProject({ name, authors, x, y }, highlight) {
  push();
  textAlign(CENTER);
  translate(x, y);

  if (highlight) {
    fill(200, 100);
    noStroke();
    rect(0, 0, colWidth, rowHeight, 10);

    fill("red");
    textSize(18);
    text("Click to play", 0, 65, colWidth - 20);
  }

  fill("black");
  textFont("Roboto");
  textSize(18);
  textStyle(BOLD);
  text(name, 0, 10, colWidth - 20);

  authors = withoutOxford(authors.split(/\s*&\s*/), " & ");
  textSize(13);
  textStyle(NORMAL);
  text(authors, 0, 40, colWidth - 20);

  pop();
}

function mousePressed() {
  let project = findProjectUnderMouse();
  if (project) {
    window.open(project.url, "project");
  }
}

function mouseMoved() {
  let project = findProjectUnderMouse();
  if (project) {
    cursor("HAND");
    // console.info('HAND')
  } else {
    cursor("DEFAULT");
    // console.info('default');
  }
}

const findProjectUnderMouse = () => projects.find(projectIsUnderMouse);
const projectIsUnderMouse = ({ x, y }) =>
  x <= mouseX && mouseX < x + colWidth && y <= mouseY && mouseY < y + rowHeight;

const lowerSnakeCase = (s) => s.replace(/ /g, "_").toLowerCase();

const renameKeys = (obj, keyTransformer) =>
  Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [keyTransformer(k), v])
  );

const withoutOxford = (ar, s) =>
  ar.length <= 2
    ? ar.join(s)
    : ar.slice(0, ar.length - 1).join(", ") + s + ar[ar.length - 1];
