import { v4 as uuidv4 } from "uuid";
import { check, progress, write, loadNext } from "./firebase";
import { handleTheme } from "./theme";

const input = document.getElementById("name");
const yours = document.getElementById("yours");
const messages = document.getElementById("messages");

export const sumAttempts = { count: 0 };

export const message = (text) => {
  const popup = document.createElement("div");
  if (text == "unlucky") popup.style.color = "#91C788";
  popup.className = "message";
  popup.textContent = text;
  messages.appendChild(popup);
  popup.addEventListener("click", () => popup.remove());

  setTimeout(() => {
    popup.classList.add("fade-out");
    popup.addEventListener("transitionend", () => popup.remove());
  }, 1000);
};

export const generateEntry = (name, count) => {
  const percent = (count / sumAttempts.count) * 100;
  return `
    <div id="${name}" class="entry rounded">
      <span class="name" style="width: ${percent}%; background-color: color-mix(in srgb, #7e80ff  ${percent + 50}%, #EEF1FF)">${name}</span>
      <span class="count">${count}</span>
    </div>
  `;
};

let cooldown = false;
const past = {};

document.getElementById("button").addEventListener("click", async () => {
  const name = input.value;
  if (!name.length) return message("too short");
  else if (name.length > 15) return message("too long");
  if (name == "light" || name == "dark") handleTheme(name);

  if (cooldown) return message("slow down!");
  cooldown = true;
  setTimeout(() => {
    cooldown = false;
  }, 1200);

  const entry = document.getElementById(name);
  const count = await write(name, uuidv4());
  if (!count) return;

  sumAttempts.count += 1;
  if (name in past) {
    entry.querySelector(".count").innerText = past[name] += 1;
    const item = entry.querySelector(".name");
    const percent = (past[name] / sumAttempts.count) * 100;
    item.style.width = `${percent}%`;
    item.style.backgroundColor = `color-mix(in srgb, #7e80ff  ${percent + 50}%, #EEF1FF)`;
  } else {
    if (entry) {
      past[name] = parseInt(entry.querySelector(".count").innerText) + 1;
      entry.remove();
    } else {
      past[name] = count;
    }
    yours.innerHTML += generateEntry(name, past[name]);
  }
});

window.addEventListener("scroll", () => {
  const dy = window.scrollY || document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight;
  const wh = window.innerHeight;

  if (dy + wh >= height) loadNext();
});

const toggleModal = () => {
  document.getElementById("modal").classList.toggle("hidden");
};

document.getElementById("info").addEventListener("click", toggleModal);
document.getElementById("modal").addEventListener("click", (event) => {
  if (event.target.id != "interior") toggleModal();
});

(async () => {
  const result = await check();
  if (result) {
    document.getElementById("success").innerText = `good job! "${result.name}" - ${result.time.toDate().toLocaleString()}`;
  }
  const p = await progress();
  loadNext();
})();
