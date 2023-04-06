console.log("FROM AUTH");
import {
  auth,
  checkOnlineStatus,
  db,
  functions,
  messaging,
} from "./firebase-config";
import { getToken } from "firebase/messaging";
import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  getDoc,
  setDoc,
  doc,
  updateDoc,
  arrayUnion,
  query,
  where,
} from "firebase/firestore";
import {
  signInWithPhoneNumber,
  createUserWithEmailAndPassword,
  signOut,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  RecaptchaVerifier,
  getIdTokenResult,
  updateProfile,
  deleteUser,
} from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { getStorage, ref, uploadString } from "firebase/storage";
import { getPengendaraPosition } from "./main";
import { mainBengkelConfig, showMontirList } from "./main-bengkel";
import {
  signUpPengendaraSection,
  signUpBengkelSection,
  otpVerifySection,
  formSignUpPengendara,
  formSignUpBengkel,
  formOtpVerify,
  moveSection,
  mainBengkelSection,
  openingSection,
  mainPengendaraSection,
  formSignIn,
  signInSection,
  appState,
  outputSignup,
  btnRegisPhoto,
  regisPhotoSection,
  registerLocationSection,
  btnSelectLocation,
  mapRegisLocation,
  mainMontirSection,
  createLoadingBtn,
  showInputError,
  otpTimer,
  otpTimerText,
  removeInputError,
  removeLoadingBtn,
  showInstallBanner,
  deferredPrompt,
  otpPhoneNumberText,
  offlineFallbackPage,
  mapPengendara,
} from "./index";
import { map, getLocationPromise, loadMap } from "./mapbox-config";
import { mainMontirConfig } from "./main-montir";

export let currentUser;
const addRole = httpsCallable(functions, "addRole");
let formElement;
let uploadPics = {};
let downloadPics = [];
let arrayPics = [];
const storage = getStorage();
let userType;
let userObj;

// [REQUEST ACCESS REGIS TOKEN]

// async function registerServiceWorker() {
//   if ("serviceWorker" in navigator) {
//     try {
//       console.log("registerServiceWorker . . .");
//       await navigator.serviceWorker.register("./firebase-messaging-sw.js");
//       console.log("SW Registered !");
//       return;
//     } catch (err) {
//       return err;
//     }
//   }
// }

function requestPermission() {
  //   console.log("[requestingPermission]");
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      console.log("[SW activated ? ]", registration.active);
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Notification permission granted.");

          getToken(messaging, {
            vapidKey:
              "BHwDLzLNuwtYV-cPuEYItlTqjP3rRsNOzXydJtE0wVPVLLtKjupg70CEJzvamLTOUM6FnWOwLY71iNR1yNk3uBQ",
          }).then((currentToken) => {
            console.log("getToken : ", currentToken);
            const tokenObj = {
              notificationTokens: {
                token: currentToken,
                lastUpdate: serverTimestamp(),
              },
            };
            setDoc(doc(db, `userBengkel`, `${currentUser.uid}`), tokenObj, {
              merge: true,
            }).then(() => {
              console.log("Success saving notif token to firestore!");
            });
          });
        }
        if (permission !== "granted") {
          console.log("Notification permission rejected.");
        }
      });
    });
  }
}

// [ON AUTH STATE CHANGED]
let localCurrentUser;
checkOnlineStatus().then((status) => {
  if (status === false) {
    localCurrentUser = localStorage.getItem("localCurrentUser");
    if (localCurrentUser != null || localCurrentUser != undefined) {
      localCurrentUser = JSON.parse(localCurrentUser);
      console.log("[offline] localCurrentUser : ", localCurrentUser);

      currentUser = localCurrentUser;

      //   Cek user role
      if (currentUser.userRole == "bengkel") {
        moveSection(appState, mainBengkelSection);
      }
      if (currentUser.userRole == "pengendara") {
        moveSection(appState, mainPengendaraSection);
        offlineFallbackPage.classList.add("open");
        mapPengendara.style.display = "none";
      }
      if (currentUser.userRole == "montir") {
        moveSection(appState, mainMontirSection);
      }
    } else {
      moveSection(appState, openingSection);
    }
  }
});

onAuthStateChanged(auth, (user) => {
  console.log("onAuthStateChanged : ", user);
  if (!user) {
    // signOut(auth);
    moveSection(appState, openingSection);
    mainBengkelSection.classList.remove("active");
    mainPengendaraSection.classList.remove("active");
    localStorage.removeItem("localCurrentUser");
    return;
  }
  if (user) {
    // localStorage.clear();
    currentUser = user;
    user.getIdTokenResult(true).then((idTokenResult) => {
      //   if (!idTokenResult.claims.role) {
      //     signOut(auth).then(() => window.location.reload());
      //   }
      if (idTokenResult.claims.role === "bengkel") {
        // openingSection.classList.remove("active");
        const currentUserObj = JSON.stringify({
          ...currentUser,
          userRole: "bengkel",
        });
        console.log("currentUserObj", currentUserObj);
        localStorage.setItem("localCurrentUser", currentUserObj);
        mainBengkelConfig().then(() => {
          moveSection(appState, mainBengkelSection);
          showMontirList(mainBengkelSection);
          requestPermission();
        });
      }
      if (idTokenResult.claims.role === "pengendara") {
        // openingSection.classList.remove("active");
        const currentUserObj = JSON.stringify({
          ...currentUser,
          userRole: "pengendara",
        });
        console.log("currentUserObj", currentUserObj);
        localStorage.setItem("localCurrentUser", currentUserObj);
        moveSection(appState, mainPengendaraSection);
        console.log("===user pengendara===");
        getPengendaraPosition();
      }
      if (idTokenResult.claims.role === "montir") {
        const currentUserObj = JSON.stringify({
          ...currentUser,
          userRole: "montir",
        });
        console.log("currentUserObj", currentUserObj);
        localStorage.setItem("localCurrentUser", currentUserObj);
        mainMontirConfig();
      }
    });

    // showInstallBanner();
    // const addBtn = document.querySelector(".install-banner");
    // // Stash the event so it can be triggered later.
    // // Update UI to notify the user they can add to home screen
    // //   addBtn.style.display = "block";

    // addBtn.addEventListener("click", (e) => {
    //   // hide our user interface that shows our A2HS button
    //   // addBtn.style.display = "none";
    //   addBtn.remove();
    //   // Show the prompt
    //   deferredPrompt.prompt();
    //   // Wait for the user to respond to the prompt
    //   deferredPrompt.userChoice.then((choiceResult) => {
    //     if (choiceResult.outcome === "accepted") {
    //       console.log("User accepted the A2HS prompt");
    //     } else {
    //       console.log("User dismissed the A2HS prompt");
    //     }
    //   });
    // });
  }
});

// Cek If object is full
export const isObjFull = function (obj) {
  console.log("isobjfull");
  return Object.values(obj).every((value) => value !== null && value !== "");
};

// Cek If user is registered
export const validateUser = async function (phoneNumber) {
  console.log("validateUser");
  const userDoc = await getDoc(doc(db, `allUsers`, `${phoneNumber}`));
  if (userDoc.data()) {
    console.log("validateUser true");

    return true;
  }
  if (!userDoc.data()) {
    console.log("validateUser false");
    return false;
  }
};

export const getDate = function () {
  const date = new Date();

  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  //   let month = date.toLocaleString("id-ID", { month: "long" });

  return { day: day, month: month, year: year };
};

// [PHONE AUTHENTICATION]
auth.languageCode = "it";
export const recaptchaVerifierMaker = function (buttonId) {
  console.log("recaptchaVerifierMaker . . .");
  window.recaptchaVerifier = new RecaptchaVerifier(
    `${buttonId}`,
    {
      size: "invisible",
      callback: (response) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        onSignInSubmit();
      },
    },
    auth
  );
};

// SIGN UP FUNCTION
let setTimerText;
let resultTokenId;
const cekMontirPromises = [];

const submitOtpSignIn = function (e) {
  e.preventDefault();
  createLoadingBtn(formOtpVerify);
  let otpCode = `${formOtpVerify["otp-code"].value}`;
  console.log(otpCode);

  // Then sign the user in with confirmationResult.confirm(code).
  confirmationResult
    .confirm(otpCode)
    .then((result) => {
      formOtpVerify.reset();
      console.log(appState);
      console.log("user logged in! : ", result.user);
      const user = result.user;
      clearInterval(setTimerText);

      // Khusus untuk user montir
      user.getIdTokenResult(true).then((idTokenResult) => {
        console.log("getIdTokenResult satu");
        console.log("idTokenResult.claims.role : ", idTokenResult.claims.role);
        if (!idTokenResult.claims.role) {
          console.log("getIdTokenResult dua");

          addRole({
            uid: user.uid,
            userRole: "montir",
          }).then((result) => {
            console.log("addRole New Montir", result);

            const currentUserObj = JSON.stringify({
              ...currentUser,
              userRole: "montir",
            });
            console.log("currentUserObj", currentUserObj);
            localStorage.setItem("localCurrentUser", currentUserObj);
            mainMontirConfig();
          });
        }
      });
    })
    .catch((err) => {
      console.log("error kode otp : ", err.message);
      showInputError(formOtpVerify);
      removeLoadingBtn(formOtpVerify);
    });
};

// Ubah function jadi async function
// Buat validasi login, cek apakah ada data dengan nomor yang dimasukkan
// Kalau ada (pengendara, bengkel, atau montir), biarkan masuk
// Kalau tidak ada, showInputError, return.

// const validateUserSignIn = async function (phoneNumber) {
//   try {
//     //   Validasi Login
//     // 1. Cek form kosong
//     if (phoneNumber === "+62") {
//       return "false null";
//     }
//     //   2. Cek data phoneNumber pada collection bengkel

//     const bengkelSnapshot = await getDocs(collection(db, `userBengkel`));
//     console.log("bengkelSnapshot : ", bengkelSnapshot);

//     let isFounded;

//     bengkelSnapshot.docs.every(async function (bengkelDoc) {
//       if (bengkelDoc.data().phoneNumber == phoneNumber) {
//         isFounded = true;
//         return false;
//       }

//       //   Ini salah, harus looping montir collection lagi.
//       // Alternatif nya, setiap user signup, coba disimpen nomor user baru ke collection allUsers
//       // supaya cek signIn nya cukup ke satu collection aja, gaperlu ke semua collection.
//       const montirDoc = await getDoc(
//         doc(
//           db,
//           `userBengkel/${bengkelDoc.id}/userMontir/${currentUser.phoneNumber}`
//         )
//       );
//       montirData = montirDoc.data();
//       if (montirData != null) {
//         isFounded = true;
//         return false;
//       }

//       return true;
//     });

// const bengkelSnap = await getDocs(
//   query(
//     collection(db, `userBengkel`),
//     where("phoneNumber", "==", phoneNumber)
//   )
// );
// if (bengkelSnap.docs.length > 0) {
//   return true;
// }

//     const pengendaraSnap = await getDocs(
//       query(
//         collection(db, `userPengendara`),
//         where("phoneNumber", "==", phoneNumber)
//       )
//     );
//     if (pengendaraSnap.docs.length > 0) {
//       return true;
//     }
//   } catch (err) {
//     console.log("error validateUserSignIn", err.message);
//   }
// };

export const signingInUser = async function () {
  recaptchaVerifierMaker("btn-signin");
  const appVerifier = window.recaptchaVerifier;
  const phoneNumber = `+62${formSignIn["phone-number"].value}`;
  console.log(phoneNumber);

  const isUserRegistered = await validateUser(phoneNumber);

  if (!isUserRegistered) {
    showInputError(formSignIn, "Akun belum terdaftar");
    removeLoadingBtn(formSignIn);
    return;
  }

  const confirmationResult = await signInWithPhoneNumber(
    auth,
    phoneNumber,
    appVerifier
  );
  window.confirmationResult = confirmationResult;

  moveSection(signInSection, otpVerifySection);

  console.log("UI updated...");
  otpPhoneNumberText.textContent = phoneNumber;
  removeInputError(formSignIn);

  let seconds_left = 60;
  console.log("first second_left : ", seconds_left);
  setTimerText = setInterval(function () {
    seconds_left = --seconds_left;
    otpTimerText.textContent = `${seconds_left}`;
    console.log("interval ke : ", seconds_left);

    if (seconds_left <= 0) {
      clearInterval(setTimerText);
      console.log("setTimerText stopped");
      moveSection(otpVerifySection, openingSection);
      window.location.reload();
    }
  }, 1000);

  //   otpVerifySection.replaceWith(otpVerifySection.cloneNode(true));
  otpVerifySection.removeEventListener("submit", submitOtpSignIn);
  otpVerifySection.addEventListener("submit", submitOtpSignIn);
};

// REGISTER LOCATION
const registerLocationBengkel = function () {
  console.log("open registerLocationBengkel . . .");
  getLocationPromise()
    .then((res) => {
      moveSection(otpVerifySection, registerLocationSection);
      removeInputError(formOtpVerify);

      console.log("getLocationPromise . . .");
      loadMap(res, "map-regis-location");
      console.log("map index js: ", map);
      btnSelectLocation.addEventListener("click", (e) => {
        createLoadingBtn(registerLocationSection);
        const { lng, lat } = map.getCenter();
        const bengkelCoords = { bengkelCoords: [lng, lat] };
        console.log(bengkelCoords);
        setDoc(doc(db, `userBengkel`, `${currentUser.uid}`), bengkelCoords, {
          merge: true,
        })
          .then(() => {
            console.log("setDoc bengkelCoords done.");
            openPhotoRegis();
          })
          .catch((err) => console.log("error setDoc : ", err.message));
      });
    })
    .catch((err) => console.log("error getlocationpromise : ", err.message));
};

// SUBMIT OTP VERIFICATION FUNCTION
const submitOtpSignUp = async function (e) {
  e.preventDefault();

  try {
    createLoadingBtn(formOtpVerify);
    let otpCode = `${formOtpVerify["otp-code"].value}`;
    console.log(otpCode);
    // Then sign the user in with confirmationResult.confirm(code).
    const result = await confirmationResult.confirm(otpCode);
    const user = result.user;
    clearInterval(setTimerText);
    console.log("submitOtpSignUp user logged in! : ", user);
    console.log("user.id : ", user.uid);
    console.log("userObj : ", userObj);

    // Add role
    const addRoleResult = await addRole({
      uid: user.uid,
      userRole: userObj.userRole,
    });

    console.log("custom claim from frontend: ", addRoleResult);

    //   Add user to allUsers Collection
    await setDoc(doc(db, `allUsers`, `${user.phoneNumber}`), {
      phoneNumber: user.phoneNumber,
    });

    currentUser = auth.currentUser;
    const currentUserObj = JSON.stringify({
      ...currentUser,
      userRole: `${userType}`.toLowerCase(),
    });
    localStorage.setItem("localCurrentUser", currentUserObj);
    currentUser = JSON.parse(currentUserObj);
    console.log("currentUser after addRole : ", currentUser);

    const idTokenResult = await user.getIdTokenResult(true);
    console.log("role: ", idTokenResult.claims.role);

    //   Add user to user Collection
    await setDoc(doc(db, `user${userType}`, `${user.uid}`), userObj);
    console.log("setDoc done.");

    formOtpVerify.reset();

    await updateProfile(user, {
      displayName:
        userType === "Pengendara" ? userObj.name : userObj.bengkelName,
    });

    if (userType === "Bengkel") {
      console.log("Bengkel berhasil Sign Up!");
      registerLocationBengkel();
    }

    if (userType === "Pengendara") {
      console.log("Pengendara berhasil Sign Up!");
      moveSection(otpVerifySection, mainPengendaraSection);
      removeInputError(formOtpVerify);
      getPengendaraPosition();
    }
  } catch (error) {
    console.log("error submitOtpSignUp : ", error.message);
    showInputError(formOtpVerify);
    removeLoadingBtn(formOtpVerify);
  }
};

// SIGN UP FUNCTION
export const signingUpUser = async function (signUserType) {
  let btnSign;
  userType = signUserType;

  if (userType === "Bengkel") {
    // Input Form Bengkel
    btnSign = `btn-signup-${userType.toLowerCase()}`;
    formElement = formSignUpBengkel;
    userObj = {
      phoneNumber: `+62${formSignUpBengkel["phone-number"].value}`,
      ownerName: formSignUpBengkel["owner-name"].value,
      bengkelName: formSignUpBengkel["bengkel-name"].value,
      bengkelAddress: formSignUpBengkel["bengkel-address"].value,
      bengkelDesc: formSignUpBengkel["bengkel-description"].value,
      openTime: formSignUpBengkel["open-time"].value,
      closeTime: formSignUpBengkel["close-time"].value,
      userRole: formSignUpBengkel["role"].value,
    };
    // Input Validation
    if (isObjFull(userObj) === false) {
      showInputError(formSignUpBengkel);
      removeLoadingBtn(formSignUpBengkel);
      return;
    }
    if (userObj.phoneNumber === "+62") {
      showInputError(formSignUpBengkel);
      removeLoadingBtn(formSignUpBengkel);
      return;
    }
    const isUserRegistered = await validateUser(userObj.phoneNumber);
    if (isUserRegistered) {
      showInputError(formSignUpBengkel, "Akun sudah terdaftar");
      removeLoadingBtn(formSignUpBengkel);
      return;
    }

    // const snapshot = await getDocs(
    //   query(
    //     collection(db, `userBengkel`),
    //     where("phoneNumber", "==", userObj.phoneNumber)
    //   )
    // );
    // if (snapshot.docs.length > 0) {
    //   showInputError(formSignUpBengkel, "Akun sudah terdaftar");
    //   removeLoadingBtn(formSignUpBengkel);
    //   userRegistered = true;
    // }
  }
  if (userType === "Pengendara") {
    // Input Form Pengendara
    btnSign = `btn-signup-${userType.toLowerCase()}`;
    formElement = formSignUpPengendara;
    userObj = {
      phoneNumber: `+62${formSignUpPengendara["phone-number"].value}`,
      name: formSignUpPengendara["pengendara-name"].value,
      email: formSignUpPengendara["email"].value,
      userRole: formSignUpPengendara["role"].value,
    };
    // Input Validation
    if (isObjFull(userObj) === false) {
      showInputError(formSignUpPengendara);
      removeLoadingBtn(formSignUpPengendara);
      return;
    }
    if (userObj.phoneNumber === "+62") {
      showInputError(formSignUpPengendara);
      removeLoadingBtn(formSignUpPengendara);
      return;
    }

    const isUserRegistered = await validateUser(userObj.phoneNumber);
    if (isUserRegistered) {
      showInputError(formSignUpPengendara, "Akun sudah terdaftar");
      removeLoadingBtn(formSignUpPengendara);
      return;
    }

    // const snapshot = await getDocs(
    //   query(
    //     collection(db, `userPengendara`),
    //     where("phoneNumber", "==", userObj.phoneNumber)
    //   )
    // );
    // if (snapshot.docs.length > 0) {
    //   showInputError(formSignUpPengendara, "Akun sudah terdaftar");
    //   removeLoadingBtn(formSignUpPengendara);
    //   userRegistered = true;
    // }
  }

  console.log(userObj);
  recaptchaVerifierMaker(btnSign);
  const appVerifier = window.recaptchaVerifier;
  const phoneNumber = `+62${formElement["phone-number"].value}`;
  console.log(phoneNumber);

  signInWithPhoneNumber(auth, phoneNumber, appVerifier)
    .then((confirmationResult) => {
      console.log("signin phone number...");
      window.confirmationResult = confirmationResult;

      // SMS sent. Update UI to OTP section
      formElement.reset();
      if (userType === "Bengkel") {
        moveSection(signUpBengkelSection, otpVerifySection);
        removeInputError(formSignUpBengkel);
      }
      if (userType === "Pengendara") {
        moveSection(signUpPengendaraSection, otpVerifySection);
        removeInputError(formSignUpPengendara);
      }
      console.log("UI updated...");

      otpPhoneNumberText.textContent = phoneNumber;

      let seconds_left = 60;
      console.log("first second_left : ", seconds_left);
      setTimerText = setInterval(function () {
        seconds_left = --seconds_left;
        otpTimerText.textContent = `${seconds_left}`;
        console.log("interval ke : ", seconds_left);

        if (seconds_left <= 0) {
          console.log("setTimerText stopped");
          clearInterval(setTimerText);
          moveSection(otpVerifySection, openingSection);
        }
      }, 1000);

      //   otpVerifySection.replaceWith(otpVerifySection.cloneNode(true));
      otpVerifySection.removeEventListener("submit", submitOtpSignUp);
      otpVerifySection.addEventListener("submit", submitOtpSignUp);
    })
    .catch((error) => {
      console.log("error 2 :", error.message);
      // reset reCAPTCHA
      window.recaptchaVerifier.render().then(function (widgetId) {
        recaptcha.reset(widgetId);
      });
    });

  console.log(`sign up ${userType}...`);
  console.log(`userObj.phoneNumber :,`, userObj.phoneNumber);
  console.log(`userObj.userRole :,`, userObj.userRole);
};

export const openPhotoRegis = function () {
  moveSection(registerLocationSection, regisPhotoSection);
  regisPhotoSection
    .querySelector(".input-pic")
    .addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelector("#files-signup").click();
    });

  //   Upload Foto From Device
  document.querySelector("#files-signup").addEventListener("change", (e) => {
    e.preventDefault();
    console.log("change");
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      const files = e.target.files;
      console.log(files);

      //   Looping files uploaded
      for (let i = 0; i < files.length; i++) {
        if (!files[i].type.match("image")) continue;
        const picReader = new FileReader();

        // picReader Load Event
        picReader.addEventListener("load", (event) => {
          console.log("picReader event listener");
          const picFile = event.target;
          console.log("picFile", picFile);

          uploadPics[`${files[i].name}`] = picFile.result;
          console.log("adding uploadPics : ", uploadPics);

          const picBoxHTML = `
					<div class="pic-box">
					<div class="close-pic" data-id="${files[i].name}">
					  <svg
						  viewBox="0 0 24 24"
						  xmlns="http://www.w3.org/2000/svg"
						  >
						  <g data-name="Layer 2">
							  <g data-name="close">
							  <rect transform="rotate(180 12 12)" opacity="0" />
							  <path
								  d="M13.41 12l4.3-4.29a1 1 0 1 0-1.42-1.42L12 10.59l-4.29-4.3a1 1 0 0 0-1.42 1.42l4.3 4.29-4.3 4.29a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0l4.29-4.3 4.29 4.3a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42z"
							  />
							  </g>
						  </g>
						  </svg>
					  </div>
					  <img class="thumbnail" src="${picFile.result}" title="${files[i].name}"/>
					</div>`;

          outputSignup.style.display = "flex";
          outputSignup.insertAdjacentHTML("beforeend", picBoxHTML);

          const closePic = document.querySelector(
            `div[data-id="${files[i].name}"]`
          );

          closePic.addEventListener("click", (e) => {
            console.log("closepic event");

            delete uploadPics[
              `${closePic.parentNode.querySelector(".thumbnail").title}`
            ];
            console.log("removing uploadPics : ", uploadPics);

            closePic.parentNode.remove();

            if (
              Object.keys(uploadPics).length === 0 &&
              downloadPics.length === 0
            ) {
              outputSignup.style.display = "none";
              btnRegisPhoto.style.backgroundColor = "rgb(206, 206, 206)";
              btnRegisPhoto.removeEventListener("click", regisPhoto);
            }
          });
          btnRegisPhoto.style.backgroundColor = "#00aa13";
          btnRegisPhoto.addEventListener("click", regisPhoto);
        });
        picReader.readAsDataURL(files[i]);
      }
    } else {
      alert("Browser kamu tidak mensupport pengunggahan gambar");
    }
  });
};

export const regisPhoto = function (e) {
  e.preventDefault();
  createLoadingBtn(regisPhotoSection);

  // Upload Foto to Cloud Storage
  const promises = [];
  Object.keys(uploadPics).forEach((key) => {
    arrayPics.push(key);
    const message = uploadPics[key];
    const storageRef = ref(storage, `${key}`);
    promises.push(uploadString(storageRef, message, "data_url"));
    console.log("promise pushed");
  });
  Promise.all(promises).then(() => {
    // Saving pics to Firestore
    updateDoc(doc(db, `userBengkel`, `${currentUser.uid}`), {
      bengkelPhotos: arrayUnion(...arrayPics),
    }).then(() => {
      console.log("update photos in firestore success");

      mainBengkelConfig().then(() => {
        console.log("after mainbengkelconfig");
        openingSection.classList.remove("active");
        moveSection(regisPhotoSection, mainBengkelSection);
        showMontirList(mainBengkelSection);
        requestPermission();
      });

      //   moveSection(regisPhotoSection, mainBengkelSection);
      //   showMontirList(mainBengkelSection);
    });
  });
};
