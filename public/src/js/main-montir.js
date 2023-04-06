// IMPORT
import { auth, checkOnlineStatus, db, functions } from "./firebase-config";
import {
  collection,
  getDocs,
  getDoc,
  setDoc,
  doc,
  where,
  updateDoc,
  query,
  arrayRemove,
  arrayUnion,
  addDoc,
  onSnapshot,
} from "firebase/firestore";
import {
  appState,
  arriveConfirm,
  cardMontirArrivedMontir,
  cardMontirOrderInfo,
  cardMontirOtwInfo,
  cardRequestingCost,
  countingInterval,
  countingMontirOtw,
  formRequestCost,
  mainMontirSection,
  mapMontirOrderNotification,
  mapMontirOtw,
  montirOrderInformation,
  montirOtwSection,
  moveSection,
  openingSection,
  showModalNoInternet,
} from "./index";
import { currentUser, recaptchaVerifierMaker } from "./auth";
import {
  map,
  userCoords,
  getLocationPromise,
  loadMap,
  removeMap,
} from "./mapbox-config";
import { showOrderRoute } from "./main-bengkel";
import { showRoute, showUserMarker } from "./main";
import { signOut } from "firebase/auth";
import { httpsCallable } from "firebase/functions";
console.log("map from MONTIR ", map);
export let montirData;
let montirName;
let montirPhoneNumber;
let nowOrderId;
let nowOrderData;

let montirCoords;
let montirOtwMarker;
let montirOtwElement;

// let watchPosId;
let watchMontirPos;
// main

// LIVE LOCATION
// let watching=0;
// const liveText = document.querySelector(".pricing span");
// const btnStart = document.querySelector(".btn-start");

const liveGuide = function (position) {
  console.log("[Live Guide position]", position);
  console.log("[Live Guide position.coords]", position.coords);
  const { latitude, longitude } = position.coords;
  montirCoords = [longitude, latitude];
  console.log("montirCoords : ", montirCoords);
  //   showUserMarker();
  const montirGeojson = {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: montirCoords,
    },
  };

  if (montirOtwMarker && montirOtwElement) {
    montirOtwElement.remove();
    montirOtwMarker.remove();
  }

  montirOtwElement = document.createElement("div");
  montirOtwElement.className = "montir-otw-marker";

  montirOtwMarker = new mapboxgl.Marker(montirOtwElement)
    .setLngLat(montirGeojson.geometry.coordinates)
    .addTo(map);

  map.flyTo({
    center: montirCoords,
    speed: 0.5,
  });

  //   showOrderRoute(
  // 	bengkelData.bengkelCoords,
  // 	nowOrderData.userCoords,
  // 	mapMontirOrderNotification
  //   );
  //   showRoute("justGuide");
  //   liveText.textContent = "";
  //   liveText.textContent = `${userCoords}`;
};

// if(watching==0){
// watching=1;
// if (map) {
//   console.log("map from MONTIR OTW", map);
//   map.easeTo({
//     zoom: 18,
//     pitch: 70,
//     // bearing: ,
//     duration: 1500,
//     easing(t) {
//       return t;
//     },
//   });
// }

// }

// MontirBerangkat
const montirOtw = function () {
  console.log("montirOtw . . .");
  checkOnlineStatus().then((status) => {
    if (status === true) {
      getDoc(doc(db, `userBengkel`, `${montirData.bengkelUid}`)).then(
        (userDoc) => {
          const bengkelData = userDoc.data();

          const [lng, lat] = bengkelData.bengkelCoords;
          const position = { coords: { latitude: lat, longitude: lng } };
          console.log("position : ", position);

          moveSection(montirOrderInformation, montirOtwSection);
          cardMontirOrderInfo.classList.remove("brief-second");
          cardMontirOtwInfo.classList.add("brief-bottom");

          loadMap(position, "map-montir-otw");

          showOrderRoute(
            bengkelData.bengkelCoords,
            nowOrderData.userCoords,
            mapMontirOtw,
            true
          );
          mapMontirOtw.style.height = "80%";
          map.resize();
          liveGuide(position);
          watchMontirPos = setInterval(async () => {
            const newLoc = await getLocationPromise();
            liveGuide(newLoc);
          }, 2000);

          countingMontirOtw(
            nowOrderData.travelTime,
            montirOtwSection,
            "montir"
          );
          //   watchPosId = navigator.geolocation.watchPosition(
          //     liveGuide,
          //     function () {
          //       alert("Cannot get your live location");
          //     }
          //   );
        }
      );
    }
    if (status === false) {
      showModalNoInternet(mainMontirSection);
      return;
    }
  });
};

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

  //   navigator.geolocation.clearWatch(watchPosId);
};

const openMontirOrderDetail = function (nowOrderData) {
  checkOnlineStatus().then((status) => {
    if (status === true) {
      moveSection(mainMontirSection, montirOrderInformation);

      getDoc(doc(db, `userBengkel`, `${montirData.bengkelUid}`)).then(
        (userDoc) => {
          const bengkelData = userDoc.data();

          const [lng, lat] = bengkelData.bengkelCoords;
          const position = { coords: { latitude: lat, longitude: lng } };
          console.log("position : ", position);
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
      ).textContent = `${nowOrderData.travelTime} menit (${nowOrderData.travelDistance})`;
      montirOrderInformation.querySelector(
        ".name"
      ).textContent = `${nowOrderData.pengendaraName}`;
      montirOrderInformation.querySelector(
        ".btn-wa"
      ).href = `https://wa.me/${nowOrderData.pengendara_phoneNumber}?text=Halo,%20saya%20montir%20yang%20kamu%20pesan%20`;
      montirOrderInformation.querySelector(
        ".problem-desc"
      ).textContent = `${nowOrderData.problem}`;
    }
    if (status === false) {
      showModalNoInternet(mainMontirSection);
      return;
    }
  });
};

export let unsubWatchBengkelCommand;
const watchBengkelCommand = function () {
  console.log("[watchBengkelCommand]");
  checkOnlineStatus().then((status) => {
    if (status === true) {
      unsubWatchBengkelCommand = onSnapshot(
        query(collection(db, `userBengkel/${montirData.bengkelUid}/orders`)),
        (querySnapshot) => {
          console.log("[watchBengkelCommand] 2", querySnapshot);
          querySnapshot.docChanges().forEach((change) => {
            console.log("[watchBengkelCommand] 3", change);
            if (change.type === "modified") {
              console.log("[watchBengkelCommand] 4");
              nowOrderData = change.doc.data();
              if (
                nowOrderData.status === "accepted" &&
                nowOrderData.montirId === currentUser.phoneNumber
              ) {
                console.log("nowOrderData : ", nowOrderData);
                nowOrderId = change.doc.id;
                openMontirOrderDetail(nowOrderData);
              }
              if (
                nowOrderData.status === "arrived" &&
                nowOrderData.montirId === currentUser.phoneNumber
              ) {
                // show container selamat anda sudah sampai
                arriveConfirm.style.display = "none";
                cardMontirArrivedMontir.classList.add("center-open");
                const overlay = document.createElement("div");
                overlay.classList.add("overlay");
                montirOtwSection.insertBefore(overlay, cardMontirArrivedMontir);
                clearInterval(countingInterval);
                clearInterval(watchMontirPos);
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

export let unsubWatchOrderCost;
const watchOrderCost = function () {
  checkOnlineStatus().then((status) => {
    if (status === true) {
      unsubWatchOrderCost = onSnapshot(
        query(
          doc(db, `userBengkel/${montirData.bengkelUid}/orders/${nowOrderId}`)
        ),
        (docc) => {
          const orderData = docc.data();
          if (orderData.status == "costDelivered") {
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
				<button class="btn btn-submit-form">Konfirmasi</button>
				<button class="btn btn-load" style="display: none">
				<div class="lds-ring">
					<div></div>
					<div></div>
					<div></div>
					<div></div>
				</div>
				</button>
			</div>`;

            mainMontirSection.querySelector(".waiting-cost").remove();
            mainMontirSection.querySelector(".overlay").remove();

            mainMontirSection.insertAdjacentHTML("beforeend", cardShowCostHTML);
            const cardShowCost = mainMontirSection.querySelector(".show-cost");
            const overlay = document.createElement("div");
            overlay.classList.add("overlay");
            mainMontirSection.insertBefore(overlay, cardShowCost);
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
                  unsubWatchOrderCost();
                });
              });
          }
        }
      );
    }
    if (status === false) {
      showModalNoInternet(mainPengendaraSection);
      return;
    }
  });
};

export const mainMontirConfig = async function () {
  try {
    console.log("mainMontirConfig . . .");

    const bengkelSnapshot = await getDocs(collection(db, `userBengkel`));
    console.log("bengkelSnapshot : ", bengkelSnapshot);
    // const bengkelSnapshot = bengkelsDoc.data();
    bengkelSnapshot.docs.forEach(async function (snap) {
      const montirDoc = await getDoc(
        doc(db, `userBengkel/${snap.id}/userMontir/${currentUser.phoneNumber}`)
      );
      console.log("montirDoc.data() : ", montirDoc.data());
      if (montirDoc.data() != undefined || montirDoc.data() != null) {
        montirData = montirDoc.data();
        console.log("montirData : ", montirData);
        const idTokenResult = await auth.currentUser.getIdTokenResult(true);
        console.log("roles : ", idTokenResult.claims.role);
        await setDoc(
          doc(
            db,
            `userBengkel/${montirData.bengkelUid}/userMontir/${currentUser.phoneNumber}`
          ),
          { isLogin: true },
          {
            merge: true,
          }
        );
        console.log("montirData fix : ", montirData);
        montirName = montirData.montirName;
        montirPhoneNumber = montirData.phoneNumber;
        mainMontirSection.querySelector(
          ".montir-name"
        ).textContent = `${montirName}`;
        mainMontirSection.querySelector(
          ".montir-number"
        ).textContent = `${montirPhoneNumber}`;

        const orderSnapshot = await getDocs(
          query(
            collection(db, `userBengkel/${montirData.bengkelUid}/orders`),
            where("status", "==", "accepted"),
            where("montirId", "==", montirData.phoneNumber)
          )
        );
        orderSnapshot.forEach((doc) => {
          nowOrderData = doc.data();
          if (nowOrderData) {
            nowOrderId = doc.id;
            console.log("nowOrderData : ", nowOrderData);
            openMontirOrderDetail(nowOrderData);
            if (unsubWatchBengkelCommand) unsubWatchBengkelCommand();
            watchBengkelCommand();
            return;
          }
        });

        openingSection.classList.remove("active");
        moveSection(appState, mainMontirSection);

        if (unsubWatchBengkelCommand) unsubWatchBengkelCommand();
        watchBengkelCommand();

        return;
      }
    });
    // for (const doc of bengkelSnapshot) {
    //   const montirDoc = await getDoc(
    //     doc(db, `userBengkel/${doc.id}/userMontir/${currentUser.uid}`)
    //   );
    //   console.log("montirDoc : ", montirDoc);
    //   if (montirDoc != undefined) {
    //     montirData = montirDoc.data();
    //     console.log("montirData : ", montirData);
    //     break;
    //   }
    // }
  } catch (err) {
    console.log("err mainMontirConfig!", err.message);
    setDoc(
      doc(
        db,
        `userBengkel/${montirData.bengkelUid}/userMontir/${currentUser.phoneNumber}`
      ),
      { isLogin: false },
      {
        merge: true,
      }
    ).then(() => {
      signOut(auth).then(() => {
        console.log("montir successfully signout");
        moveSection(appState, openingSection);
      });
    });
  }
};

export const montirGo = async function () {
  try {
    const today = new Date();
    const time = today.getHours() + ":" + today.getMinutes();

    await updateDoc(
      doc(
        db,
        `userBengkel`,
        `${montirData.bengkelUid}`,
        `orders`,
        `${nowOrderId}`
      ),
      {
        status: "running",
        wentAt: time,
      }
    );
    // Open Montir Berangkat Section
    removeMap();

    montirOtw();
  } catch (err) {
    console.log("err montirGo : ", err.message);
    return err;
  }
};

const requestCost = httpsCallable(functions, "requestCost");
export const montirRequestCost = async function () {
  const bengkelResp = await getDoc(
    doc(db, `userBengkel`, `${montirData.bengkelUid}`)
  );
  const bengkelObj = bengkelResp.data();
  const token = bengkelObj.notificationTokens.token;
  console.log("notificationToken requestCost : ", token);

  const requestCostRes = await requestCost({
    token: token,
    montirName: montirData.montirName,
  });

  console.log("requestCostRes : ", requestCostRes);

  await setDoc(
    doc(
      db,
      `userBengkel`,
      `${montirData.bengkelUid}`,
      `orders`,
      `${nowOrderId}`
    ),
    {
      detailedProblem: formRequestCost["problem-description"].value,
      status: "requestingCost",
    },
    {
      merge: true,
    }
  );

  mainMontirSection.querySelector(".overlay").remove();
  cardRequestingCost.classList.remove("center-open");
  formRequestCost.reset();

  const waitingCostHTML = `
	<div class="card waiting-cost center-open">
		<h2>Hasil pengecekan telah dikirim.</h2>
        <p>
			Menunggu biaya perbaikan
        </p>
        <div class="lds-ring">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
	</div>`;
  mainMontirSection.insertAdjacentHTML("beforeend", waitingCostHTML);
  const cardWaitingCost = mainMontirSection.querySelector(".waiting-cost");
  const overlay = document.createElement("div");
  overlay.classList.add("overlay");
  mainMontirSection.insertBefore(overlay, cardWaitingCost);

  watchOrderCost();
};
