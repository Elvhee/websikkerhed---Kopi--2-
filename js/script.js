const scenarios = {
  start: {
    text: "Fremmed netværk fundet",
    choices: [
      { text: "Tilslut", next: "malware", style: "danger", correct: false },
      { text: "Ignorer", next: "popupbesked", style: "success", correct: true }
    ]
  },
  malware: {
    text: "Malware opsporet",
    choices: [
      { text: "Kør antivirus-program", next: "antivirus", style: "success", correct: true },
      { text: "Ignorer", next: "popupdanger", style: "danger", correct: false }
    ]
  },
  popupdanger: {
    text: "Hvad sker der lige for det link du sender rundt?",
    choices: [{ text: "Start forfra", next: "wifi" }]
  },
  popupbesked: {
    text: "Hey! Det så vildt - jeg fandt det her hack til gratis robux!",
    choices: [
      { text: "Undersøg", next: "undersøgLæs", style: "danger", correct: false },
      { text: "Ignorer", next: "ignorer", style: "success", correct: true }
    ]
  },
  undersøgLæs: {
    text: "Emma har sendt et link til en hjemmeside med gratis robux.",
    choices: [
      { text: "Du klikker ind på linket", next: "phishingLink", style: "danger", correct: false },
      { text: "Det virker sus, så du spørger ind til det", next: "emailReply", style: "success", correct: true },
      { text: "Du ignorerer beskeden", next: "ignorer", style: "success", correct: true }
    ]
  },
  phishingLink: {
    text: "Du lander på en side, som kræver at du skal logge ind med din facebook og dele personoplysninger.",
    image: "images/phishing.JPG",
    choices: [
      { text: "Du logger ind og giver dine personoplysninger", next: "compromised", style: "danger", correct: false },
      { text: "Det virker ikke helt rigtigt, så du lukker siden", next: "delayed", style: "success", correct: true }
    ]
  },
  emailReply: {
    text: "Jeg har aldrig sendt noget link?!?",
    choices: [
      { text: "Gå ind på linket alligevel", next: "phishingLink", style: "danger", correct: false },
      { text: "Noget er sus. Du klikker ikke på noget og sletter beskeden", next: "delayed", style: "success", correct: true }
    ]
  },
  ignorer: {
    text: "Hey - jeg fandt det her link til gratis robux! Det virker virkelig godt.",
    choices: [
      { text: "Spørg ind til det", next: "emailReply", style: "success", correct: true },
      { text: "Ignorer", next: "goodChoice", style: "success", correct: true }
    ]
  },
  compromised: {
    text: "Åh nej! Dine sociale medier er blevet hacket! Skynd dig at skift dine koder!",
    choices: []
  },
  goodChoice: {
    text: "Godt gået! Du er en sand mester i cybersikkerhed og undgik at blive hacket. Hold stilen!",
    choices: []
  },
  delayed: {
    text: "Puha! Din tvivl kom dig gode og du holdte hackeren ude.",
    choices: []
  },
  antivirus: {
    text: "Puha! Det var tæt på! Men du kørte antivirus-programmet, og fik renset din pc. Husk kun at bruge netværk du kender.",
    choices: []
  },
  wifi: {
    text: "Fremmed netværk opsporet",
    choices: [
      { text: "Afvis", next: "start", style: "success", correct: true },
      { text: "Tilslut igen", next: "malware", style: "danger", correct: false }
    ]
  }
};
let currentProgress = 0;
let wrongChoices = 0;
let isPopupActive = false;
let popupTimeout = null;
let totalChoices = Object.values(scenarios).reduce((sum, s) => sum + (s.choices?.length || 0), 0);

function updateProgress() {
  const percent = Math.min((currentProgress / totalChoices) * 100, 100);
  const progressFill = document.querySelector(".fill");
  progressFill.style.width = `${percent}%`;
  if (percent < 25) progressFill.style.backgroundColor = "#32CD32";
  else if (percent < 50) progressFill.style.backgroundColor = "#FFEB3B";
  else if (percent < 75) progressFill.style.backgroundColor = "#FF9800";
  else progressFill.style.backgroundColor = "#FF1100";
}

function restartGame() {
  clearTimeout(popupTimeout);
  currentProgress = 0;
  wrongChoices = 0;
  isPopupActive = false;
  updateProgress();
  localStorage.removeItem("currentScenario");
  document.getElementById("restartButton").style.display = "none";
  loadScenario("start");
}

function showPopup() {
  const scenario = scenarios["wifi"];  // Vi henter scenariet "wifi"
  showSpecificPopup("wifi", scenario); // Viser det som en popup
}

function showSpecificPopup(id, scenario) {
  const popup = document.getElementById(id);
  const overlay = document.getElementById("popupOverlay"); // Overlay element

  if (!popup) return;

  const messageDiv = popup.querySelector(".message");
  const choicesDiv = popup.querySelector(".choices");
  if (!messageDiv || !choicesDiv) return;

  messageDiv.innerText = scenario.text || "";
  choicesDiv.innerHTML = "";

  scenario.choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.innerText = choice.text;
    btn.classList.add(choice.style || "default");
    btn.onclick = () => {
      popup.classList.remove("show");
      document.body.classList.remove("popup-active");

      if (overlay) overlay.classList.remove("show"); // Skjul overlay

      currentProgress++;
      if (!choice.correct) wrongChoices++;
      updateProgress();
      setTimeout(() => loadScenario(choice.next), 500);
    };
    choicesDiv.appendChild(btn);
  });

  document.querySelectorAll(".popup").forEach(p => p.classList.remove("show"));
  popup.classList.add("show");
  document.body.classList.add("popup-active");

  if (overlay) overlay.classList.add("show"); // Vis overlay
}

function loadScenario(key) {
  const scenario = scenarios[key];
  if (!scenario) {
    console.error(`Scenario "${key}" findes ikke.`);
    return;
  }

  localStorage.setItem("currentScenario", key);

  const scenarioBox = document.getElementById("scenario");
  const mediaContainer = document.getElementById("media-container");
  const choicesDiv = document.getElementById("choices");

  window.scrollTo(0, 0);
  scenarioBox.innerText = scenario.text || "Intet scenarie-tekst angivet.";
  mediaContainer.innerHTML = "";
  choicesDiv.innerHTML = "";

  switch (key) {
    case "popupbesked":
    case "popupdanger":
    case "wifi":
    case "malwarePopup":
    case "ignorer":
    case "emailReply":
      showSpecificPopup(key, scenario);
      return;
  }

  if (scenario.image) {
    const img = document.createElement("img");
    img.src = scenario.image;
    img.alt = "Scenario billede";
    img.style.maxWidth = "100%";
    mediaContainer.appendChild(img);
  }

  if (Array.isArray(scenario.choices) && scenario.choices.length > 0) {
    scenario.choices.forEach(choice => {
      const btn = document.createElement("button");
      btn.innerText = choice.text;
      btn.classList.add(choice.style || "default");
      btn.onclick = () => {
        if (!choice.correct) wrongChoices++;
        currentProgress++;
        updateProgress();
        setTimeout(() => loadScenario(choice.next), 1000);
      };
      choicesDiv.appendChild(btn);
    });
  } else {
    const endMessage = document.createElement("p");
    endMessage.innerText = `Historien er slut.\nRigtige svar: ${currentProgress - wrongChoices}\nForkerte svar: ${wrongChoices}`;
    choicesDiv.appendChild(endMessage);
    document.getElementById("restartButton").style.display = "block";
  }
}

window.onload = () => {
  updateProgress();
  const savedScenario = localStorage.getItem("currentScenario");
  if (savedScenario && scenarios[savedScenario]) {
    loadScenario(savedScenario);
  } else {
    popupTimeout = setTimeout(() => {
      showPopup(); // WiFi popup vises efter 10 sekunder
    }, 10000);
  }
};
