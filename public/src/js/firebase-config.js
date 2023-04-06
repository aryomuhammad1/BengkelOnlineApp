// FIREBASE INIT
// console.log('INI DARI DB.JS')
import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";
import { getMessaging } from "firebase/messaging";

export const firebaseApp = initializeApp({
  apiKey: "AIzaSyA51anpLkYPlxlhJj7HR-vG1JVOkAJZSHA",
  authDomain: "aplikasi-bengkel-online.firebaseapp.com",
  projectId: "aplikasi-bengkel-online",
  storageBucket: "aplikasi-bengkel-online.appspot.com",
  messagingSenderId: "721522428619",
  appId: "1:721522428619:web:5360c606488d277182694e",
  measurementId: "G-01H5MHX8H2",
});

console.log("firebaseApp config : ", firebaseApp);

export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);
export const functions = getFunctions(firebaseApp);
export const messaging = getMessaging(firebaseApp);

// export let errorPersistance;
enableIndexedDbPersistence(db, { forceOwnership: true }).catch((err) => {
  if (err.code == "failed-precondition") {
    // Multiple tabs open, persistence can only be enabled
    // in one tab at a a time.
    // errorPersistance = "error";
    console.log("failed-precondition");
  } else if (err.code == "unimplemented") {
    // The current browser does not support all of the
    // features required to enable persistence
    // errorPersistance = "error";
    console.log("unimplemented");
  }
});

export const checkOnlineStatus = async () => {
  try {
    const online = await fetch("./images/star.png");
    return online.status >= 200 && online.status < 300; // either true or false
  } catch (err) {
    return false; // definitely offline
  }
};
