import { auth, checkOnlineStatus, db, functions } from "./firebase-config";
import {
  updateProfile,
  updatePhoneNumber,
  PhoneAuthProvider,
  deleteUser,
  signOut,
} from "firebase/auth";
import { httpsCallable } from "firebase/functions";

import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where,
  arrayRemove,
  arrayUnion,
  deleteField,
  onSnapshot,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadString,
} from "firebase/storage";
import { deleteToken, getMessaging, onMessage } from "firebase/messaging";
import {
  appState,
  mainBengkelSection,
  montirContainer,
  noMontir,
  serviceContainer,
  orderContainer,
  otpVerifySection,
  formOtpVerify,
  registerLocationSection,
  btnSelectLocation,
  editBengkelSection,
  moveSection,
  addMontirSection,
  formAddMontir,
  settingMontirSection,
  noMontirSetting,
  montirSettingList,
  bengkelStatus,
  formEditBengkel,
  outputEdit,
  mapRegisLocation,
  openingSection,
  orderNotification,
  cardSelectMontir,
  selectMontirList,
  cardOrderInfo,
  mapOrderNotification,
  formSelectMontir,
  waitingCardBengkel,
  confirmCardBengkel,
  showInputError,
  successOrderContainer,
  openSuccessOrder,
  starsContainer,
  successOrderSection,
  countingStarsIcon,
  progressOrderContainer,
  progressOrderSection,
  removeLoadingBtn,
  createLoadingBtn,
  showModalNoInternet,
  changeBengkelStatusVariable,
  infoBengkelName,
  infoBengkelOpenTime,
  bengkelProfileName,
  bengkelProfileOpenTime,
  btnConfirmCardBengkel,
  rejectOrderConfirm,
  bengkelInitPage,
  serviceState,
  noMontirSelectMontir,
  otpTimerText,
  sendCostSection,
  sendCostRequestContainer,
  showModalMessage,
  //   createLoadingBtn,
} from "./index";
import {
  currentUser,
  isObjFull,
  recaptchaVerifierMaker,
  validateUser,
} from "./auth";
import {
  map,
  userCoords,
  getLocationPromise,
  loadMap,
  removeMap,
} from "./mapbox-config";

let uploadPics = {};
let downloadPics = [];
let arrayPics = [];
const storage = getStorage();
const deleteAuthUser = httpsCallable(functions, "deleteAuthUser");

let orderStartMarker;
let orderStartElement;
let orderEndMarker;
let orderEndElement;

let orderNowId;

// RECIEVE MESSAGES NOTIFICATION

const messaging = getMessaging();
onMessage(messaging, (payload) => {
  console.log("Message received. ", payload);
  //   alert(`message received ${payload}`);
  //   mainBengkelSection.querySelector(".bengkel-name").style.backgroundColor =
  //     "black";
  // ...
});

// onMessage(messaging, (payload) => {
//   console.log("Message received. ", payload);
//   alert(`message received ${payload}`);

//   const notificationTitle = "Ada Panggilan!";
//   const notificationOptions = {
//     body: `Lokasi pelanggan berjarak ${payload.data.travelTime} dari bengkel Anda`,
//     icon: "/src/images/gear-icon-192x192.png",
//   };

//   navigator.serviceWorker.getRegistrations().then((registration) => {
//     //registration[0].showNotification(notification.title);
//     return registration[0].showNotification(
//       notificationTitle,
//       notificationOptions
//     );
//   });
// });

// GENERAL
export const showSuccessOrderCard = function (orderId) {
  getDoc(doc(db, `userBengkel/${currentUser.uid}/orders/${orderId}`)).then(
    (doc) => {
      const orderData = doc.data();
      //   Open Card
      openSuccessOrder.classList.add("center-top-open");
      const overlay = document.createElement("div");
      overlay.classList.add("overlay");
      successOrderSection.insertBefore(overlay, openSuccessOrder);
      overlay.addEventListener("click", (e) => {
        overlay.remove();
        openSuccessOrder.classList.remove("center-top-open");
      });

      //   Load Data
      openSuccessOrder.querySelector(
        ".order-date"
      ).textContent = `${orderData.createdAt}`;
      openSuccessOrder.querySelector(
        ".order-montir"
      ).textContent = `Montir : ${orderData.montirName}`;
      openSuccessOrder.querySelector(
        ".order-name"
      ).textContent = `Pelanggan : ${orderData.pengendaraName}`;
      //   Loading Stars Review
      if (starsContainer.children.length !== 0) {
        let child = starsContainer.firstElementChild;
        while (child) {
          starsContainer.removeChild(child);
          child = starsContainer.firstElementChild;
        }
      }
      const starsHTML = countingStarsIcon(orderData, "c-icon");
      starsContainer.insertAdjacentHTML("beforeend", starsHTML);
      openSuccessOrder.querySelector(
        ".review-text"
      ).textContent = `${orderData.review}`;
    }
  );
};

export const showSuccessOrders = function () {
  console.log("showSuccessOrder");

  getDocs(
    query(
      collection(db, `userBengkel/${currentUser.uid}/orders`),
      where("status", "==", "success")
    )
  )
    .then((snapshot) => {
      if (successOrderContainer.children.length !== 0) {
        let child = successOrderContainer.firstElementChild;
        while (child) {
          successOrderContainer.removeChild(child);
          child = successOrderContainer.firstElementChild;
        }
      }

      snapshot.forEach((doc) => {
        const orderData = doc.data();
        console.log("showSuccessOrder data : ", orderData);
        const cardSuccessHTML = `
		<div class="card order">
			<div>
				<p class="order-date">${orderData.createdAt}</p>
				<p class="order-name">${orderData.pengendaraName}</p>
			</div>
			<button class="btn btn-order-detail" data-id="${doc.id}">Lihat detail</button>
		</div>`;

        successOrderSection.querySelector(".no-orders").style.display = "none";
        successOrderContainer.insertAdjacentHTML("afterbegin", cardSuccessHTML);
        const btnShowSuccessOrder =
          successOrderContainer.querySelector(".btn-order-detail");
        console.log("btnShowww : ", btnShowSuccessOrder);
        btnShowSuccessOrder.addEventListener("click", (e) => {
          showSuccessOrderCard(e.target.dataset.id);
        });
      });
    })
    .catch((err) => {
      if (successOrderContainer.children.length !== 0) {
        let child = successOrderContainer.firstElementChild;
        while (child) {
          successOrderContainer.removeChild(child);
          child = successOrderContainer.firstElementChild;
        }
      }
      successOrderSection.querySelector(".no-orders").style.display = "block";
      console.log("err get success order ", err.message);
    });
};

export const showProgressOrder = function () {
  console.log("showProgressOrder");

  getDocs(
    query(
      collection(db, `userBengkel/${currentUser.uid}/orders`),
      where("status", "==", "running")
    )
  )
    .then((snapshot) => {
      if (snapshot.docs.length > 0) {
        if (progressOrderContainer.children.length !== 0) {
          let child = progressOrderContainer.firstElementChild;
          while (child) {
            progressOrderContainer.removeChild(child);
            child = progressOrderContainer.firstElementChild;
          }
        }

        snapshot.forEach((doc) => {
          const orderData = doc.data();
          console.log("showProgressOrder data : ", orderData);
          const cardProgressHTML = `
				<div class="card order">
				<div class="actor-info">
				  <p class="order-montir">${orderData.montirName}</p>
				  <svg
					width="24px"
					height="24px"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				  >
					<path
					  d="M13.4697 8.53033C13.1768 8.23744 13.1768 7.76256 13.4697 7.46967C13.7626 7.17678 14.2374 7.17678 14.5303 7.46967L18.5303 11.4697C18.8232 11.7626 18.8232 12.2374 18.5303 12.5303L14.5303 16.5303C14.2374 16.8232 13.7626 16.8232 13.4697 16.5303C13.1768 16.2374 13.1768 15.7626 13.4697 15.4697L16.1893 12.75H6.5C6.08579 12.75 5.75 12.4142 5.75 12C5.75 11.5858 6.08579 11.25 6.5 11.25H16.1893L13.4697 8.53033Z"
					  fill="black"
					/>
				  </svg>
					<p class="order-name">${orderData.pengendaraName}</p>
				</div>
				<div>
					<p class="went-at">Montir berangkat pada : ${orderData.wentAt}</p>
				</div>
				</div>`;

          progressOrderSection.querySelector(".no-orders").style.display =
            "none";
          progressOrderContainer.insertAdjacentHTML(
            "afterbegin",
            cardProgressHTML
          );
        });
      }
      if (snapshot.docs.length <= 0) {
        if (progressOrderContainer.children.length !== 0) {
          let child = progressOrderContainer.firstElementChild;
          while (child) {
            progressOrderContainer.removeChild(child);
            child = progressOrderContainer.firstElementChild;
          }
        }
        progressOrderSection.querySelector(".no-orders").style.display =
          "block";
      }
    })
    .catch((err) => {
      console.log("err get success order ", err.message);
    });
};

let setTimerTextEditBengkel;

const submitOtpEditProfile = function (verificationId, userObj) {
  console.log("submitOtpEditBengkel");
  createLoadingBtn(formOtpVerify);
  clearInterval(setTimerTextEditBengkel);
  let otpCode = `${formOtpVerify["otp-code"].value}`;
  console.log(otpCode);

  const phoneCredential = PhoneAuthProvider.credential(verificationId, otpCode);
  console.log("masuk cok");

  deleteDoc(doc(db, `allUsers`, currentUser.phoneNumber)).then(() => {
    console.log("deleteDoc allUsers success!");
    updatePhoneNumber(currentUser, phoneCredential).then(() => {
      console.log("updatePhoneNumber credential success!");
      setDoc(
        doc(db, `userBengkel`, currentUser.uid),
        {
          phoneNumber: `+62${formEditBengkel["phone-number"].value}`,
        },
        {
          merge: true,
        }
      ).then(() => {
        console.log("setDoc userBengkel compelete");
        setDoc(
          doc(db, `allUsers`, `+62${formEditBengkel["phone-number"].value}`),
          {
            phoneNumber: `+62${formEditBengkel["phone-number"].value}`,
          }
        ).then(() => {
          console.log("update ALL phonenumber success!");
          showModalMessage(editBengkelSection, "Ubah profil berhasil");
          window.location.reload();

          //   bengkelProfileName.textContent = `${userObj.bengkelName}`;
          //   console.log(
          //     "bengkelProfileName.textContent",
          //     bengkelProfileName.textContent
          //   );
          //   bengkelProfileOpenTime.textContent = `${userObj.openTime}-${userObj.closeTime}`;
          //   console.log(
          //     "bengkelProfileOpenTime.textContent",
          //     bengkelProfileOpenTime.textContent
          //   );
        });
      });
    });
  });
};

export const submitEditBengkel = async function () {
  createLoadingBtn(editBengkelSection);

  const userDoc = await getDoc(doc(db, `userBengkel`, `${currentUser.uid}`));
  console.log(userDoc.data());
  const userData = userDoc.data();

  const userObj = {
    ownerName: formEditBengkel["owner-name"].value,
    bengkelName: formEditBengkel["bengkel-name"].value,
    bengkelAddress: formEditBengkel["bengkel-address"].value,
    bengkelDesc: formEditBengkel["bengkel-description"].value,
    openTime: formEditBengkel["open-time"].value,
    closeTime: formEditBengkel["close-time"].value,
  };

  // Validate phoneNumber
  if (isObjFull(userObj) === false) {
    showInputError(formEditBengkel);
    removeLoadingBtn(formEditBengkel);
    return;
  }
  if (formEditBengkel["phone-number"].value === "") {
    showInputError(formEditBengkel);
    removeLoadingBtn(formEditBengkel);
    return;
  }
  if (`+62${formEditBengkel["phone-number"].value}` !== userData.phoneNumber) {
    const isUserRegistered = await validateUser(
      `+62${formEditBengkel["phone-number"].value}`
    );
    if (isUserRegistered) {
      showInputError(
        formEditBengkel,
        "Nomor sudah terdaftar, silakan ubah nomor lain"
      );
      removeLoadingBtn(formEditBengkel);
      return;
    }
  }

  //   If phoneNumber not registered yet :
  // Upload Foto to Cloud Storage
  const promises = [];
  Object.keys(uploadPics).forEach((key) => {
    arrayPics.push(key);

    const message = uploadPics[key];
    const storageRef = ref(storage, `${key}`);

    promises.push(uploadString(storageRef, message, "data_url"));
    console.log("promise pushed");
  });

  await Promise.all(promises);
  console.log("out of foreach");
  console.log(userObj);

  //   Saving all new data to Firestore
  await setDoc(doc(db, `userBengkel`, `${currentUser.uid}`), userObj, {
    merge: true,
  });

  console.log("update firestore success!");

  // Saving Pic to Firestore
  updateDoc(doc(db, `userBengkel`, `${currentUser.uid}`), {
    bengkelPhotos: arrayUnion(...arrayPics),
  }).then(() => console.log("update photos in firestore success"));

  //   Update User OwnerName
  if (userObj.name !== userData.name) {
    let oldDisplayName = currentUser.displayName;
    await updateProfile(currentUser, {
      displayName: userObj.bengkelName,
    });
    console.log("berhasil set displayname");
    const snapshot = await getDocs(
      query(
        collection(db, `userbengkel/${currentUser.uid}/userMontir`),
        where("bengkelName", "==", oldDisplayName)
      )
    );
    snapshot.forEach(async (doc) => {
      await setDoc(
        doc(db, `userbengkel/${currentUser.uid}/userMontir`, `${doc.id}`),
        { bengkelName: currentUser.displayName },
        {
          merge: true,
        }
      );
      console.log("update bengkelName in userMontir success!");
    });

    const orderSnap = await getDocs(
      query(collection(db, "order"), where("bengkelName", "==", oldDisplayName))
    );
    orderSnap.forEach(async (doc) => {
      await setDoc(
        doc(db, "order", `${doc.id}`),
        { bengkelName: currentUser.displayName },
        { merge: true }
      );
      console.log("update bengkelName in order success!");
    });
    console.log("final update success!");
  }

  outputEdit.innerHTML = "";
  uploadPics = {};
  downloadPics = [];
  arrayPics = [];

  //   Update User phoneNumber
  if (`+62${formEditBengkel["phone-number"].value}` !== userData.phoneNumber) {
    recaptchaVerifierMaker("btn-update-profil");
    // 82210176648
    const appVerifier = window.recaptchaVerifier;
    const phoneNumber = `+62${formEditBengkel["phone-number"].value}`;
    const provider = new PhoneAuthProvider(auth);

    const verificationId = await provider.verifyPhoneNumber(
      phoneNumber,
      appVerifier
    );

    moveSection(editBengkelSection, otpVerifySection);
    let seconds_left = 60;
    console.log("first second_left : ", seconds_left);
    setTimerTextEditBengkel = setInterval(function () {
      seconds_left = --seconds_left;
      otpTimerText.textContent = `${seconds_left}`;
      console.log("interval ke : ", seconds_left);

      if (seconds_left <= 0) {
        clearInterval(setTimerTextEditBengkel);
        console.log("setTimerText stopped");
        if (appState == otpVerifySection) {
          moveSection(otpVerifySection, mainBengkelSection);
          showModalMessage(mainBengkelSection, "Ubah Nomor HP");
          window.location.reload();
        }
      }
    }, 1000);

    otpVerifySection.addEventListener("submit", (e) => {
      e.preventDefault();
      submitOtpEditProfile(verificationId, userObj);
    });
    otpVerifySection.removeEventListener("submit", (e) => {
      e.preventDefault();
      submitOtpEditProfile(verificationId, userObj);
    });

    return;
  }

  moveSection(editBengkelSection, mainBengkelSection);
  bengkelProfileName.textContent = `${userObj.bengkelName}`;
  console.log("bengkelProfileName.textContent", bengkelProfileName.textContent);
  bengkelProfileOpenTime.textContent = `${userObj.openTime}-${userObj.closeTime}`;
  console.log(
    "bengkelProfileOpenTime.textContent",
    bengkelProfileOpenTime.textContent
  );
  showModalMessage(mainBengkelSection, "Ubah profil berhasil");
};

export const editLocationBengkel = function () {
  getDoc(doc(db, `userBengkel`, `${currentUser.uid}`)).then((bengkelDoc) => {
    const bengkelData = bengkelDoc.data();
    //   Select a new location for bengkel
    moveSection(mainBengkelSection, registerLocationSection);
    const [lng, lat] = bengkelData.bengkelCoords;
    const position = { coords: { latitude: lat, longitude: lng } };
    console.log("position : ", position);
    loadMap(position, "map-regis-location");
    console.log("map edit profl: ", map);
  });
  btnSelectLocation.addEventListener("click", () => {
    checkOnlineStatus().then((status) => {
      if (status === true) {
        createLoadingBtn(registerLocationSection);
        const { lng, lat } = map.getCenter();
        const bengkelCoords = [lng, lat];
        console.log(bengkelCoords);

        setDoc(
          doc(db, `userBengkel`, `${currentUser.uid}`),
          { bengkelCoords: bengkelCoords },
          {
            merge: true,
          }
        ).then(() => {
          console.log("set new location success!");
          moveSection(registerLocationSection, mainBengkelSection);
          showModalMessage(mainBengkelSection, "Ubah lokasi berhasil");
        });
      }
      if (status === false) {
        showModalNoInternet(registerLocationSection);
        return;
      }
    });
  });
};

export const openEditBengkel = function () {
  //   currentUser = auth.currentUser;
  console.log("currentUser : ", currentUser.uid);
  moveSection(mainBengkelSection, editBengkelSection);

  getDoc(doc(db, `userBengkel`, `${currentUser.uid}`)).then((userDoc) => {
    console.log(userDoc.data());
    const userData = userDoc.data();
    const slicedPhoneNumber = userData.phoneNumber.slice(3);
    formEditBengkel["phone-number"].value = `${+slicedPhoneNumber}`;
    formEditBengkel["owner-name"].value = `${userData.ownerName}`;
    formEditBengkel["bengkel-name"].value = `${userData.bengkelName}`;
    formEditBengkel["bengkel-address"].value = `${userData.bengkelAddress}`;
    formEditBengkel["bengkel-description"].value = `${userData.bengkelDesc}`;
    formEditBengkel["open-time"].value = `${userData.openTime}`;
    formEditBengkel["close-time"].value = `${userData.closeTime}`;

    //   download foto
    userData.bengkelPhotos.forEach((picName) => {
      downloadPics.push(picName);
      const gsReference = ref(
        storage,
        `gs://aplikasi-bengkel-online.appspot.com/${picName}`
      );
      getDownloadURL(gsReference).then((url) => {
        const picBoxHTML = `
				<div class="pic-box">
					<div class="close-pic" data-id="${picName}">
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
					<img class="thumbnail" src="${url}" title="${picName}"/>
				</div>`;
        outputEdit.style.display = "flex";
        outputEdit.insertAdjacentHTML("beforeend", picBoxHTML);
        console.log("adding downloadPics : ", downloadPics);

        const closePic = document.querySelector(`div[data-id="${picName}"]`);

        closePic.addEventListener("click", (e) => {
          console.log("closepic event");

          // Delete img file from Cloud Storage
          const deletePicRef = ref(
            storage,
            `${closePic.parentNode.querySelector(".thumbnail").title}`
          );
          deleteObject(deletePicRef).then(() => console.log("file deleted!"));

          // Delete img name from Firestore
          updateDoc(doc(db, `userBengkel`, `${currentUser.uid}`), {
            bengkelPhotos: arrayRemove(
              `${closePic.parentNode.querySelector(".thumbnail").title}`
            ),
          }).then(() => console.log("Delete from Firestore success!"));

          // Delete img from array
          const deleteIndex = downloadPics.indexOf(
            `${closePic.parentNode.querySelector(".thumbnail").title}`
          );
          downloadPics.splice(deleteIndex, 1);
          console.log("removing downloadPics : ", downloadPics);

          // Remove element
          closePic.parentNode.remove();
          if (uploadPics.length === 0 && downloadPics.length === 0)
            outputEdit.style.display = "none";
        });
      });
    });
  });
};

//   Upload Foto From Device
document.querySelector("#files-edit").addEventListener("change", (e) => {
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

        outputEdit.style.display = "flex";
        outputEdit.insertAdjacentHTML("beforeend", picBoxHTML);

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

          if (Object.keys(uploadPics).length === 0 && downloadPics.length === 0)
            outputEdit.style.display = "none";
        });
      });
      picReader.readAsDataURL(files[i]);
    }
  } else {
    alert("Browser kamu tidak mensupport pengunggahan gambar");
  }
});

export const submitAddMontir = async function (e) {
  e.preventDefault();
  const montirObj = {
    phoneNumber: `+62${formAddMontir["phone-number"].value}`,
    montirName: formAddMontir["montir-name"].value,
    montirStatus: false,
    bengkelUid: currentUser.uid,
    userRole: "montir",
  };
  if (isObjFull(montirObj) === false) {
    showInputError(formAddMontir);
    removeLoadingBtn(formAddMontir);
    return;
  }
  if (montirObj.phoneNumber === "+62") {
    showInputError(formAddMontir);
    removeLoadingBtn(formAddMontir);
    return;
  }
  const isUserRegistered = await validateUser(montirObj.phoneNumber);
  if (isUserRegistered) {
    showInputError(
      formAddMontir,
      "Nomor sudah terdaftar, silakan ubah nomor lain"
    );
    removeLoadingBtn(formAddMontir);
    return;
  }
  await setDoc(
    doc(
      db,
      `userBengkel/${currentUser.uid}/userMontir/${montirObj.phoneNumber}`
    ),
    montirObj
  );
  //   Add user to allUsers Collection
  await setDoc(doc(db, `allUsers`, `${montirObj.phoneNumber}`), {
    phoneNumber: montirObj.phoneNumber,
  });
  console.log("add montir success!");
  formAddMontir.reset();
  moveSection(addMontirSection, settingMontirSection);
  showMontirList(settingMontirSection);
  showMontirList(mainBengkelSection);
  showModalMessage(settingMontirSection, "Tambah montir berhasil");
};

const changeMontirStatus = function (montirId, montirStatus) {
  console.log("changemontirstatus!", montirId, montirStatus);
  updateDoc(doc(db, `userBengkel/${currentUser.uid}/userMontir/${montirId}`), {
    montirStatus: montirStatus,
  }).then(() => console.log("changemontir berhasil!"));
};

const deleteMontir = function (montirId) {
  console.log("deleteMontir function");
  checkOnlineStatus().then((status) => {
    if (status === true) {
      console.log("deleting...");
      // const montirId = montirId;
      console.log(montirId);
      deleteAuthUser({ phoneNumber: montirId })
        .then((result) => {
          console.log("delteAuthUser result", result);
          deleteDoc(doc(db, `allUsers`, `${montirId}`))
            .then(() => {
              deleteDoc(
                doc(db, `userBengkel/${currentUser.uid}/userMontir/${montirId}`)
              ).then(() => {
                console.log("delete montir berhasil!");
                //   Remove delete confirm card and overlay
                settingMontirSection
                  .querySelector(
                    `.delete-montir-confirm[data-id="${montirId}"]`
                  )
                  .remove();
                settingMontirSection.querySelector(".overlay").remove();
                //   Remove montir card on list
                montirSettingList
                  .querySelector(`.btn-delete-montir[data-id="${montirId}"]`)
                  .parentElement.remove();
                showModalMessage(settingMontirSection, "Hapus montir berhasil");
                if (montirSettingList.children.length == 0) {
                  noMontirSetting.style.display = "block";
                }
                showMontirList(settingMontirSection);
                showMontirList(mainBengkelSection);
              });
            })
            .catch((err) => console.log(err.message));
        })
        .catch((err) => console.log("err delete user : ", err));
    }
    if (status === false) {
      console.log("[No Internet] There is no internet!");
      showModalNoInternet(settingMontirSection);
      return;
    }
  });
};

export const showOrderRouteMarker = function (start, end) {
  const startGeojson = {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: start,
    },
  };
  const endGeojson = {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: end,
    },
  };

  if (orderStartMarker && orderStartElement) {
    orderStartElement.remove();
    orderStartMarker.remove();
  }
  if (orderEndMarker && orderEndElement) {
    orderEndElement.remove();
    orderEndMarker.remove();
  }

  // CREATE NEW USER ELLEMENT & MARKER
  orderStartElement = document.createElement("img");
  orderStartElement.src = "./src/images/bengkel-icon.png";
  orderStartElement.className = "bengkel-marker";

  orderEndElement = document.createElement("img");
  orderEndElement.src = "./src/images/location-icon.png";
  orderEndElement.className = "location-marker";

  orderStartMarker = new mapboxgl.Marker(orderStartElement)
    .setLngLat(startGeojson.geometry.coordinates)
    .addTo(map);
  orderEndMarker = new mapboxgl.Marker(orderEndElement)
    .setLngLat(endGeojson.geometry.coordinates)
    .addTo(map);
};

let montirList = [];

export const showOrderRoute = async function (
  start,
  end,
  mapContainer,
  isMontir
) {
  const query = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/cycling/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
    { method: "GET" }
  );
  const json = await query.json();
  const data = json.routes[0];
  console.log(data);
  const route = data.geometry.coordinates;
  const geojson = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: route,
    },
  };

  if (!isMontir) {
    mapContainer.style.height = "65%";
    map.resize();
  }

  //   show markers of bengkel and pengendara
  showOrderRouteMarker(start, end);

  // if the route already exists on the map, we'll reset it using setData
  if (map.getSource("route")) {
    map.getSource("route").setData(geojson);
  }
  // otherwise, we'll make a new request
  else {
    map.addLayer({
      id: "route",
      type: "line",
      source: {
        type: "geojson",
        data: geojson,
      },
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#3887be",
        "line-width": 5,
        "line-opacity": 0.75,
      },
    });
  }
  const bounds = new mapboxgl.LngLatBounds(userCoords, userCoords);
  for (const coord of route) {
    bounds.extend(coord);
  }
  map.fitBounds(bounds, {
    padding: 30,
    duration: 1000,
  });
};

const showDeleteConfirm = function (montirId) {
  const confirmHTML = `
		<div class="card delete-montir-confirm center-open" data-id="${montirId}">
			<p>Anda yakin ingin menghapus montir?</p>
			<div class="buttons">
				<button class="btn btn-yes"">Ya, saya yakin</button>
				<button class="btn btn-no">Batal</button>
			</div>
		</div>`;
  settingMontirSection.insertAdjacentHTML("beforeend", confirmHTML);
  const cardDeleteMontirConfirm = settingMontirSection.querySelector(
    ".delete-montir-confirm"
  );
  const btnConfirmDeleteMontir =
    cardDeleteMontirConfirm.querySelector(".buttons");
  const overlay = document.createElement("div");
  overlay.classList.add("overlay");
  settingMontirSection.insertBefore(overlay, cardDeleteMontirConfirm);
  overlay.addEventListener("click", () => {
    overlay.remove();
    cardDeleteMontirConfirm.remove();
  });
  btnConfirmDeleteMontir.addEventListener("click", (e) => {
    console.log("btnConfirmDeleteMontir clicked");
    if (e.target == btnConfirmDeleteMontir.querySelector(".btn-yes")) {
      console.log("btn yes");
      deleteMontir(montirId);
    }
    if (e.target == btnConfirmDeleteMontir.querySelector(".btn-no")) {
      console.log("btn no");
      overlay.remove();
      cardDeleteMontirConfirm.remove();
    }
  });
};

export const showMontirList = function (section) {
  if (section == settingMontirSection) {
    getDocs(collection(db, `userBengkel/${currentUser.uid}/userMontir`)).then(
      (snapshot) => {
        if (snapshot.docs.length !== 0) {
          console.log("showmontirlist settingMontirSection : ", snapshot.docs);

          noMontirSetting.style.display = "none";
          if (montirSettingList.children.length !== 0) {
            let child = montirSettingList.firstElementChild;
            while (child) {
              montirSettingList.removeChild(child);
              child = montirSettingList.firstElementChild;
            }
          }

          snapshot.forEach((doc) => {
            const montirData = doc.data();
            console.log(doc.id);
            console.log(montirData);

            const montirHTML = `<div class="montir">
				<p class="montir-name">${montirData.montirName} <span>${montirData.phoneNumber}</span></p>
				<button class="btn btn-delete-montir" data-id="${doc.id}">
				<svg viewBox="0 0 32 32">
				<use href="#trash"></use>
				</svg>
				Hapus
				</button>
			</div>`;
            montirSettingList.insertAdjacentHTML("beforeend", montirHTML);
            console.log(montirSettingList);
            const btnDeleteMontir = montirSettingList.querySelector(
              `[data-id="${doc.id}"]`
            );
            console.log(btnDeleteMontir);
            btnDeleteMontir.addEventListener("click", (e) =>
              showDeleteConfirm(doc.id)
            );
          });
        }
        if (snapshot.docs.length == 0) {
          if (montirSettingList.children.length !== 0) {
            let child = montirSettingList.firstElementChild;
            while (child) {
              montirSettingList.removeChild(child);
              child = montirSettingList.firstElementChild;
            }
            noMontir.style.display = "block";
          }
        }
      }
    );
  }

  if (section != settingMontirSection) {
    getDocs(
      query(
        collection(db, `userBengkel/${currentUser.uid}/userMontir`),
        where("isLogin", "==", true)
      )
    )
      .then((snapshot) => {
        if (snapshot.docs.length !== 0) {
          console.log("showmontirlist : ", snapshot.docs);

          if (section === orderNotification) {
            noMontirSelectMontir.style.display = "none";
            if (selectMontirList.children.length !== 0) {
              let child = selectMontirList.firstElementChild;
              while (child) {
                selectMontirList.removeChild(child);
                child = selectMontirList.firstElementChild;
              }
            }
            // let montirOn = [];
            snapshot.forEach((doc) => {
              const montirData = doc.data();
              if (montirData.montirStatus) {
                // montirOn.push(montirData);
                const montirListHTML = `
				  <div class="form-radio">
						<input type="radio" name="montirId" id="${montirData.montirName}" 
							value="${doc.id}" />
							<label for="${montirData.montirName}">${montirData.montirName} <br>${montirData.phoneNumber}</label>
					</div>`;
                selectMontirList.insertAdjacentHTML(
                  "beforeend",
                  montirListHTML
                );
              }
            });
            cardSelectMontir.classList.add("center-open");
            const overlay = document.createElement("div");
            overlay.classList.add("overlay");
            orderNotification.insertBefore(overlay, cardSelectMontir);
            overlay.addEventListener("click", (e) => {
              overlay.remove();
              cardSelectMontir.classList.remove("center-open");
            });
            // if (montirOn.length == 0) {
            //   let child = selectMontirList.firstElementChild;
            //   while (child) {
            //     selectMontirList.removeChild(child);
            //     child = selectMontirList.firstElementChild;
            //   }
            //   noMontir.style.display = "block";
            // }
          }

          if (section === mainBengkelSection) {
            console.log("section mainBengkelSection");
            noMontir.style.display = "none";
            if (montirContainer.children.length !== 0) {
              let child = montirContainer.firstElementChild;
              while (child) {
                montirContainer.removeChild(child);
                child = montirContainer.firstElementChild;
              }
            }
            snapshot.forEach((doc) => {
              const montirData = doc.data();
              console.log(doc.id);
              console.log(montirData);
              montirList;
              let checkBoxHTML;
              if (montirData.montirStatus) {
                checkBoxHTML = `<input type="checkbox" id="${doc.id}" value="${doc.id}" class="checkbox" checked />`;
              }
              if (!montirData.montirStatus) {
                checkBoxHTML = `<input type="checkbox" id="${doc.id}" value="${doc.id}" class="checkbox" />`;
              }
              const montirHTML = `
			  <div class="montir">
			  <p class="montir-name">${montirData.montirName} <span>${montirData.phoneNumber}</span></p>
						<div class="montir-toggle">
						${checkBoxHTML}
						  <label for="${doc.id}" class="toggle"></label>
						</div>
					</div>`;
              montirContainer.insertAdjacentHTML("beforeend", montirHTML);
              const checkbox = document.getElementById(`${doc.id}`);
              checkbox.addEventListener("click", (e) => {
                if (bengkelStatus === "closed") return;
                if (checkbox.checked) {
                  console.log("checked");
                  changeMontirStatus(doc.id, true);
                }
                if (!checkbox.checked) {
                  console.log("unchecked");
                  changeMontirStatus(doc.id, false);
                }
              });
            });
          }
          //   if (section === settingMontirSection) {
          //     noMontirSetting.style.display = "none";
          //     if (montirSettingList.children.length !== 0) {
          //       let child = montirSettingList.firstElementChild;
          //       while (child) {
          //         montirSettingList.removeChild(child);
          //         child = montirSettingList.firstElementChild;
          //       }
          //     }
          //     snapshot.forEach((doc) => {
          //       const montirData = doc.data();
          //       console.log(doc.id);
          //       console.log(montirData);

          //       const montirHTML = `<div class="montir">
          // 	<p class="montir-name">${montirData.montirName} <span>${montirData.phoneNumber}</span></p>
          // 	<button class="btn btn-delete-montir" data-id="${doc.id}">
          // 	<svg viewBox="0 0 32 32">
          // 	<use href="#trash"></use>
          // 	</svg>
          // 	Hapus
          // 	</button>
          // </div>`;
          //       montirSettingList.insertAdjacentHTML("beforeend", montirHTML);
          //       console.log(montirSettingList);
          //       const btnDeleteMontir = montirSettingList.querySelector(
          //         `[data-id="${doc.id}"]`
          //       );
          //       console.log(btnDeleteMontir);
          //       btnDeleteMontir.addEventListener("click", (e) =>
          //         showDeleteConfirm(doc.id)
          //       );
          //     });
          //   }
        }
        if (snapshot.docs.length == 0) {
          console.log("no montir is login");

          if (section === orderNotification) {
            if (selectMontirList.children.length !== 0) {
              let child = selectMontirList.firstElementChild;
              while (child) {
                selectMontirList.removeChild(child);
                child = selectMontirList.firstElementChild;
              }
              noMontir.style.display = "block";
            }
          }
          //   if (section === settingMontirSection) {
          //     if (montirSettingList.children.length !== 0) {
          //       let child = montirSettingList.firstElementChild;
          //       while (child) {
          //         montirSettingList.removeChild(child);
          //         child = montirSettingList.firstElementChild;
          //       }
          //       noMontir.style.display = "block";
          //     }
          //   }
          if (section === mainBengkelSection) {
            if (montirContainer.children.length !== 0) {
              let child = montirContainer.firstElementChild;
              while (child) {
                montirContainer.removeChild(child);
                child = montirContainer.firstElementChild;
              }
              noMontir.style.display = "block";
            }
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

const openOrderDetail = function (orderData, orderId) {
  orderNowId = orderId;

  //   waitingCardBengkel.classList.remove(".center-open");
  moveSection(mainBengkelSection, orderNotification);

  getDoc(doc(db, `userBengkel`, `${currentUser.uid}`)).then((userDoc) => {
    const bengkelObject = userDoc.data();

    const [lng, lat] = bengkelObject.bengkelCoords;
    const position = { coords: { latitude: lat, longitude: lng } };
    console.log("position : ", position);
    loadMap(position, "map-order-notification");
    showOrderRoute(
      bengkelObject.bengkelCoords,
      orderData.userCoords,
      mapOrderNotification
    );
  });

  cardOrderInfo.classList.add("brief-second");

  orderNotification.querySelector(
    ".order-distance"
  ).textContent = `${orderData.travelTime} menit  (${orderData.travelDistance})`;
  orderNotification.querySelector(
    ".name"
  ).textContent = `${orderData.pengendaraName}`;
  orderNotification.querySelector(
    ".problem-desc"
  ).textContent = `${orderData.problem}`;
  orderNotification.querySelector(
    ".btn-wa"
  ).href = `https://wa.me/${orderData.pengendara_phoneNumber}?text=Halo,%20saya%20montir%20yang%20kamu%20pesan%20`;
};

export const rejectOrder = async function () {
  try {
    // Set order status to rejected
    await updateDoc(
      doc(db, `userBengkel`, `${currentUser.uid}`, `orders`, `${orderNowId}`),
      {
        status: "rejected",
      }
    );
  } catch (err) {
    return err.message;
  }
};

let custOrderCard;
export let unsubWatchBengkel;
export const watchRequestOrders = function () {
  console.log("wathcRequestOrders . . .");
  // Newest Version
  unsubWatchBengkel = onSnapshot(
    query(collection(db, `userBengkel/${currentUser.uid}/orders`)),
    (querySnapshot) => {
      querySnapshot.docChanges().forEach((change) => {
        // console.log("order changes");
        if (change.type === "added") {
          console.log("order added");
          const orderData = change.doc.data();
          if (orderData.status === "waiting") {
            console.log("cek orderData", orderData);
            if (serviceContainer.classList.contains("no-cust")) {
              serviceContainer.classList.remove("no-cust");
              serviceContainer.classList.add("is-cust");
            }
            //   orderContainer.innerHTML = "";
            console.log(orderData);
            const cardOrderHTML = `
				<div class="card cust-order">
				<div>
				<p class="cust-name">${orderData.pengendaraName}</p>
				<p class="travel-time">
				${orderData.travelTime} menit (<span class="travel-distance">${orderData.travelDistance}</span>)
				</p>
				</div>
				<button  class="btn btn-order-detail" data-id="${change.doc.id}">Lihat detail</button>
				</div>`;

            orderContainer.insertAdjacentHTML("afterbegin", cardOrderHTML);
            const btnOrderDetail =
              orderContainer.querySelector(".btn-order-detail");
            btnOrderDetail.addEventListener("click", async function (e) {
              const status = await checkOnlineStatus();
              if (status === true) {
                openOrderDetail(orderData, e.target.dataset.id);
                console.log("detail click!", e.target.dataset.id);
                console.log("orderData : ", orderData);
              }
              if (status === false) {
                showModalNoInternet(mainBengkelSection);
                return;
              }
            });
          }
        }
        if (change.type === "modified") {
          const orderData = change.doc.data();
          if (orderData.status === "running") {
            console.log("order modified running");
            orderNotification.querySelector(".overlay").remove();
            waitingCardBengkel.classList.remove("center-open");
            confirmCardBengkel.classList.add("center-open");
            confirmCardBengkel.querySelector("p").textContent =
              "Montir telah berangkat";
            const overlay = document.createElement("div");
            overlay.classList.add("overlay");
            orderNotification.insertBefore(overlay, confirmCardBengkel);
            overlay.addEventListener("click", (e) => {
              overlay.remove();
              confirmCardBengkel.classList.remove("center-open");
              moveSection(orderNotification, mainBengkelSection);
            });
          }
          if (orderData.status === "requestingCost") {
            console.log("order modified requestingCost");

            if (appState !== sendCostSection)
              moveSection(appState, sendCostSection);

            const requestHTML = `
					<div class="card request" data-id="${change.doc.id}">
					<p class="request-info request--montir">
					Montir : <br />
					<span>${orderData.montirName}</span>
					</p>
					<p class="request-info request--problem">
					Masalah motor : <br />
					<span>${orderData.detailedProblem}</span>
					</p>
					<div class="request-info request--cost">
					<p>Biaya :</p>
					<form>
						<input
						type="number"
						name="cost"
						id="cost"
						placeholder="misal: 50.000"
						/>
						<button class="btn btn-submit-form">Kirim</button>
						<button class="btn btn-load" style="display: none">
						<div class="lds-ring">
							<div></div>
							<div></div>
							<div></div>
							<div></div>
						</div>
						</button>
					</form>
					</div>
					</div>`;
            sendCostRequestContainer.insertAdjacentHTML(
              "afterbegin",
              requestHTML
            );
            const sendCostRequest = sendCostRequestContainer.querySelector(
              `[data-id="${change.doc.id}"]`
            );
            const formSendCost = sendCostRequest.querySelector("form");
            formSendCost.addEventListener("submit", async (e) => {
              e.preventDefault();

              checkOnlineStatus().then(async (status) => {
                if (status === true) {
                  createLoadingBtn(formSendCost);
                  await setDoc(
                    doc(
                      db,
                      `userBengkel`,
                      `${currentUser.uid}`,
                      `orders`,
                      `${change.doc.id}`
                    ),
                    {
                      cost: `${formSendCost["cost"].value}`,
                      status: "costDelivered",
                    },
                    {
                      merge: true,
                    }
                  );
                  showModalMessage(
                    sendCostSection,
                    "Total biaya berhasil dikirim"
                  );
                  sendCostRequest.remove();
                  if (sendCostRequestContainer.children.length == 0) {
                    moveSection(appState, mainBengkelSection);
                  }
                }
                if (status === false) {
                  showModalNoInternet(sendCostSection);
                }
              });
            });
          }

          if (orderData.status === "accepted") {
            console.log("order modified accepted");
          }
          if (orderData.status === "rejected") {
            // const orderData = change.doc.data();
            // Remove order card
            console.log("Order Rejected");
            orderContainer
              .querySelector(`[data-id="${change.doc.id}"]`)
              .closest(".cust-order")
              .remove();
            if (orderContainer.children.length == 0) {
              serviceContainer.classList.remove("is-cust");
              serviceContainer.classList.add("no-cust");
            }
            // Remove reject confirm card
            if (
              orderNowId === change.doc.id &&
              rejectOrderConfirm.classList.contains("center-open")
            ) {
              rejectOrderConfirm.classList.remove("center-open");
              orderNotification.querySelector(".overlay").remove();
              // Back to main bengkel section
              moveSection(orderNotification, mainBengkelSection);
            }
            if (
              orderNowId == change.doc.id &&
              appState === orderNotification &&
              !rejectOrderConfirm.classList.contains("center-open")
            ) {
              moveSection(orderNotification, mainBengkelSection);
            }
          }
        }
      });
    }
  );

  // Ini harusnya realtime data, nanti diupdate oke
  //   getDocs(
  //     query(
  //       collection(db, `userBengkel/${currentUser.uid}/orders`),
  //       where("status", "==", "waiting")
  //     )
  //   )
  //     .then((snapshot) => {
  //       if (snapshot.docs.length !== 0) {
  //         console.log("cek", snapshot);
  //         serviceContainer.classList.add("is-cust");
  //         orderContainer.innerHTML = "";
  //         snapshot.forEach((doc) => {
  //           const orderData = doc.data();
  //           console.log(doc.id);
  //           console.log(orderData);
  //           const cardOrderHTML = `
  // 	  <div class="card cust-order">
  // 	  <div>
  // 	  <p class="cust-name">${orderData.pengendaraName}</p>
  // 	  <p class="travel-time">
  // 	  ${orderData.travelTime} menit (<span class="travel-distance">${orderData.travelDistance} KM</span>)
  // 	  </p>
  // 	  </div>
  // 	  <button class="btn btn-order-detail">Lihat detail</button>
  // 			</div>`;

  //           orderContainer.insertAdjacentHTML("beforeend", cardOrderHTML);
  //         });
  //       }
  //     })
  // .catch((err) => {
  //   console.log(err);
  // });
};

export const commandMontir = async function () {
  try {
    // remove order card
    removeLoadingBtn(formSelectMontir);
    console.log("orderNowId : ", orderNowId);
    orderContainer
      .querySelector(`[data-id="${orderNowId}"]`)
      .closest(".cust-order")
      .remove();
    if (orderContainer.children.length == 0) {
      serviceContainer.classList.remove("is-cust");
      serviceContainer.classList.add("no-cust");
    }
    // get input from form select montir
    const montirSelectedUid = `${formSelectMontir["montirId"].value}`;
    console.log("montirSelectedUid : ", montirSelectedUid);
    if (montirSelectedUid == null) {
      showInputError(formSelectMontir);
      return;
    }

    //   get nama montir from montir doc
    const montirDoc = await getDoc(
      doc(
        db,
        `userBengkel`,
        `${currentUser.uid}`,
        `userMontir`,
        `${montirSelectedUid}`
      )
    );
    const montirData = montirDoc.data();

    console.log("commandMontir montirData : ", montirData);

    //   set montir yang dipilih pada order doc
    await setDoc(
      doc(db, `userBengkel`, `${currentUser.uid}`, `orders`, `${orderNowId}`),
      { montirId: `${montirSelectedUid}`, montirName: montirData.montirName },
      {
        merge: true,
      }
    );

    //   update order status to "Accepted"
    await updateDoc(
      doc(db, `userBengkel`, `${currentUser.uid}`, `orders`, `${orderNowId}`),
      {
        status: "accepted",
      }
    );

    cardSelectMontir.classList.remove("center-open");
    // orderNotification.querySelector('.overlay').remove();
    //   waitingCardBengkel.querySelector("p").textContent =
    //     "Menunggu keberangkatan montir..";
    waitingCardBengkel.classList.add("center-open");
  } catch (err) {
    console.log("err commandmontir : ", err.message);
  }
};

export const updateBengkelStatus = function (status) {
  if (status === "open") {
    setDoc(
      doc(db, `userBengkel`, `${currentUser.uid}`),
      { bengkelOpen: true },
      {
        merge: true,
      }
    )
      .then(() => {
        console.log("berhasil update bengkel open!");
        mainBengkelSection.classList.remove("is-closed");
        mainBengkelSection.classList.add("is-open");
        bengkelInitPage.style.display = "none";
        serviceState.style.display = "block";
      })
      .catch((err) => console.log(err.message));
  }
  if (status === "close") {
    setDoc(
      doc(db, `userBengkel`, `${currentUser.uid}`),
      { bengkelOpen: false },
      {
        merge: true,
      }
    )
      .then(() => {
        console.log("berhasil update bengkel close!");
        mainBengkelSection.classList.remove("is-open");
        mainBengkelSection.classList.add("is-closed");
        bengkelInitPage.style.display = "none";
        serviceState.style.display = "block";
      })
      .catch((err) => console.log(err.message));
  }
};

export const updateAllMontirStatus = async function (status) {
  console.log("update all montir status", status);
  const snapshot = await getDocs(
    query(collection(db, `userBengkel/${currentUser.uid}/userMontir`))
  );
  snapshot.forEach((doc) => {
    console.log("updating . . .", doc.id);
    changeMontirStatus(doc.id, status);
  });
};

export const signingOutBengkel = function () {
  //   deleteNotificationTokens({ uid: currentUser.uid }).then((result) => {
  //     console.log(result);
  //     signOut(auth).then(() => {
  //       console.log("bengkel successfully signout");
  //       moveSection(appState, openingSection);
  //     });
  //   });
  if (map) removeMap();
  if (unsubWatchBengkel) unsubWatchBengkel();
  if (unsubWatchMontirIsLogin) unsubWatchMontirIsLogin();
  updateDoc(doc(db, `userBengkel`, `${currentUser.uid}`), {
    notificationTokens: deleteField(),
    bengkelOpen: false,
  }).then(() => {
    console.log("update bengkelstatus success");
    updateAllMontirStatus(false).then(() => {
      console.log("update bengkelstatus success");
      signOut(auth).then(() => {
        console.log("bengkel successfully signout");
        bengkelInitPage.style.display = "flex";
        serviceState.style.display = "none";
        moveSection(appState, openingSection);
        window.location.reload();
      });
    });
  });
};
let unsubWatchMontirIsLogin;
const watchMontirIslogin = function () {
  console.log("watchMontirIslogin . . .");
  unsubWatchMontirIsLogin = onSnapshot(
    query(collection(db, `userBengkel/${currentUser.uid}/userMontir`)),
    (querySnapshot) => {
      if (querySnapshot.docChanges().length > 0) {
        if (appState == mainBengkelSection) {
          showMontirList(mainBengkelSection);
        }
        // if (appState == orderNotification) {
        //   showMontirList(orderNotification);
        // }
      }
    }
  );
};

export const mainBengkelConfig = async function () {
  try {
    const bengkelDoc = await getDoc(
      doc(db, `userBengkel`, `${currentUser.uid}`)
    );
    const bengkelData = bengkelDoc.data();
    console.log("bengkelData.bengkelopen : ", bengkelData.bengkelOpen);
    if (bengkelData.bengkelOpen) {
      //   Init Page
      updateBengkelStatus("open");
      updateAllMontirStatus(false);
      if (unsubWatchBengkel) unsubWatchBengkel();
      watchRequestOrders();
      if (unsubWatchMontirIsLogin) unsubWatchMontirIsLogin();
      watchMontirIslogin();
      changeBengkelStatusVariable("open");
      console.log("bengkelStatus mainbengkelconfig: ", bengkelStatus);
      bengkelProfileName.textContent = bengkelData.bengkelName;
      bengkelProfileOpenTime.textContent = `${bengkelData.openTime}-${bengkelData.closeTime}`;

      //   Show order list
      //   const orderDocs = await getDocs(
      //     query(
      //       collection(db, `userBengkel/${currentUser.uid}/orders`),
      //       where("status", "==", "waiting")
      //     )
      //   );
      //   orderDocs.forEach((orderDoc) => {
      //     const orderData = orderDoc.data();
      //     console.log("cek orderData", orderData);
      //     if (serviceContainer.classList.contains("no-cust")) {
      //       serviceContainer.classList.remove("no-cust");
      //       serviceContainer.classList.add("is-cust");
      //     }
      //     //   orderContainer.innerHTML = "";
      //     console.log(orderData);
      //     const cardOrderHTML = `
      // 			<div class="card cust-order">
      // 			<div>
      // 			<p class="cust-name">${orderData.pengendaraName}</p>
      // 			<p class="travel-time">
      // 			${orderData.travelTime} menit (<span class="travel-distance">${orderData.travelDistance}</span>)
      // 			</p>
      // 			</div>
      // 			<button  class="btn btn-order-detail" data-id="${orderDoc.id}">Lihat detail</button>
      // 			</div>`;

      //     orderContainer.insertAdjacentHTML("afterbegin", cardOrderHTML);
      //     const btnOrderDetail =
      //       orderContainer.querySelector(".btn-order-detail");
      //     btnOrderDetail.addEventListener("click", async function (e) {
      //       const status = await checkOnlineStatus();
      //       if (status === true) {
      //         openOrderDetail(orderData, e.target.dataset.id);
      //         console.log("detail click!", e.target.dataset.id);
      //         console.log("orderData : ", orderData);
      //       }
      //       if (status === false) {
      //         showModalNoInternet(mainBengkelSection);
      //         return;
      //       }
      //     });
      //   });
    }
    if (!bengkelData.bengkelOpen) {
      updateBengkelStatus("close");
      updateAllMontirStatus(false);
      if (unsubWatchBengkel) unsubWatchBengkel();
      changeBengkelStatusVariable("close");
      if (unsubWatchMontirIsLogin) unsubWatchMontirIsLogin();
      watchMontirIslogin();
      console.log("bengkelStatus mainbengkelconfig: ", bengkelStatus);
      bengkelProfileName.textContent = bengkelData.bengkelName;
      bengkelProfileOpenTime.textContent = `${bengkelData.openTime}-${bengkelData.closeTime}`;
    }
  } catch (err) {
    console.log("err bengkelpengendara config", err.message);
    signOut(auth).then(() => {
      console.log("bengkel successfully signout");
      bengkelInitPage.style.display = "flex";
      serviceState.style.display = "none";
      moveSection(appState, openingSection);
    });
  }
};
