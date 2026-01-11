import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, updateDoc, Timestamp, getDoc, collection, getDocs, increment, query, orderBy, getAggregateFromServer, sum } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC2jINpoUzHegD1ONfOeNADOK4cOKACkvI",
  authDomain: "luckily-75415.firebaseapp.com",
  projectId: "luckily-75415",
  storageBucket: "luckily-75415.firebasestorage.app",
  messagingSenderId: "837978034024",
  appId: "1:837978034024:web:e1f6de70e28d1d3567d0dd",
  measurementId: "G-E7STTL62LJ",
};

import { generateEntry, message, sumAttempts } from "./main";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const check = async () => {
  try {
    const sumSnapshot = await getAggregateFromServer(collection(db, "attempt"), {
      count: sum("count"),
    });
    sumAttempts.count = sumSnapshot.data().count || 1;
  } catch (error) {
    console.error(error);
    sumAttempts.count = 1;
  }
  try {
    const done = await getDoc(doc(db, "password", "password"));
    return done.data();
  } catch (error) {
    if (error.code == "permission-denied") return null;
    return "other";
  }
};

const map = new Map();

const attempts = document.getElementById("attempts");

export const loadNext = () => {
  const nextEntries = [];
  const iterator = map.entries();

  for (let i = 0; i < 20; i++) {
    const next = iterator.next();
    if (next.done) break;

    const [name, count] = next.value;
    nextEntries.push({ name, count });
    map.delete(name);
  }

  const entries = nextEntries.map(({ name, count }) => generateEntry(name, count)).join("");

  attempts.innerHTML += entries;
};

export const progress = async () => {
  const attemptsRef = collection(db, "attempt");

  const q = query(
    attemptsRef,
    {
      select: ["count", "name"],
    },
    orderBy("count", "desc")
  );
  const snapshot = await getDocs(q);
  snapshot.forEach((doc) => {
    const data = doc.data();
    map.set(data.name, data.count);
  });
};

export const write = async (name, id) => {
  let count = 1;
  const time = Timestamp.fromDate(new Date());
  const payload = {
    id,
    name,
    time,
  };
  try {
    await setDoc(doc(db, "attempt", name), { ...payload, count: increment(1) }, { merge: true });
    const snapshot = await getDoc(doc(db, "attempt", name));
    count = snapshot.data().count;
  } catch (error) {
    if (error.code == "permission-denied") return message("chill out");
    return "other";
  }
  try {
    await updateDoc(doc(db, "password", "password"), payload);
  } catch (error) {
    if (error.code == "permission-denied") {
      message("unlucky");
      return count;
    }
    console.log(error);
    return message("other");
  }
  return message("good job!");
};
