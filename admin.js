// Firebase configuration (ضع معلومات مشروعك هنا)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_ID",
  appId: "YOUR_APP_ID"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

// Sidebar functions
function showDashboard() {
  document.getElementById('main-content').innerHTML = `<h2>Dashboard</h2><p>Number of Tours, Images, Texts, Plugins, AI Suggestions...</p>`;
}

function showTours() {
  document.getElementById('main-content').innerHTML = `
    <h2>Tours</h2>
    <button onclick="addTour()">Add New Tour</button>
    <button onclick="generateTourAI()">Generate AI Description</button>
    <div id="tours-list"></div>`;
  loadTours();
}

function showImages() {
  document.getElementById('main-content').innerHTML = `
    <h2>Images</h2>
    <input type="file" id="imageUpload" multiple>
    <button onclick="uploadImages()">Upload Images</button>
    <div id="images-list"></div>`;
  loadImages();
}

function showTexts() {
  document.getElementById('main-content').innerHTML = `<h2>Texts</h2><div id="texts-list"></div>`;
  loadTexts();
}

function showTemplates() {
  document.getElementById('main-content').innerHTML = `<h2>Templates</h2><p>Select and preview templates live.</p>`;
}

function showPlugins() {
  document.getElementById('main-content').innerHTML = `<h2>Plugins</h2><p>Activate or deactivate site features.</p>`;
}

function showSocial() {
  document.getElementById('main-content').innerHTML = `<h2>Social Media</h2><p>Connect accounts, schedule posts, AI suggestions.</p>`;
}

// -------- Tours CRUD --------
async function loadTours() {
  const toursList = document.getElementById("tours-list");
  toursList.innerHTML = "";
  const snapshot = await db.collection("tours").get();
  snapshot.forEach(doc => {
    const data = doc.data();
    toursList.innerHTML += `
      <div>
        <h3>${data.name}</h3>
        <p>${data.description}</p>
        <button onclick="editTour('${doc.id}')">Edit</button>
        <button onclick="deleteTour('${doc.id}')">Delete</button>
      </div>
    `;
  });
}

async function addTour() {
  const name = prompt("Enter tour name:");
  const description = prompt("Enter description:");
  await db.collection("tours").add({ name, description });
  loadTours();
}

async function editTour(id) {
  const docRef = db.collection("tours").doc(id);
  const docSnap = await docRef.get();
  const name = prompt("Edit tour name:", docSnap.data().name);
  const description = prompt("Edit description:", docSnap.data().description);
  await docRef.update({ name, description });
  loadTours();
}

async function deleteTour(id) {
  if(confirm("Are you sure you want to delete this tour?")) {
    await db.collection("tours").doc(id).delete();
    loadTours();
  }
}

// -------- Images CRUD --------
async function uploadImages() {
  const files = document.getElementById("imageUpload").files;
  for (let file of files) {
    const storageRef = storage.ref('images/' + file.name);
    await storageRef.put(file);
    const url = await storageRef.getDownloadURL();
    await db.collection("images").add({ name: file.name, url });
  }
  loadImages();
}

async function loadImages() {
  const imagesList = document.getElementById("images-list");
  imagesList.innerHTML = "";
  const snapshot = await db.collection("images").get();
  snapshot.forEach(doc => {
    const data = doc.data();
    imagesList.innerHTML += `
      <div>
        <img src="${data.url}" width="200">
        <button onclick="deleteImage('${doc.id}')">Delete</button>
      </div>`;
  });
}

async function deleteImage(id) {
  if(confirm("Delete this image?")) {
    const docRef = db.collection("images").doc(id);
    const docSnap = await docRef.get();
    await storage.ref('images/' + docSnap.data().name).delete();
    await docRef.delete();
    loadImages();
  }
}

// -------- Texts CRUD --------
async function loadTexts() {
  const textsList = document.getElementById("texts-list");
  textsList.innerHTML = "";
  const snapshot = await db.collection("texts").get();
  snapshot.forEach(doc => {
    const data = doc.data();
    textsList.innerHTML += `
      <div>
        <h3>${data.title}</h3>
        <p>${data.content}</p>
        <button onclick="editText('${doc.id}')">Edit</button>
        <button onclick="deleteText('${doc.id}')">Delete</button>
      </div>`;
  });
}

async function editText(id) {
  const docRef = db.collection("texts").doc(id);
  const docSnap = await docRef.get();
  const title = prompt("Edit text title:", docSnap.data().title);
  const content = prompt("Edit text content:", docSnap.data().content);
  await docRef.update({ title, content });
  loadTexts();
}

async function deleteText(id) {
  if(confirm("Delete this text?")) {
    await db.collection("texts").doc(id).delete();
    loadTexts();
  }
}

// -------- AI for Tours --------
async function generateTourAI() {
  const tourName = prompt("Enter tour name:");
  const promptText = `Write a professional, engaging description for a tourist tour called "${tourName}" in English and French.`;
  
  const response = await fetch("https://api.openai.com/v1/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer YOUR_OPENAI_API_KEY"
    },
    body: JSON.stringify({
      model: "text-davinci-003",
      prompt: promptText,
      max_tokens: 150
    })
  });

  const data = await response.json();
  const description = data.choices[0].text.trim();
  alert("AI Description Generated:\n" + description);
}
