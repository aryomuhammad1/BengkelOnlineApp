

cardMontirArrivedMontir
  .querySelector(".btn-yes")
  .addEventListener("click", () => {
    removeMap();
    moveSection(montirOtwSection, mainMontirSection);
    cardMontirOtwInfo.classList.remove("brief-bottom");
    document.querySelector(".overlay").remove();
    cardMontirArrivedMontir.classList.remove("center-open");

    // open requesting cost card
    cardRequestingCost.classList.add("center-open");
    const overlay = document.createElement("div");
    overlay.classList.add("overlay");
    mainMontirSection.insertBefore(overlay, cardRequestingCost);
  });

cardShowCost
  .querySelector(".btn-submit-form")
  .addEventListener("click", (e) => {
    e.preventDefault();
    updateDoc(
      doc(
        db,
        `userBengkel`,
        `${montirData.bengkelUid}`,
        `orders`,
        `${nowOrderId}`
      ),
      {
        status: "costPaid",
      }
    ).then(() => {
      overlay.remove();
      cardShowCost.remove();
    });
  });

const formSendCost = sendCostRequest.querySelector("form");
formSendCost.addEventListener("submit", async (e) => {
  e.preventDefault();
  await setDoc(
    doc(db, `userBengkel`, `${currentUser.uid}`, `orders`, `${change.doc.id}`),
    {
      cost: `${formSendCost["cost"].value}`,
      status: "costDelivered",
    },
    {
      merge: true,
    }
  );
  showModalSuccess(sendCostSection, "Total biaya berhasil dikirim");
  sendCostRequest.remove();
  if (sendCostRequestContainer.children.length == 0) {
    moveSection(appState, mainBengkelSection);
  }
});

const cardShowCostHTML = `
		<div class="card show-cost center-open">
			<p class="show-cost-info show-cost--problem">
			Masalah motor : <br />
			<span
				>${orderData.detailedProblem}
			</span>
			</p>
			<p class="show-cost-info show-cost--cost">
			Biaya : <br />
			<span>Rp. ${orderData.cost}</span>
			</p>
			<p class="show-cost-info">
			Menunggu konfirmasi pembayaran oleh Montir...
			</p>
		</div>`;
mainPengendaraSection.insertAdjacentHTML("beforeend", cardShowCostHTML);
const cardShowCost = mainPengendaraSection.querySelector(".show-cost");
const overlay = document.createElement("div");
overlay.classList.add("overlay");
mainPengendaraSection.insertBefore(overlay, cardShowCost);

export const montirIsArrived = async function () {
  await updateDoc(
    doc(
      db,
      `userBengkel`,
      `${montirData.bengkelUid}`,
      `orders`,
      `${nowOrderId}`
    ),
    {
      status: "arrived",
    }
  );
  cardMontirArrivedMontir.classList.add("center-open");
  const overlay = document.createElement("div");
  overlay.classList.add("overlay");
  montirOtwSection.insertBefore(overlay, cardMontirArrivedMontir);
  clearInterval(countingInterval);
  navigator.geolocation.clearWatch(watchPosId);
};

const montirOtw = function () {
  cardMontirOrderInfo.classList.remove("brief-second");
  cardMontirOtwInfo.classList.add("brief-bottom");

  countingMontirOtw(nowOrderData.travelTime, montirOtwSection, "montir");
  getDoc(doc(db, `userBengkel`, `${montirData.bengkelUid}`)).then((userDoc) => {
    const bengkelData = userDoc.data();

    const [lng, lat] = bengkelData.bengkelCoords;
    const position = { coords: { latitude: lat, longitude: lng } };
    loadMap(position, "map-montir-otw");
    showOrderRoute(
      bengkelData.bengkelCoords,
      nowOrderData.userCoords,
      mapMontirOtw
    );

    liveGuide(position);
    watchPosId = navigator.geolocation.watchPosition(liveGuide, function () {
      alert("Cannot get your live location");
    });
  });
};

const openMontirOrderDetail = function (nowOrderData) {
  checkOnlineStatus().then((status) => {
    moveSection(mainMontirSection, montirOrderInformation);
    getDoc(doc(db, `userBengkel`, `${montirData.bengkelUid}`)).then(
      (userDoc) => {
        const bengkelData = userDoc.data();
        const [lng, lat] = bengkelData.bengkelCoords;
        const position = { coords: { latitude: lat, longitude: lng } };
        loadMap(position, "map-montir-order-info");
        showOrderRoute(
          bengkelData.bengkelCoords,
          nowOrderData.userCoords,
          mapMontirOrderNotification
        );
      }
    );
    cardMontirOrderInfo.classList.add("brief-second");
    montirOrderInformation.querySelector(
      ".order-distance"
    ).textContent = `${nowOrderData.travelTime} (${nowOrderData.travelDistance})`;
    montirOrderInformation.querySelector(
      ".name"
    ).textContent = `${nowOrderData.pengendaraName}`;
    montirOrderInformation.querySelector(
      ".btn-wa"
    ).href = `https://wa.me/${nowOrderData.pengendara_phoneNumber}?text=
				Halo,%20saya%20montir%20yang%20kamu%20pesan%20`;
    montirOrderInformation.querySelector(
      ".problem-desc"
    ).textContent = `${nowOrderData.problem}`;
  });
};

const watchBengkelCommand = function () {
  checkOnlineStatus().then((status) => {
    if (status === true) {
      onSnapshot(
        query(collection(db, `userBengkel/${montirData.bengkelUid}/orders`)),
        (querySnapshot) => {
          querySnapshot.docChanges().forEach((change) => {
            if (change.type === "modified") {
              nowOrderData = change.doc.data();
              if (
                nowOrderData.status === "accepted" &&
                nowOrderData.montirName === montirData.montirName
              ) {
                nowOrderId = change.doc.id;
                openMontirOrderDetail(nowOrderData);
              }
              if (
                nowOrderData.status === "arrived" &&
                nowOrderData.montirName === montirData.montirName
              ) {
              }
            }
          });
        }
      );
    }
    if (status === false) {
      showModalNoInternet(mainMontirSection);
      return;
    }
  });
};

export const mainMontirConfig = async function () {
  try {
    const snapshot = await getDocs(collection(db, `userBengkel`));
    snapshot.docs.forEach(async function (snap) {
      const montirDoc = await getDoc(
        doc(db, `userBengkel/${snap.id}/userMontir/${currentUser.phoneNumber}`)
      );
      montirData = montirDoc.data();
      if (montirData != undefined) {
        montirName = montirData.montirName;
        montirPhoneNumber = montirData.phoneNumber;
        mainMontirSection.querySelector(
          ".montir-name"
        ).textContent = `${montirName}`;
        mainMontirSection.querySelector(
          ".montir-number"
        ).textContent = `${montirPhoneNumber}`;
        openingSection.classList.remove("active");
        moveSection(appState, mainMontirSection);
        watchBengkelCommand();
        return;
      }
    });
  } catch (err) {
    signOut(auth).then(() => {
      moveSection(appState, openingSection);
    });
  }
};

// export const submitAddMontir = function (e) {
// 	e.preventDefault();
// 	const montirObj = {
// 	  phoneNumber: `+62${formAddMontir["phone-number"].value}`,
// 	  montirName: formAddMontir["montir-name"].value,
// 	  montirStatus: false,
// 	  bengkelUid: currentUser.uid,
// 	};
// 	// Form Validation
// 	if (isObjFull(montirObj) === false) {
// 	  showInputError(formAddMontir);
// 	  removeLoadingBtn(formAddMontir);
// 	  return;
// 	}
// 	if (montirObj.phoneNumber === "+62") {
// 	  showInputError(formAddMontir);
// 	  removeLoadingBtn(formAddMontir);
// 	  return;
// 	}
// 	// Saving new data
// 	setDoc(
// 	  doc(
// 		db,
// 		`userBengkel/${currentUser.uid}/userMontir/${montirObj.phoneNumber}`
// 	  ),
// 	  montirObj
// 	)
// 	  .then(() => {
// 		formAddMontir.reset();
// 		moveSection(addMontirSection, settingMontirSection);
// 		showMontirList(settingMontirSection);
// 		showModalSuccess(settingMontirSection, "Tambah montir");
// 	  })
// 	  .catch((error) => console.log("addDoc Montir", error));
// };

// const deleteMontir = function (montirId) {
// 	// const montirId = montirId;
// 	deleteAuthUser({ phoneNumber: montirId })
// 		.then((result) => {
// 		deleteDoc(
// 			doc(db, `userBengkel/${currentUser.uid}/userMontir/${montirId}`)
// 		)
// 			.then(() => {
// 			//   Remove delete confirm card and overlay
// 			settingMontirSection
// 				.querySelector(`.delete-montir-confirm[data-id="${montirId}"]`)
// 				.remove();
// 			settingMontirSection.querySelector(".overlay").remove();
// 			//   Remove montir card on list
// 			montirSettingList
// 				.querySelector(`.btn-delete-montir[data-id="${montirId}"]`)
// 				.parentElement.remove();
// 			showModalSuccess(settingMontirSection, "Hapus montir");
// 			if (montirSettingList.children.length == 0) {
// 				noMontirSetting.style.display = "block";
// 			}
// 			// showMontirList(settingMontirSection);
// 			showMontirList(mainBengkelSection);
// 			})
// 			.catch((err) => console.log(err.message));
// 		})
// };

// const showDeleteConfirm = function (montirId) {
// 	const confirmHTML = `
// 		  <div class="card delete-montir-confirm center-open" data-id="${montirId}">
// 			  <p>Anda yakin ingin menghapus montir?</p>
// 			  <div class="buttons">
// 				  <button class="btn btn-yes"">Ya, saya yakin</button>
// 				  <button class="btn btn-no">Batal</button>
// 			  </div>
// 		  </div>`;
// 	settingMontirSection.insertAdjacentHTML("beforeend", confirmHTML);
// 	const cardDeleteMontirConfirm = settingMontirSection.querySelector(
// 	  ".delete-montir-confirm"
// 	);
// 	const btnConfirmDeleteMontir =
// 	  cardDeleteMontirConfirm.querySelector(".buttons");
// 	const overlay = document.createElement("div");
// 	overlay.classList.add("overlay");
// 	settingMontirSection.insertBefore(overlay, cardDeleteMontirConfirm);
// 	overlay.addEventListener("click", () => {
// 	  overlay.remove();
// 	  cardDeleteMontirConfirm.remove();
// 	});
// 	btnConfirmDeleteMontir.addEventListener("click", (e) => {
// 	  if (e.target == btnConfirmDeleteMontir.querySelector(".btn-yes")) {
// 		deleteMontir(montirId);
// 	  }
// 	  if (e.target == btnConfirmDeleteMontir.querySelector(".btn-no")) {
// 		overlay.remove();
// 		cardDeleteMontirConfirm.remove();
// 	  }
// 	});
//   };

// btnSettingMontir.addEventListener("click", () => {
// 	moveSection(mainBengkelSection, settingMontirSection);
// 	showMontirList(settingMontirSection);
//   });

// export const showProgressOrder = function () {
// 	getDocs(
// 	  query(
// 		collection(db, `userBengkel/${currentUser.uid}/orders`),
// 		where("status", "==", "running")
// 	  )
// 	)
// 	  .then((snapshot) => {
// 		if (progressOrderContainer.children.length !== 0) {
// 		  let child = progressOrderContainer.firstElementChild;
// 		  while (child) {
// 			progressOrderContainer.removeChild(child);
// 			child = progressOrderContainer.firstElementChild;
// 		  }
// 		}
// 		snapshot.forEach((doc) => {
// 		  const orderData = doc.data();
// 		  const cardProgressHTML = `
// 		  <div class="card order">
// 		  <div class="actor-info">
// 			<p class="order-montir">${orderData.montirName}</p>
// 			<svg
// 			  width="24px"
// 			  height="24px"
// 			  viewBox="0 0 24 24"
// 			  fill="none"
// 			  xmlns="http://www.w3.org/2000/svg"
// 			>
// 			  <path
// 				d="M13.4697 8.53033C13.1768 8.23744 13.1768 7.76256 13.4697
// 				7.46967C13.7626 7.17678 14.2374 7.17678 14.5303 7.46967L18.5303
// 				11.4697C18.8232 11.7626 18.8232 12.2374 18.5303 12.5303L14.5303
// 				16.5303C14.2374 16.8232 13.7626 16.8232 13.4697 16.5303C13.1768
// 				16.2374 13.1768 15.7626 13.4697 15.4697L16.1893 12.75H6.5C6.08579
// 				\12.75 5.75 12.4142 5.75 12C5.75 11.5858 6.08579 11.25 6.5 11.
// 				25H16.1893L13.4697 8.53033Z"
// 				fill="black"
// 			  />
// 			</svg>
// 			  <p class="order-name">${orderData.pengendaraName}</p>
// 		  </div>
// 		  <div>
// 			  <p class="went-at">Montir berangkat pada : ${orderData.wentAt}</p>
// 		  </div>
// 		  </div>`;

// 		  progressOrderSection.querySelector(".no-orders").style.display = "none";
// 		  progressOrderContainer.insertAdjacentHTML(
// 			"afterbegin",
// 			cardProgressHTML
// 		  );
// 		});
// 	  })
// 	  .catch((err) => {
// 		if (progressOrderContainer.children.length !== 0) {
// 		  let child = progressOrderContainer.firstElementChild;
// 		  while (child) {
// 			progressOrderContainer.removeChild(child);
// 			child = progressOrderContainer.firstElementChild;
// 		  }
// 		}
// 		progressOrderSection.querySelector(".no-orders").style.display = "block";
// 	  });
//   };

// export const showSuccessOrderCard = function (orderId) {
// 	getDoc(doc(db, `userBengkel/${currentUser.uid}/orders/${orderId}`)).then(
// 	  (doc) => {
// 		const orderData = doc.data();
// 		//   Open Card
// 		openSuccessOrder.classList.add("center-top-open");
// 		const overlay = document.createElement("div");
// 		overlay.classList.add("overlay");
// 		successOrderSection.insertBefore(overlay, openSuccessOrder);
// 		overlay.addEventListener("click", (e) => {
// 		  overlay.remove();
// 		  openSuccessOrder.classList.remove("center-top-open");
// 		});
// 		//   Load Data
// 		openSuccessOrder.querySelector(
// 		  ".order-date"
// 		).textContent = `${orderData.createdAt}`;
// 		openSuccessOrder.querySelector(
// 		  ".order-montir"
// 		).textContent = `Montir : ${orderData.montirName}`;
// 		openSuccessOrder.querySelector(
// 		  ".order-name"
// 		).textContent = `Pelanggan : ${orderData.pengendaraName}`;
// 		//   Loading Stars Review
// 		if (starsContainer.children.length !== 0) {
// 		  let child = starsContainer.firstElementChild;
// 		  while (child) {
// 			starsContainer.removeChild(child);
// 			child = starsContainer.firstElementChild;
// 		  }
// 		}
// 		const starsHTML = countingStarsIcon(orderData, "c-icon");
// 		starsContainer.insertAdjacentHTML("beforeend", starsHTML);
// 		openSuccessOrder.querySelector(
// 		  ".review-text"
// 		).textContent = `${orderData.review}`;
// 	  }
// 	);
// };

// export const showSuccessOrders = function () {
// 	getDocs(
// 	  query(
// 		collection(db, `userBengkel/${currentUser.uid}/orders`),
// 		where("status", "==", "success")
// 	  )
// 	)
// 	.then((snapshot) => {
// 	if (successOrderContainer.children.length !== 0) {
// 		let child = successOrderContainer.firstElementChild;
// 		while (child) {
// 		successOrderContainer.removeChild(child);
// 		child = successOrderContainer.firstElementChild;
// 		}
// 	}
// 	snapshot.forEach((doc) => {
// 		const orderData = doc.data();
// 		const cardSuccessHTML = `
// 		<div class="card order">
// 			<div>
// 				<p class="order-date">${orderData.createdAt}</p>
// 				<p class="order-name">${orderData.pengendaraName}</p>
// 			</div>
// 			<button class="btn btn-order-detail" data-id="${doc.id}">
// 			Lihat detail</button>
// 		</div>`;
// 		successOrderSection.querySelector(".no-orders").style.display = "none";
// 		successOrderContainer.insertAdjacentHTML("afterbegin", cardSuccessHTML);
// 		const btnShowSuccessOrder =
// 		successOrderContainer.querySelector(".btn-order-detail");
// 		btnShowSuccessOrder.addEventListener("click", (e) => {
// 		showSuccessOrderCard(e.target.dataset.id);
// 		});
// 	});
// 	})
// 	.catch((err) => {
// 	if (successOrderContainer.children.length !== 0) {
// 		let child = successOrderContainer.firstElementChild;
// 		while (child) {
// 		successOrderContainer.removeChild(child);
// 		child = successOrderContainer.firstElementChild;
// 		}
// 	}
// 	successOrderSection.querySelector(".no-orders").style.display = "block";
// 	});
// };

// export const submitEditBengkel = function () {
// 	getDoc(doc(db, `userBengkel`, `${currentUser.uid}`)).then((userDoc) => {
// 	  const userData = userDoc.data();
// 	  const userObj = {
// 		phoneNumber: `+62${formEditBengkel["phone-number"].value}`,
// 		ownerName: formEditBengkel["owner-name"].value,
// 		ktpNumber: formEditBengkel["ktp-number"].value,
// 		bengkelName: formEditBengkel["bengkel-name"].value,
// 		bengkelAddress: formEditBengkel["bengkel-address"].value,
// 		bengkelDesc: formEditBengkel["bengkel-description"].value,
// 		openTime: formEditBengkel["open-time"].value,
// 		closeTime: formEditBengkel["close-time"].value,
// 	  };
// 	  // Upload Foto to Cloud Storage
// 	  const promises = [];
// 	  Object.keys(uploadPics).forEach((key) => {
// 		arrayPics.push(key);
// 		const message = uploadPics[key];
// 		const storageRef = ref(storage, `${key}`);
// 		promises.push(uploadString(storageRef, message, "data_url"));
// 	  });
// 	  Promise.all(promises).then(() => {
// 		//   Update User phoneNumber
// 		if (userObj.phoneNumber !== userData.phoneNumber) {
// 		  recaptchaVerifierMaker("btn-update-profil");
// 		  // 82210176648
// 		  const appVerifier = window.recaptchaVerifier;
// 		  const phoneNumber = userObj.phoneNumber;
// 		  const provider = new PhoneAuthProvider(auth);
// 		  provider
// 			.verifyPhoneNumber(phoneNumber, appVerifier)
// 			.then(function (verificationId) {
// 			  let otpCode;
// 			  moveSection(editBengkelSection, otpVerifySection);
// 			  const timeOutId = setTimeout(() => {
// 				throw new Error("Time Out!");
// 			  }, 60000);
// 			  otpVerifySection.addEventListener("submit", submitOtpEditProfile);
// 			})
// 			.catch((err) => console.log("error verifyPhoneNumber : ", err));
// 		}
// 		//   Saving all new data to Firestore
// 		setDoc(doc(db, `userBengkel`, `${currentUser.uid}`), userObj, {
// 		  merge: true,
// 		})
// 		  .then(() => {
// 			// Saving Pic to Firestore
// 			updateDoc(doc(db, `userBengkel`, `${currentUser.uid}`), {
// 			  bengkelPhotos: arrayUnion(...arrayPics),
// 			//   Update User OwnerName
// 			if (userObj.name !== userData.name) {
// 			  let oldDisplayName = currentUser.displayName;
// 			  updateProfile(currentUser, {
// 				displayName: userObj.bengkelName,
// 			  })
// 				.then(() => {
// 				  getDocs(
// 					query(
// 					  collection(db, `userbengkel/${currentUser.uid}/userMontir`),
// 					  where("bengkelName", "==", oldDisplayName)
// 					)
// 				  ).then((snapshot) => {
// 					snapshot.forEach((doc) => {
// 					  setDoc(
// 						doc(
// 						  db,
// 						  `userbengkel/${currentUser.uid}/userMontir`,
// 						  `${doc.id}`
// 						),
// 						{ bengkelName: currentUser.displayName },
// 						{
// 						  merge: true,
// 						}
// 					  ).then(() => {
// 					  });
// 					});
// 				  });
// 				  getDocs(
// 					query(
// 					  collection(db, "order"),
// 					  where("bengkelName", "==", oldDisplayName)
// 					)
// 				  ).then((snapshot) => {
// 					snapshot.forEach((doc) => {
// 					  setDoc(
// 						doc(db, "order", `${doc.id}`),
// 						{ bengkelName: currentUser.displayName },
// 						{ merge: true }
// 					  ).then(() => {
// 					  });
// 					});
// 				  });
// 				})
// 				.catch((err) => console.log(err));
// 			}
// 			outputEdit.innerHTML = "";
// 			uploadPics = {};
// 			downloadPics = [];
// 			arrayPics = [];
// 			otpVerifySection.removeEventListener("submit", submitOtpEditProfile);
// 			moveSection(editBengkelSection, mainBengkelSection);
// 			bengkelProfileName.textContent = `${userObj.bengkelName}`;
// 			bengkelProfileOpenTime.textContent = `${userObj.openTime}-${userObj.closeTime}`;
// 			showModalSuccess(mainBengkelSection, "Ubah profil");
// 		  })
// 		  .catch((error) => console.log(error));
// 	  });
// 	});
//   };

// <label class="ham-label">
// 	<input type="checkbox" />
// 	<span class="menu"> <span class="hamburger"></span> </span>
// 	<ul>
// 		<li><a href="#" class="btn-edit-bengkel">Ubah Profil</a></li>
// 		<li>
// 		<a href="#" class="btn-edit-location-bengkel"
// 			>Ubah Lokasi Bengkel</a
// 		>
// 		</li>
// 		<li><a href="#" class="btn-success-order">Panggilan Sukses</a></li>
// 		<li>
// 		<a href="#" class="btn-on-progress-order">Panggilan Diproses</a>
// 		</li>
// 		<li><a href="#" class="btn-setting-montir">Pengaturan Montir</a></li>
// 		<li>
// 		<button class="btn btn-install-app">
// 			<svg
// 			height="800px"
// 			width="800px"
// 			version="1.1"
// 			id="_x32_"
// 			xmlns="http://www.w3.org/2000/svg"
// 			xmlns:xlink="http://www.w3.org/1999/xlink"
// 			viewBox="0 0 512 512"
// 			xml:space="preserve"
// 			>
// 			<g>
// 				<path
// 				class="st0"
// 				d="M426.537,0H179.641c-22.243,0-40.376,18.175-40.376,40.401v129
// 				.603h25.221V69.106h277.206V424.46H164.485
// 				v-83.887h-25.221v131.034c0,22.192,18.133,40.392,40.376,40.392h246
// 				.896c22.192,0,40.375-18.2,40.375-40.392v-129.03V40.401
// 				C466.912,18.175,448.728,0,426.537,0z M303.08,478.495c-9.174,0-16
// 				.636-7.47-16.636-16.661c0-9.183,7.462-16.653,16.636-16.653
// 				c9.158,0,16.686,7.47,16.686,16.653C319.766,471.025,312.247,478
// 				.495,303.08,478.495z"
// 				/>
// 				<polygon
// 				class="st0"
// 				points="225.739,335.774 358.778,255.289 225.739,174.804 225.739
// 				,221.11 45.088,221.11 45.088,289.468
// 				225.739,289.468 	"
// 				/>
// 			</g></svg
// 			>Install aplikasi
// 		</button>
// 		</li>
// 		<li><button class="btn btn-logout">Logout</button></li>
// 	</ul>
// </label>

// cardSelectMontir.classList.remove("center-open");
// waitingCardBengkel.querySelector("p").textContent = "Menunggu keberangkatan montir..";
// waitingCardBengkel.classList.add("center-open");

// export const commandMontir = async function () {
//   try {
//     // remove order card
//     removeLoadingBtn(formSelectMontir);
//     orderContainer
//       .querySelector(`[data-id="${orderNowId}"]`)
//       .closest(".cust-order")
//       .remove();
//     if (orderContainer.children.length == 0) {
//       serviceContainer.classList.remove("is-cust");
//       serviceContainer.classList.add("no-cust");
//     }
//     // get input from form select montir
//     const montirSelectedUid = `${formSelectMontir["montirId"].value}`;
//     if (montirSelectedUid == null) {
//       showInputError(formSelectMontir);
//       return;
//     }
//     //   get nama montir from montir doc
//     const montirDoc = await getDoc(
//       doc(
//         db,
//         `userBengkel`,
//         `${currentUser.uid}`,
//         `userMontir`,
//         `${montirSelectedUid}`
//       )
//     );
//     const montirData = montirDoc.data();
//     //   set montir yang dipilih pada order doc
//     await setDoc(
//       doc(db, `userBengkel`, `${currentUser.uid}`, `orders`, `${orderNowId}`),
//       { montirName: `${montirData.montirName}` },
//       {
//         merge: true,
//       }
//     );
//     //   update order status to "Accepted"
//     await updateDoc(
//       doc(db, `userBengkel`, `${currentUser.uid}`, `orders`, `${orderNowId}`),
//       {
//         status: "accepted",
//       }
//     );
//     cardSelectMontir.classList.remove("center-open");
//     waitingCardBengkel.classList.add("center-open");
//   } catch (err) {
//     console.log("err commandmontir : ", err.message);
//   }
// };

// const openOrderDetail = function (orderData, orderId) {
//   orderNowId = orderId;
//   moveSection(mainBengkelSection, orderNotification);
//   alert("Cek satu dua tiga");
//   getDoc(doc(db, `userBengkel`, `${currentUser.uid}`)).then((userDoc) => {
//     const bengkelObject = userDoc.data();
//     const [lng, lat] = bengkelObject.bengkelCoords;
//     const position = { coords: { latitude: lat, longitude: lng } };
//     loadMap(position, "map-order-notification");
//     showOrderRoute(
//       bengkelObject.bengkelCoords,
//       orderData.userCoords,
//       mapOrderNotification
//     );
//   });
//   cardOrderInfo.classList.add("brief-second");

//   orderNotification.querySelector(
//     ".order-distance"
//   ).textContent = `${orderData.travelTime} menit  (${orderData.travelDistance})`;
//   orderNotification.querySelector(
//     ".name"
//   ).textContent = `${orderData.pengendaraName}`;
//   orderNotification.querySelector(
//     ".problem-desc"
//   ).textContent = `${orderData.problem}`;
//   orderNotification.querySelector(
//     ".btn-wa"
//   ).href = `https://wa.me/${orderData.pengendara_phoneNumber}?
//   			text=Halo,%20saya%20montir%20yang%20kamu%20pesan%20`;
// };

// onSnapshot(
//   query(collection(db, `userBengkel/${currentUser.uid}/orders`)),
//   (querySnapshot) => {
//     querySnapshot.docChanges().forEach((change) => {
//       if (change.type === "added") {
//         const orderData = change.doc.data();
//         if (orderData.status === "waiting") {
//           if (serviceContainer.classList.contains("no-cust")) {
//             serviceContainer.classList.remove("no-cust");
//             serviceContainer.classList.add("is-cust");
//           }
//           const cardOrderHTML = `
// 		<div class="card cust-order">
// 		<div>
// 		<p class="cust-name">${orderData.pengendaraName}</p>
// 		<p class="travel-time">
// 		${orderData.travelTime} menit (<span class="travel-distance">${orderData.travelDistance}</span>)
// 		</p>
// 		</div>
// 		<button  class="btn btn-order-detail" data-id="${change.doc.id}">Lihat detail</button>
// 		</div>`;
//           orderContainer.insertAdjacentHTML("afterbegin", cardOrderHTML);
//           const btnOrderDetail =
//             orderContainer.querySelector(".btn-order-detail");
//           btnOrderDetail.addEventListener("click", (e) => {
//             openOrderDetail(orderData, e.target.dataset.id);
//           });
//         }
//       }
//     });
//   }
// );

// btnOpenBengkel.addEventListener("click", () => {
//   bengkelStatus = "open";
//   updateBengkelStatus("open");
//   updateAllMontirStatus(true);
//   watchRequestOrders();
// });

// export const mainBengkelConfig = async function () {
//   try {
//     const bengkelDoc = await getDoc(
//       doc(db, `userBengkel`, `${currentUser.uid}`)
//     );
//     const bengkelData = bengkelDoc.data();
//     console.log("bengkelData.bengkelopen : ", bengkelData.bengkelOpen);
//     if (bengkelData.bengkelOpen) {
//       updateBengkelStatus("open");
//       updateAllMontirStatus(true);
//       watchRequestOrders();
//       changeBengkelStatusVariable("open");
//       console.log("bengkelStatus mainbengkelconfig: ", bengkelStatus);
//       bengkelProfileName.textContent = bengkelData.bengkelName;
//       bengkelProfileOpenTime.textContent = `${bengkelData.openTime}-${bengkelData.closeTime}`;
//     }
//     if (!bengkelData.bengkelOpen) {
//       updateBengkelStatus("close");
//       updateAllMontirStatus(false);
//       if (unsubWatchBengkel) unsubWatchBengkel();
//       changeBengkelStatusVariable("close");
//       console.log("bengkelStatus mainbengkelconfig: ", bengkelStatus);
//       bengkelProfileName.textContent = bengkelData.bengkelName;
//       bengkelProfileOpenTime.textContent = `${bengkelData.openTime}-${bengkelData.closeTime}`;
//     }
//     bengkelInitPage.style.display = "none";
//     serviceState.style.display = "block";
//   } catch (err) {
//     console.log("err bengkelpengendara config", err.message);
//     signOut(auth).then(() => {
//       console.log("bengkel successfully signout");
//       bengkelInitPage.style.display = "block";
//       serviceState.style.display = "none";
//       moveSection(appState, openingSection);
//     });
//   }
// };

// export const submitEditPengendara = async function (e) {
//   e.preventDefault();
//   getDoc(doc(db, `userPengendara`, `${currentUser.uid}`))
//     .then((userDoc) => {
//       const userData = userDoc.data();
//       const slicedPhoneNumber = userData.phoneNumber.slice(3);

//       //   Implement user data to form
//       formEditPengendara["phone-number"].value = `${+slicedPhoneNumber}`;
//       formEditPengendara["ktp-number"].value = `${userData.ktpNumber}`;
//       formEditPengendara["pengendara-name"].value = `${userData.name}`;

//       formEditPengendara["email"].value = `${userData.email}`;
//       moveSection(mainPengendaraSection, editPengendaraSection);
//     })
//     .catch((error) => console.log("error getdoc", error.message));
// };

// export const showProfilPengendara = function () {
//   getDoc(doc(db, `userPengendara`, `${currentUser.uid}`)).then((userDoc) => {
//     const userData = userDoc.data();
//     navPengendaraName.textContent = `${userData.name}`;
//     navPengendaraEmail.textContent = `${userData.email}`;
//     navPengendaraPhone.textContent = `${userData.phoneNumber}`;
//     navPengendaraKtp.textContent = `${userData.ktpNumber}`;
//   });
// };

// export const submitRating = function (e) {
//   nowDate = getDate();
//   const ratingObj = {
//     rate: rate,
//     review: formGiveRating["review"].value,
//     ratedAt: {
//       day: nowDate.day,
//       month: nowDate.month,
//       year: nowDate.year,
//     },
//     status: "success",
//   };
//   if (isObjFull(ratingObj) === false) {
//     showInputError(formGiveRating);
//     return;
//   }
//   setDoc(
//     doc(db, `userBengkel/${choosenBengkel.uid}/orders/${nowOrderingId}`),
//     ratingObj,
//     {
//       merge: true,
//     }
//   )
//     .then((res) => {
//       cardMontirArrived.classList.remove("center-open");
//       document.querySelector(".overlay").remove();
//       showModalSuccess(mainPengendaraSection, "Beri ulasan");
//     })
//     .catch((err) => console.log("err saving new review", err.message));
// };

// const showBengkelInfoCard = function () {
//   getDoc(doc(db, `userBengkel`, `${choosenBengkel.uid}`)).then((userDoc) => {
//     const userData = userDoc.data();

//     pengendaraState = "infoCard";
//     nowDate = getDate();
//     infoBengkelName.textContent = userData.bengkelName;
//     infoBengkelAddress.textContent = userData.bengkelAddress;
//     infoBengkelOpenTime.textContent = `Buka jam ${userData.openTime} - ${userData.closeTime}`;
//     infoBengkelDesc.textContent = userData.bengkelDesc;

//     getDocs(
//       query(
//         collection(db, `userBengkel`, `${choosenBengkel.uid}`, `userMontir`),
//         where("montirStatus", "==", true)
//       )
//     )
//       .then((snapshot) => {
//         if (snapshot.docs.length === 0) {
//           if (montirTag.classList.contains("available")) {
//             montirTag.classList.remove("available");
//             montirTag.classList.add("not-available");
//             montirTag.textContent = "Montir tidak tersedia";
//           }
//         }
//         if (snapshot.docs.length > 0) {
//           if (montirTag.classList.contains("not-available")) {
//             montirTag.classList.remove("not-available");
//             montirTag.classList.add("available");
//             montirTag.textContent = "Montir tersedia";
//           }
//         }

//         if (
//           userData.bengkelOpen &&
//           bengkelTag.classList.contains("not-available")
//         ) {
//           bengkelTag.classList.remove("not-available");
//           bengkelTag.classList.add("available");
//           bengkelTag.textContent = "Buka";
//         }
//         if (
//           !userData.bengkelOpen &&
//           bengkelTag.classList.contains("available")
//         ) {
//           bengkelTag.classList.remove("available");
//           bengkelTag.classList.add("not-available");
//           bengkelTag.textContent = "Tutup";
//         }
//         if (montirTag.classList.contains("not-available")) {
//           btnCall.classList.add("not-available");
//           btnCall.disabled = true;
//         }
//         if (montirTag.classList.contains("available")) {
//           btnCall.classList.remove("not-available");
//           btnCall.disabled = false;
//         }
//       })
//       .catch((err) => {});

//     if (bengkelImages.children.length !== 0) {
//       let child = bengkelImages.firstElementChild;
//       while (child) {
//         bengkelImages.removeChild(child);
//         child = bengkelImages.firstElementChild;
//       }
//     }
//     let promiseImages = [];

//     userData.bengkelPhotos.forEach((picName) => {
//       const storage = getStorage();
//       const gsReference = ref(storage);
//       promiseImages.push(
//         getDownloadURL(gsReference).then((url) => {
//           const picBengkelHTML = `
// 					  <div class="slide">
// 						<img src="${url}" alt="" srcset="" />
// 					  </div>`;

//           bengkelImages.insertAdjacentHTML("beforeend", picBengkelHTML);
//         })
//       );
//     });
//     Promise.all(promiseImages).then(() => {
//       const slides = Array.from(document.querySelectorAll(".slide"));
//       sliderFunction(slides);
//     });

//     mapHeader.style.display = "none";
//     bengkelInfoCard.classList.add("brief");
//     mapPengendara.style.height = "54%";
//     map.resize();
//     map.easeTo({
//       center: choosenBengkel.bengkelCoords,
//       zoom: 15,
//       bearing: 0,
//       pitch: 0,
//       maxBounds: null,
//       duration: 2000,
//       easing(t) {
//         return t;
//       },
//     });
//   });

//   reviewContainer.innerHTML = "";
//   getDocs(collection(db, `userBengkel/${choosenBengkel.uid}/orders`)).then(
//     (snapshot) => {
//       snapshot.forEach((doc) => {
//         const orderData = doc.data();
//         const starsHTML = countingStarsIcon(orderData, "r-icon");
//         nowDate = getDate();
//         if (orderData.ratedAt) {
//           const reviewDate = orderData.ratedAt;
//           let ratedAtText;

//           if (reviewDate.month === nowDate.month) {
//             const ratedAt = nowDate.day - reviewDate.day;
//             if (ratedAt === 0) ratedAtText = `Hari ini`;
//             if (ratedAt > 0) ratedAtText = `${ratedAt} hari yang lalu`;
//           }
//           if (reviewDate.month < nowDate.month) {
//             const ratedAt = nowDate.month - reviewDate.month;
//             ratedAtText = `${ratedAt} bulan yang lalu`;
//           }
//           const reviewHTML = `
// 			<div class="review">
// 				<div class="reviewer-profile">
// 				  <div class="reviewer-picture">
// 					<img
// 					src="./src/images/customer-service.png"
// 					  alt="reviewer's profile picture"
// 					/>
// 				  </div>
// 				  <p class="reviewer-name">${orderData.pengendaraName}</p>
// 				  </div>
// 				  <div class="review-rating">
// 				  <div class="rating-stars">
// 				  ${starsHTML}
// 				  </div>
// 				  <div class="time">${ratedAtText}</div>
// 				  </div>
// 				  <div class="review-text">
// 				  ${orderData.review}
// 				  </div>
// 				  </div>`;
//           noReviewText.style.display = "none";
//           reviewContainer.insertAdjacentHTML("beforeend", reviewHTML);
//         }
//       });
//     }
//   );
// };

// const mainPengendaraConfig = function () {
//   let bengkelObjects = [];
//   map.on("load", () => {
//     showUserMarker();
//     getDocs(collection(db, "userBengkel")).then((snapshot) => {
//       snapshot.forEach((doc) => {
//         const bengkelObject = doc.data();
//         bengkelObject.uid = doc.id;
//         bengkelObjects.push(bengkelObject);
//       });
//       let featuresArray = [];
//       bengkelObjects.forEach((bengkelObject) => {
//         featuresArray.push({
//           type: "Feature",
//           properties: bengkelObject,
//           geometry: {
//             type: "Point",
//             coordinates: bengkelObject.bengkelCoords,
//           },
//         });
//       });
//       const geojsonBengkels = {
//         type: "FeatureCollection",
//         features: featuresArray,
//       };
//       if (map.getSource("all-bengkel")) {
//         map.getSource("all-bengkel").setData(geojsonBengkels);
//       } else {
//         map.addLayer({
//           id: "all-bengkel",
//           source: {
//             type: "geojson",
//             data: geojsonBengkels,
//           },
//           type: "circle",
//           paint: {
//             "circle-color": "#5555f6",
//             "circle-radius": 8,
//             "circle-opacity": 0,
//           },
//         });
//       }
//       if (!map.getSource("nearest-bengkels")) {
//         map.loadImage(bengkelIcon, (error, image) => {
//           if (error) throw error;
//           map.addImage("bengkel-icon", image);
//         });
//         map.addLayer({
//           id: "nearest-bengkels",
//           source: {
//             type: "geojson",
//             data: { type: "FeatureCollection", features: [] },
//           },
//           type: "symbol",
//           layout: {
//             "icon-image": "bengkel-icon",
//             "icon-size": 0.05,
//             "icon-allow-overlap": true,
//           },
//         });
//         if (!map.getSource("search-radius")) {
//           map.addLayer({
//             id: "search-radius",
//             source: {
//               type: "geojson",
//               data: { type: "FeatureCollection", features: [] },
//             },
//             type: "fill",
//             paint: {
//               "fill-color": "#00ff5e",
//               "fill-opacity": 0.2,
//             },
//           });
//         }
//       }
//       const makeRadius = function (lngLatArray, radiusInMeters) {
//         const point = turf.point(lngLatArray);
//         const buffered = turf.buffer(point, radiusInMeters, {
//           units: "meters",
//         });
//         return buffered;
//       };
//       const searchRadius = makeRadius(userCoords, 1800);
//       map.getSource("search-radius").setData(searchRadius);

//       function spatialJoin(sourceGeoJSON, filterFeature) {
//         const joined = sourceGeoJSON.features.filter(function (feature) {
//           return turf.booleanPointInPolygon(feature, filterFeature);
//         });
//         return joined;
//       }
//       const featuresInBuffer = spatialJoin(geojsonBengkels, searchRadius);

//       map
//         .getSource("nearest-bengkels")
//         .setData(turf.featureCollection(featuresInBuffer));

//       map.on("click", "nearest-bengkels", (e) => {
//         choosenBengkel = e.features[0].properties;
//         choosenBengkel.bengkelCoords = e.features[0].geometry.coordinates;
//         showBengkelInfoCard();
//       });
//     });
//   });
// };

// export const signingUpUser = async function () {
//   let btnSign;
//   let userRegistered;
//   // Input Form Bengkel
//   btnSign = `btn-signup-bengkel`;
//   formElement = formSignUpBengkel;
//   userObj = {
//     phoneNumber: `+62${formSignUpBengkel["phone-number"].value}`,
//     ownerName: formSignUpBengkel["owner-name"].value,
//     ktpNumber: formSignUpBengkel["ktp-number"].value,
//     bengkelName: formSignUpBengkel["bengkel-name"].value,
//     bengkelAddress: formSignUpBengkel["bengkel-address"].value,
//     bengkelDesc: formSignUpBengkel["bengkel-description"].value,
//     openTime: formSignUpBengkel["open-time"].value,
//     closeTime: formSignUpBengkel["close-time"].value,
//     userRole: formSignUpBengkel["role"].value,
//   };
//   // Input Validation
//   if (isObjFull(userObj) === false) {
//     showInputError(formSignUpBengkel);
//     removeLoadingBtn(formSignUpBengkel);
//     return;
//   }
//   if (userObj.phoneNumber === "+62") {
//     showInputError(formSignUpBengkel);
//     removeLoadingBtn(formSignUpBengkel);
//     return;
//   }
//   const snapshot = await getDocs(
//     query(
//       collection(db, `userBengkel`),
//       where("phoneNumber", "==", userObj.phoneNumber)
//     )
//   );
//   if (snapshot.docs.length > 0) {
//     showInputError(formSignUpBengkel, "Akun sudah terdaftar");
//     removeLoadingBtn(formSignUpBengkel);
//     userRegistered = true;
//   }

//   if (userRegistered) return;

//   recaptchaVerifierMaker(btnSign);
//   const appVerifier = window.recaptchaVerifier;
//   const phoneNumber = `+62${formElement["phone-number"].value}`;

//   signInWithPhoneNumber(auth, phoneNumber, appVerifier)
//     .then((confirmationResult) => {
//       window.confirmationResult = confirmationResult;

//       // SMS sent. Update UI to OTP section
//       formElement.reset();
//       moveSection(signUpBengkelSection, otpVerifySection);
//       removeInputError(formSignUpBengkel);

//       otpVerifySection.querySelector(".otp-header-text span").textContent =
//         phoneNumber;

//       let seconds_left = 60;
//       setTimerText = setInterval(function () {
//         seconds_left = --seconds_left;
//         otpTimerText.textContent = `${seconds_left}`;

//         if (seconds_left <= 0) {
//           clearInterval(setTimerText);
//           moveSection(otpVerifySection, openingSection);
//         }
//       }, 1000);

//       //   otpVerifySection.replaceWith(otpVerifySection.cloneNode(true));
//       otpVerifySection.removeEventListener("submit", submitOtpSignUp);
//       otpVerifySection.addEventListener("submit", submitOtpSignUp);
//     })
//     .catch((error) => {
//       // reset reCAPTCHA
//       window.recaptchaVerifier.render().then(function (widgetId) {
//         recaptcha.reset(widgetId);
//       });
//     });
// };

// onSnapshot(
//   query(doc(db, `userBengkel/${choosenBengkel.uid}/orders/${nowOrderingId}`)),
//   (doc) => {
//     const orderData = doc.data();
//     if (orderData.status === "running") {
//       // Remove menunggu montir card
//       let overlay = document.querySelector(".overlay");
//       overlay.remove();
//       waitingCardPengendara.classList.remove("center-open");

//       // Open montir berangkat card
//       cardMontirIsComing.classList.add("center-open");
//       cardMontirIsComing.querySelector(
//         ".bengkel-name"
//       ).textContent = `${choosenBengkel.bengkelName}`;
//       cardMontirIsComing.querySelector(
//         ".countdown-text span"
//       ).textContent = `${orderData.travelTime}`;

//       overlay = document.createElement("div");
//       overlay.classList.add("overlay");
//       mainPengendaraSection.insertBefore(overlay, cardMontirIsComing);
//       countingMontirOtw(orderData.travelTime, cardMontirIsComing, "pengendara");
//     }
//   }
// );

// import { onSnapshot } from "firebase/firestore";
// waitingCardPengendara.querySelector(
//   "p span"
// ).textContent = `${choosenBengkel.bengkelName}`;
// waitingCardPengendara.classList.add("center-open");
// const overlay = document.createElement("div");
// overlay.classList.add("overlay");
// mainPengendaraSection.insertBefore(overlay, waitingCardPengendara);

// watchOrderPengendara();

// orderConfirmationContainer.classList.add("center-open");
// orderConfirmationContainer.querySelector(
//   ".problem-desc"
// ).textContent = `${problemDesc}`;
// orderConfirmationContainer.querySelector(".bengkel-name").textContent =
//   choosenBengkel.bengkelName;

// overlay.classList.add("overlay");
// mainPengendaraSection.insertBefore(overlay, orderConfirmationContainer);
// overlay.addEventListener("click", (e) => {
//   overlay.remove();
//   orderConfirmationContainer.classList.remove("center-open");
// });

// btnCall.addEventListener("click", (e) => {
//   orderDescContainer.classList.add("center-open");
//   const overlay = document.createElement("div");
//   overlay.classList.add("overlay");
//   mainPengendaraSection.insertBefore(overlay, orderDescContainer);
//   overlay.addEventListener("click", (e) => {
//     overlay.remove();
//     orderDescContainer.classList.remove("center-open");
//   });
// });

// formOrderDesc.addEventListener("submit", (e) => {
//   e.preventDefault();
//   inputOrderDesc();
// });

// import { btnCall, mainBengkelSection, mainPengendaraSection } from ".";
// import { inputOrderDesc } from "./main";
// export async function showRoute() {
//   const end = choosenBengkel.bengkelCoords;
//   const query = await fetch(
//     `https://api.mapbox.com/directions/v5/mapbox/cycling/${userCoords[0]},
// 	${userCoords[1]};${end[0]},${end[1]}?steps=true&
// 	geometries=geojson&access_token=${mapboxgl.accessToken}`,
//     { method: "GET" }
//   );
//   const json = await query.json();
//   const data = json.routes[0];
//   const route = data.geometry.coordinates;
//   const geojson = {
//     type: "Feature",
//     properties: {},
//     geometry: {
//       type: "LineString",
//       coordinates: route,
//     },
//   };
//   // jika rute sudah ada pada map, reset dengan setData
//   if (map.getSource("route")) {
//     map.getSource("route").setData(geojson);
//   }
//   // jika belum, buat baru
//   else {
//     map.addLayer({
//       id: "route",
//       type: "line",
//       source: {
//         type: "geojson",
//         data: geojson,
//       },
//       layout: {
//         "line-join": "round",
//         "line-cap": "round",
//       },
//       paint: {
//         "line-color": "#3887be",
//         "line-width": 5,
//         "line-opacity": 0.75,
//       },
//     });
//   }

//   const travelObj = await getDistanceDurationRoute();
//   bengkelInfoCard.classList.remove("brief");
//   bengkelInfoCard.classList.remove("full-open");
//   showRouteCard.classList.add("brief-bottom");

//   showRouteCard.querySelector(".route-bengkel-name").textContent =
//     choosenBengkel.bengkelName;
//   showRouteCard.querySelector(
//     ".route-distance"
//   ).textContent = `${travelObj.duration} menit (${travelObj.distance})`;

//   mapPengendara.style.height = "80%";
//   map.resize();

//   const bounds = new mapboxgl.LngLatBounds(userCoords, userCoords);
//   for (const coord of route) {
//     bounds.extend(coord);
//   }
//   map.fitBounds(bounds, {
//     padding: 30,
//     duration: 1000,
//   });
// }

// let otpCode = `${formOtpVerify["otp-code"].value}`;
// confirmationResult.confirm(otpCode).then((result) => {
//   const user = result.user;
// });

// export const signingInUser = function () {
//   recaptchaVerifierMaker("btn-signin");
//   const appVerifier = window.recaptchaVerifier;
//   const phoneNumber = `+62${formSignIn["phone-number"].value}`;
//   if (phoneNumber === "+62") {
//     showInputError(formSignIn);
//     removeLoadingBtn(formSignIn);
//     return;
//   }

//   signInWithPhoneNumber(auth, phoneNumber, appVerifier).then(
//     (confirmationResult) => {
//       window.confirmationResult = confirmationResult;

//       moveSection(signInSection, otpVerifySection);
//       removeInputError(formSignIn);

//       let seconds_left = 60;
//       setTimerText = setInterval(function () {
//         seconds_left = --seconds_left;
//         otpTimerText.textContent = `${seconds_left}`;

//         if (seconds_left <= 0) {
//           clearInterval(setTimerText);
//           moveSection(otpVerifySection, openingSection);
//         }
//       }, 1000);

//       otpVerifySection.removeEventListener("submit", submitOtpSignIn);
//       otpVerifySection.addEventListener("submit", submitOtpSignIn);
//     }
//   );
// };
