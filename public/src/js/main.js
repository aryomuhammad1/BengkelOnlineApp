// ===[ APP DATA ]===
import bengkelIcon from "../images/bengkel-icon.png";
import {
  auth,
  checkOnlineStatus,
  db,
  functions,
  messaging,
} from "./firebase-config";
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
  deleteDoc,
} from "firebase/firestore";
import {
  updateProfile,
  updatePhoneNumber,
  PhoneAuthProvider,
  signOut,
} from "firebase/auth";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import { map, userCoords, loadMap, getLocationPromise } from "./mapbox-config";
import {
  appState,
  bengkelInfoCard,
  infoBengkelName,
  joinSince,
  infoBengkelAddress,
  infoBengkelOpenTime,
  infoBengkelDesc,
  mapHeader,
  reviewContainer,
  showRouteCard,
  editPengendaraSection,
  formEditPengendara,
  mainPengendaraSection,
  otpVerifySection,
  formOtpVerify,
  navPengendaraContainer,
  navPengendaraKtp,
  navPengendaraPhone,
  navPengendaraEmail,
  navPengendaraName,
  moveSection,
  mainBengkelSection,
  formOrderDesc,
  orderDescContainer,
  orderConfirmationContainer,
  ratingStarContainer,
  formGiveRating,
  mapPengendara,
  bengkelImages,
  noReviewText,
  bengkelTag,
  montirTag,
  btnCall,
  waitingCardPengendara,
  cardMontirIsComing,
  createLoadingBtn,
  showInputError,
  sliderFunction,
  cardMontirArrived,
  removeLoadingBtn,
  countingStarsIcon,
  showModalNoInternet,
  countingMontirOtw,
  orderRejectedCard,
  openingSection,
  countingInterval,
  showModalMessage,
  offlineFallbackPage,
  ratingSum,
  ratingTotalReviewers,
  ratingStars,
  setTimerTextEditPengendara,
} from "./index";
import {
  getDate,
  currentUser,
  recaptchaVerifierMaker,
  isObjFull,
} from "./auth";
import { httpsCallable } from "firebase/functions";

let userMarker;
let userElement;
let pengendaraState;
let bengkelObjects = [];
export let choosenBengkel;
let nowDate;
let problemDesc;
let nowOrderingId;
let orderCountdown;

let fullStarArray = [1, 1, 1, 1, 1];
let selectedStarArray = [0, 0, 0, 0, 0];
let rate;

const getDistanceDurationRoute = async function () {
  try {
    const end = choosenBengkel.bengkelCoords;
    const query = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/cycling/${userCoords[0]},${userCoords[1]};${end[0]},${end[1]}?access_token=${mapboxgl.accessToken}`,
      { method: "GET" }
    );
    const json = await query.json();
    const data = json.routes[0];
    console.log(data);
    let duration = data.duration / 60;
    duration = Math.round(duration);
    let distance =
      data.distance >= 1000
        ? `${data.distance / 1000} km`
        : `${data.distance} m`;
    console.log("getdistancedurationroute finish");
    return { duration: duration, distance: distance };
  } catch (err) {
    console.log("error getDistanceDurationRoute : ");
    return err;
  }
};

// == [SHOW ROUTE FUNCTIONS] ==

export async function showRoute() {
  console.log("userCoords : ", userCoords);
  const end = choosenBengkel.bengkelCoords;
  const query = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/cycling/${userCoords[0]},${userCoords[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
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

  const travelObj = await getDistanceDurationRoute();
  bengkelInfoCard.classList.remove("brief");
  bengkelInfoCard.classList.remove("full-open");
  showRouteCard.classList.add("brief-bottom");

  showRouteCard.querySelector(".route-bengkel-name").textContent =
    choosenBengkel.bengkelName;
  showRouteCard.querySelector(
    ".route-distance"
  ).textContent = `${travelObj.duration} menit (${travelObj.distance})`;

  console.log(mapPengendara);
  mapPengendara.style.height = "80%";
  map.resize();

  //   if (routeType == "justShow") {
  const bounds = new mapboxgl.LngLatBounds(userCoords, userCoords);
  for (const coord of route) {
    bounds.extend(coord);
  }
  map.fitBounds(bounds, {
    padding: 30,
    duration: 1000,
  });
  //   }
}

// ===[CLOSE ROUTE FUNCTIONS]===
export const closeRoute = function () {
  if (map.getSource("route")) {
    map.removeLayer("route");
    map.removeSource("route");
    bengkelInfoCard.classList.add("brief");
    mapPengendara.style.height = "54%";
    map.resize();
    map.easeTo({
      center: choosenBengkel.bengkelCoords,
      zoom: 16,
      // pitch: 60,
      bearing: 0,
      pitch: 0,
      maxBounds: null,
      duration: 2000,
      easing(t) {
        return t;
      },
    });
  }
};

// ===[CLOSE BENGKEL INFO FUNCTIONS]===
export const closeBengkelInfoCard = function () {
  bengkelInfoCard.classList.remove("brief");
  mapHeader.style.display = "flex";
  mapPengendara.style.height = "100%";
  map.resize();
  map.easeTo({
    // center: choosenBengkel.bengkelCoords,
    center: userCoords,
    zoom: 14,
    // pitch: 60,
    bearing: 0,
    pitch: 0,
    maxBounds: null,
    duration: 2000,
    easing(t) {
      return t;
    },
  });
};

// ===[SHOW BENGKEL INFO FUNCTIONS]===
// export let watchBengkelStatusId;
// export let watchMontirStatusId;
// export const watchStatus = function () {
//   watchMontirStatusId = onSnapshot(
//     query(
//       collection(db, `userBengkel`, `${choosenBengkel.uid}`, `userMontir`),
//       where("montirStatus", "==", true)
//     )
//   ).then((snapshot) => {
//     if (snapshot.docs.length === 0) {
//       if (montirTag.classList.contains("available")) {
//         montirTag.classList.remove("available");
//         montirTag.classList.add("not-available");
//         montirTag.textContent = "Montir tidak tersedia";
//         // console.log("tes 1 : ", montirTag.classList.contains("not-available"));
//       }
//     }
//     if (snapshot.docs.length > 0) {
//       console.log("snapshot : ", snapshot);
//       if (montirTag.classList.contains("not-available")) {
//         montirTag.classList.remove("not-available");
//         montirTag.classList.add("available");
//         montirTag.textContent = "Montir tersedia";
//         // console.log("tes 2 : ", montirTag.classList.contains("available"));
//       }

//       // apply bengkel tags
//       if (
//         userData.bengkelOpen &&
//         bengkelTag.classList.contains("not-available")
//       ) {
//         bengkelTag.classList.remove("not-available");
//         bengkelTag.classList.add("available");
//         bengkelTag.textContent = "Buka";
//       }
//       if (!userData.bengkelOpen && bengkelTag.classList.contains("available")) {
//         bengkelTag.classList.remove("available");
//         bengkelTag.classList.add("not-available");
//         bengkelTag.textContent = "Tutup";
//       }
//       // if (!userData.bengkelOpen && montirTag.classList.contains("available")) {
//       //   montirTag.classList.remove("available");
//       //   montirTag.classList.add("not-available");
//       //   montirTag.textContent = "Montir tidak tersedia";
//       // }
//       console.log("tes 3 : ", montirTag.classList.contains("available"));
//       if (montirTag.classList.contains("not-available")) {
//         console.log("THIS");
//         btnCall.classList.add("not-available");
//         btnCall.disabled = true;
//       }
//       if (montirTag.classList.contains("available")) {
//         console.log("THAT");
//         btnCall.classList.remove("not-available");
//         btnCall.disabled = false;
//       }
//     }
//     watchBengkelStatusId = onSnapshot(
//       query(doc(db, `userBengkel`, `${choosenBengkel.uid}`))
//     ).then((doc) => {
//       const userData = doc.data();
//     });
//   });
// };
export let unsubWatchMontirStatus;
export let unsubWatchBengkelStatus;
export const watchBengkelAvailability = function () {
  unsubWatchBengkelStatus = onSnapshot(
    doc(db, `userBengkel`, `${choosenBengkel.uid}`),
    (doc) => {
      const userData = doc.data();
      if (userData.bengkelOpen) {
        if (bengkelTag.classList.contains("not-available")) {
          bengkelTag.classList.remove("not-available");
          bengkelTag.classList.add("available");
          bengkelTag.textContent = "Buka";

          btnCall.classList.remove("not-available");
          btnCall.disabled = false;
        }

        unsubWatchMontirStatus = onSnapshot(
          query(
            collection(
              db,
              `userBengkel`,
              `${choosenBengkel.uid}`,
              `userMontir`
            ),
            where("montirStatus", "==", true)
          ),
          (snapshot) => {
            if (snapshot.docs.length === 0) {
              if (montirTag.classList.contains("available")) {
                montirTag.classList.remove("available");
                montirTag.classList.add("not-available");
                montirTag.textContent = "Montir tidak tersedia";
              }
              btnCall.classList.add("not-available");
              btnCall.disabled = true;
            }
            if (snapshot.docs.length > 0) {
              if (montirTag.classList.contains("not-available")) {
                montirTag.classList.remove("not-available");
                montirTag.classList.add("available");
                montirTag.textContent = "Montir tersedia";
              }
              btnCall.classList.remove("not-available");
              btnCall.disabled = false;
            }
          }
        );
      }
      if (!userData.bengkelOpen) {
        unsubWatchMontirStatus && unsubWatchMontirStatus();

        btnCall.classList.add("not-available");
        btnCall.disabled = true;

        if (bengkelTag.classList.contains("available")) {
          bengkelTag.classList.remove("available");
          bengkelTag.classList.add("not-available");
          bengkelTag.textContent = "Tutup";
        }
        if (montirTag.classList.contains("available")) {
          montirTag.classList.remove("available");
          montirTag.classList.add("not-available");
          montirTag.textContent = "Montir tidak tersedia";
        }
      }
    }
  );
};
let ratesArray = [];
const showBengkelInfoCard = function () {
  getDoc(doc(db, `userBengkel`, `${choosenBengkel.uid}`)).then((userDoc) => {
    const userData = userDoc.data();
    // console.log('mapPengendara : ', mapPengendara)
    // console.log("this", choosenBengkel.bengkelCoords);
    console.log("choosenBengkel : ", choosenBengkel);
    console.log("userData : ", userData);
    //   console.log("this 2", bengkelCoords);

    pengendaraState = "infoCard";
    // bengkel general info
    nowDate = getDate();
    infoBengkelName.textContent = userData.bengkelName;
    //   joinSince.textContent = `${nowDate.day} ${nowDate.month} ${nowDate.year}`;
    infoBengkelAddress.textContent = userData.bengkelAddress;
    infoBengkelOpenTime.textContent = `Buka jam ${userData.openTime} - ${userData.closeTime}`;
    infoBengkelDesc.textContent = userData.bengkelDesc;

    // Check Status Bengkel dan Ketersediaan Montir
    // 1. Jika bengkel buka
    if (userData.bengkelOpen) {
      if (bengkelTag.classList.contains("not-available")) {
        bengkelTag.classList.remove("not-available");
        bengkelTag.classList.add("available");
        bengkelTag.textContent = "Buka";
      }

      getDocs(
        query(
          collection(db, `userBengkel`, `${choosenBengkel.uid}`, `userMontir`),
          where("montirStatus", "==", true)
        )
      ).then((snapshot) => {
        if (snapshot.docs.length === 0) {
          if (montirTag.classList.contains("available")) {
            montirTag.classList.remove("available");
            montirTag.classList.add("not-available");
            montirTag.textContent = "Montir tidak tersedia";
          }
          btnCall.classList.add("not-available");
          btnCall.disabled = true;
        }
        if (snapshot.docs.length > 0) {
          console.log("snapshot : ", snapshot);
          if (montirTag.classList.contains("not-available")) {
            montirTag.classList.remove("not-available");
            montirTag.classList.add("available");
            montirTag.textContent = "Montir tersedia";
          }
          btnCall.classList.remove("not-available");
          btnCall.disabled = false;
        }
      });
    }

    // 2. Jika bengkel tutup
    if (!userData.bengkelOpen) {
      if (bengkelTag.classList.contains("available")) {
        bengkelTag.classList.remove("available");
        bengkelTag.classList.add("not-available");
        bengkelTag.textContent = "Tutup";
      }
      if (montirTag.classList.contains("available")) {
        montirTag.classList.remove("available");
        montirTag.classList.add("not-available");
        montirTag.textContent = "Montir tidak tersedia";
      }
      btnCall.classList.add("not-available");
      btnCall.disabled = true;
    }

    // getDocs(
    //   query(
    //     collection(db, `userBengkel`, `${choosenBengkel.uid}`, `userMontir`),
    //     where("montirStatus", "==", true)
    //   )
    // )
    //   .then((snapshot) => {
    //     if (snapshot.docs.length === 0) {
    //       if (montirTag.classList.contains("available")) {
    //         montirTag.classList.remove("available");
    //         montirTag.classList.add("not-available");
    //         montirTag.textContent = "Montir tidak tersedia";
    //         console.log(
    //           "tes 1 : ",
    //           montirTag.classList.contains("not-available")
    //         );
    //       }
    //     }
    //     if (snapshot.docs.length > 0) {
    //       console.log("snapshot : ", snapshot);
    //       if (montirTag.classList.contains("not-available")) {
    //         montirTag.classList.remove("not-available");
    //         montirTag.classList.add("available");
    //         montirTag.textContent = "Montir tersedia";
    //         console.log("tes 2 : ", montirTag.classList.contains("available"));
    //       }
    //     }

    //     // apply bengkel tags
    //     if (
    //       userData.bengkelOpen &&
    //       bengkelTag.classList.contains("not-available")
    //     ) {
    //       bengkelTag.classList.remove("not-available");
    //       bengkelTag.classList.add("available");
    //       bengkelTag.textContent = "Buka";
    //     }
    //     if (
    //       !userData.bengkelOpen &&
    //       bengkelTag.classList.contains("available")
    //     ) {
    //       bengkelTag.classList.remove("available");
    //       bengkelTag.classList.add("not-available");
    //       bengkelTag.textContent = "Tutup";
    //     }
    //     // if (!userData.bengkelOpen && montirTag.classList.contains("available")) {
    //     //   montirTag.classList.remove("available");
    //     //   montirTag.classList.add("not-available");
    //     //   montirTag.textContent = "Montir tidak tersedia";
    //     // }
    //     console.log("tes 3 : ", montirTag.classList.contains("available"));
    //     if (montirTag.classList.contains("not-available")) {
    //       console.log("THIS");
    //       btnCall.classList.add("not-available");
    //       btnCall.disabled = true;
    //     }
    //     if (montirTag.classList.contains("available")) {
    //       console.log("THAT");
    //       btnCall.classList.remove("not-available");
    //       btnCall.disabled = false;
    //     }
    //   })
    //   .catch((err) => {
    //     console.log("error cek ketersediaan montir", err);
    //   });

    // Downlaod Photo & Check Bengkel Status
    if (bengkelImages.children.length !== 0) {
      let child = bengkelImages.firstElementChild;
      while (child) {
        bengkelImages.removeChild(child);
        child = bengkelImages.firstElementChild;
      }
    }
    let promiseImages = [];

    //   download bengkel photos
    userData.bengkelPhotos.forEach((picName) => {
      console.log("bengkelPhotos foreach");
      const storage = getStorage();
      const gsReference = ref(
        storage,
        `gs://aplikasi-bengkel-online.appspot.com/${picName}`
      );
      promiseImages.push(
        getDownloadURL(gsReference).then((url) => {
          const picBengkelHTML = `
				  <div class="slide">
					<img src="${url}" alt="" srcset="" />
				  </div>`;

          bengkelImages.insertAdjacentHTML("beforeend", picBengkelHTML);
        })
      );
    });
    Promise.all(promiseImages).then(() => {
      const slides = Array.from(document.querySelectorAll(".slide"));
      sliderFunction(slides);
    });

    //   Open Card
    mapHeader.style.display = "none";
    bengkelInfoCard.classList.add("brief");
    mapPengendara.style.height = "54%";
    map.resize();
    map.easeTo({
      center: choosenBengkel.bengkelCoords,
      zoom: 15,
      // pitch: 60,
      bearing: 0,
      pitch: 0,
      maxBounds: null,
      duration: 2000,
      easing(t) {
        return t;
      },
    });
  });

  watchBengkelAvailability();

  //   reviews
  reviewContainer.innerHTML = "";
  getDocs(collection(db, `userBengkel/${choosenBengkel.uid}/orders`)).then(
    (snapshot) => {
      snapshot.forEach((doc) => {
        const orderData = doc.data();
        if (orderData.ratedAt) {
          console.log("orderData reviews : ", orderData);
          //   loading review stars
          const starsHTML = countingStarsIcon(orderData, "r-icon");
          //   calculating review time
          nowDate = getDate();

          const reviewDate = orderData.ratedAt;
          let ratedAtText;
          console.log("nowDate.month : ", nowDate.month);
          console.log("reviewDate.month : ", reviewDate.month);

          if (reviewDate.month === nowDate.month) {
            const ratedAt = nowDate.day - reviewDate.day;
            if (ratedAt === 0) ratedAtText = `Hari ini`;
            if (ratedAt > 0) ratedAtText = `${ratedAt} hari yang lalu`;
          }
          if (reviewDate.month < nowDate.month) {
            const ratedAt = nowDate.month - reviewDate.month;
            ratedAtText = `${ratedAt} bulan yang lalu`;
          }
          //   loading review card
          const reviewHTML = `
		<div class="review">
            <div class="reviewer-profile">
              <div class="reviewer-picture">
                <img
				src="./src/images/customer-service.png"
                  alt="reviewer's profile picture"
                />
              </div>
              <p class="reviewer-name">${orderData.pengendaraName}</p>
			  </div>
			  <div class="review-rating">
              <div class="rating-stars">
			  ${starsHTML}
              </div>
              <div class="time">${ratedAtText}</div>
			  </div>
			  <div class="review-text">
			  ${orderData.review}
			  </div>
			  </div>`;
          noReviewText.style.display = "none";
          reviewContainer.insertAdjacentHTML("beforeend", reviewHTML);
          ratesArray.push(orderData.rate);
        }
      });
      console.log("ratesArray : ", ratesArray);
      if (ratesArray.length > 0) {
        let rateSum =
          ratesArray.reduce((acc, rate) => acc + rate) / ratesArray.length;
        rateSum = Math.round(rateSum);
        console.log("rateSume : ", rateSum);
        const statStarsHTML = countingStarsIcon({ rate: rateSum }, "c-icon");
        ratingSum.textContent = `${rateSum}`;
        ratingStars.innerHTML = "";
        ratingStars.innerHTML = statStarsHTML;
        ratingTotalReviewers.textContent = `(${ratesArray.length})`;
      }
      if (ratesArray.length === 0) {
        noReviewText.style.display = "block";

        const statStarsHTML = `
		<p class="rate">
			<svg class="c-icon" viewBox="0 0 32 32">
			<use href="#star" fill="url(#null)"></use>
			</svg>
		</p>
		<p class="rate">
			<svg class="c-icon" viewBox="0 0 32 32">
			<use href="#star" fill="url(#null)"></use>
			</svg>
		</p>
		<p class="rate">
			<svg class="c-icon" viewBox="0 0 32 32">
			<use href="#star" fill="url(#null)"></use>
			</svg>
		</p>
		<p class="rate">
			<svg class="c-icon" viewBox="0 0 32 32">
			<use href="#star" fill="url(#null)"></use>
			</svg>
		</p>
		<p class="rate">
			<svg class="c-icon" viewBox="0 0 32 32">
			<use href="#star" fill="url(#null)"></use>
			</svg>
		</p>
		
			`;
        ratingSum.textContent = `0`;
        ratingStars.innerHTML = "";
        ratingStars.innerHTML = statStarsHTML;
        ratingTotalReviewers.textContent = `(${ratesArray.length})`;
      }
      ratesArray = [];
    }
  );
};

// ===[MAP FUNCTIONS]===

export const showUserMarker = function () {
  const geojson = {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: userCoords,
    },
  };

  if (userMarker && userElement) {
    userElement.remove();
    userMarker.remove();
  }

  // CREATE NEW USER ELLEMENT & MARKER
  userElement = document.createElement("div");
  userElement.className = "user-marker";

  userMarker = new mapboxgl.Marker(userElement)
    .setLngLat(geojson.geometry.coordinates)
    .addTo(map);
};

const mainPengendaraConfig = function () {
  map.on("load", () => {
    pengendaraState = "map";
    console.log("map.on load . . .");
    console.log("map : ", map);

    showUserMarker();

    getDocs(collection(db, "userBengkel")).then((snapshot) => {
      snapshot.forEach((doc) => {
        const bengkelObject = doc.data();
        bengkelObject.uid = doc.id;
        bengkelObjects.push(bengkelObject);
      });
      console.log("bengkelObjects :", bengkelObjects);
      // Mencari bengkel terdekat
      // 1. Ambil data bengkel dari database
      // 2. Masukkan semua data ke array bengkelObjects [{}]
      // 3. Looping bengkelObjects, push ke featuresArray
      // 4. Input featuresArray ke geojsonBengkels
      let featuresArray = [];
      bengkelObjects.forEach((bengkelObject) => {
        console.log("bengkelObject : ", bengkelObject);
        featuresArray.push({
          type: "Feature",
          properties: bengkelObject,
          geometry: {
            type: "Point",
            coordinates: bengkelObject.bengkelCoords,
          },
        });
      });
      const geojsonBengkels = {
        type: "FeatureCollection",
        features: featuresArray,
      };
      console.log("geojsonbengkels : ", geojsonBengkels);
      //   console.log("featuresArray.properties : ", featuresArray[0].properties);
      // 4. Buat layer semua bengkel
      if (map.getSource("all-bengkel")) {
        map.getSource("all-bengkel").setData(geojsonBengkels);
      } else {
        map.addLayer({
          id: "all-bengkel",
          source: {
            type: "geojson",
            data: geojsonBengkels,
          },
          type: "circle",
          paint: {
            "circle-color": "#5555f6",
            "circle-radius": 8,
            "circle-opacity": 0,
          },
        });
      }
      // 5. Buat layer bengkel terdekat (diisi nanti)
      if (!map.getSource("nearest-bengkels")) {
        map.loadImage(bengkelIcon, (error, image) => {
          if (error) throw error;
          map.addImage("bengkel-icon", image);
        });
        map.addLayer({
          id: "nearest-bengkels",
          source: {
            type: "geojson",
            data: { type: "FeatureCollection", features: [] },
          },
          type: "symbol",
          layout: {
            "icon-image": "bengkel-icon",
            "icon-size": 0.05,
            "icon-allow-overlap": true,
          },
        });
        // 6. Buat layer buffer
        if (!map.getSource("search-radius")) {
          map.addLayer({
            id: "search-radius",
            source: {
              type: "geojson",
              data: { type: "FeatureCollection", features: [] },
            },
            type: "fill",
            paint: {
              "fill-color": "#00ff5e",
              "fill-opacity": 0.2,
            },
          });
        }
      }
      // 7. Jalankan function buffer
      const makeRadius = function (lngLatArray, radiusInMeters) {
        console.log("lngLatArray : ", lngLatArray);
        const point = turf.point(lngLatArray);
        const buffered = turf.buffer(point, radiusInMeters, {
          units: "meters",
        });
        return buffered;
      };
      const searchRadius = makeRadius(userCoords, 1800);
      map.getSource("search-radius").setData(searchRadius);

      // 7. Filter feature bengkel
      function spatialJoin(sourceGeoJSON, filterFeature) {
        const joined = sourceGeoJSON.features.filter(function (feature) {
          return turf.booleanPointInPolygon(feature, filterFeature);
        });
        return joined;
      }
      const featuresInBuffer = spatialJoin(geojsonBengkels, searchRadius);

      console.log("featuresInBuffer : ", featuresInBuffer);
      // 6. Tampilkan feature bengkel hasil filter
      map
        .getSource("nearest-bengkels")
        .setData(turf.featureCollection(featuresInBuffer));

      // 7. Event listener pada icon bengkel
      map.on("click", "nearest-bengkels", (e) => {
        // if (appState !== "main") return;
        console.log("click");
        choosenBengkel = e.features[0].properties;
        choosenBengkel.bengkelCoords = e.features[0].geometry.coordinates;
        showBengkelInfoCard();
      });
    });
  });

  map.on("click", (e) => {
    console.log(JSON.stringify(e.lngLat.wrap()));
  });
};

// export const getPengendaraPosition = function () {
//   navigator.geolocation.getCurrentPosition(loadMap, function () {
//     alert("Cannot get your location");
//   });
//   mainPengendaraConfig();
// };

export const getPengendaraPosition = function () {
  getLocationPromise()
    .then((res) => {
      offlineFallbackPage.classList.remove("open");
      mapPengendara.style.display = "block";
      loadMap(res, "map-pengendara");
      mainPengendaraConfig();
    })
    .catch((err) => console.log("error getPengendaraPosition : ", err.message));
};

// ====[EDIT PROFIL PENGENDARA]====

export const showProfilPengendara = function () {
  //   if (navPengendaraContainer.children.length !== 0) {
  //     let child = navPengendaraContainer.firstElementChild;
  //     while (child) {
  //       navPengendaraContainer.removeChild(child);
  //       child = navPengendaraContainer.firstElementChild;
  //     }
  //   }
  getDoc(doc(db, `userPengendara`, `${currentUser.uid}`)).then((userDoc) => {
    const userData = userDoc.data();
    navPengendaraName.textContent = `${userData.name}`;
    navPengendaraEmail.textContent = `${userData.email}`;
    navPengendaraPhone.textContent = `${userData.phoneNumber}`;
  });
};

export const submitOtpEditProfile = function (verificationId) {
  console.log("submitOtpEditPengendara");
  createLoadingBtn(formOtpVerify);
  clearInterval(setTimerTextEditPengendara);
  let otpCode = `${formOtpVerify["otp-code"].value}`;
  console.log(otpCode);

  const phoneCredential = PhoneAuthProvider.credential(verificationId, otpCode);
  console.log("masuk cok");
  deleteDoc(doc(db, `allUsers`, currentUser.phoneNumber))
    .then(() => {
      console.log("deleteDoc allUsers success!");
      updatePhoneNumber(currentUser, phoneCredential).then(() => {
        console.log("updatePhoneNumber credential success!");
        setDoc(
          doc(db, `userPengendara`, currentUser.uid),
          {
            phoneNumber: `+62${formEditPengendara["phone-number"].value}`,
          },
          {
            merge: true,
          }
        ).then(() => {
          console.log("setDoc userPengendara compelete");
          setDoc(
            doc(
              db,
              `allUsers`,
              `+62${formEditPengendara["phone-number"].value}`
            ),
            {
              phoneNumber: `+62${formEditPengendara["phone-number"].value}`,
            }
          ).then(() => {
            console.log("updatePhoneNumber ALL success!");
            // navPengendaraContainer.classList.remove("full-float-open");
            moveSection(otpVerifySection, editPengendaraSection);
            showModalMessage(editPengendaraSection, "Ubah Nomor HP berhasil");
            window.location.reload();
          });
        });
      });
    })
    .catch((err) => {
      moveSection(otpVerifySection, editPengendaraSection);
      window.location.reload();
      showModalMessage(editPengendaraSection, "Ubah Nomor HP");
      console.log("err updatePhoneNumber", err);
    });
};

export const openEditPengendara = async function (e) {
  e.preventDefault();

  console.log("currentUser : ", currentUser.uid);
  getDoc(doc(db, `userPengendara`, `${currentUser.uid}`))
    .then((userDoc) => {
      console.log(userDoc.data());
      const userData = userDoc.data();
      const slicedPhoneNumber = userData.phoneNumber.slice(3);

      //   Implement user data to form
      formEditPengendara["phone-number"].value = `${+slicedPhoneNumber}`;
      formEditPengendara["pengendara-name"].value = `${userData.name}`;

      formEditPengendara["email"].value = `${userData.email}`;
      moveSection(mainPengendaraSection, editPengendaraSection);

      //   ================
    })
    .catch((error) => console.log("error getdoc", error.message));
};

// ORDER SEQUENCES
export const inputOrderDesc = function () {
  console.log(choosenBengkel);
  problemDesc = formOrderDesc["problem-desc"].value;
  if (problemDesc == null) {
    showInputError(formOrderDesc);
    removeLoadingBtn(formOrderDesc);
    return;
  }
  mainPengendaraSection.querySelector(".overlay").remove();
  orderDescContainer.classList.remove("center-open");

  orderConfirmationContainer.classList.add("center-open");
  orderConfirmationContainer.querySelector(
    ".problem-desc"
  ).textContent = `${problemDesc}`;
  orderConfirmationContainer.querySelector(".bengkel-name").textContent =
    choosenBengkel.bengkelName;

  formOrderDesc.reset();
  const overlay = document.createElement("div");
  overlay.classList.add("overlay");
  mainPengendaraSection.insertBefore(overlay, orderConfirmationContainer);
  overlay.addEventListener("click", (e) => {
    overlay.remove();
    orderConfirmationContainer.classList.remove("center-open");
  });
};

// Montir Has Arrived!
// let nullStarArray = [0, 0, 0, 0, 0];

const insertRating = function (rating) {
  selectedStarArray = [];
  console.log("data id typeof : ", typeof rating);
  console.log(rating);
  selectedStarArray = [...fullStarArray.slice(0, +rating + 1)];
  console.log(selectedStarArray);
  const maksLoop = 4 - rating;
  for (let i = 1; i <= maksLoop; i++) {
    selectedStarArray.push(0);
  }
  console.log(selectedStarArray);
  rate = +rating + 1;
  showRatingStars();
};

export const showRatingStars = function () {
  if (ratingStarContainer.children.length !== 0) {
    let child = ratingStarContainer.firstElementChild;
    while (child) {
      ratingStarContainer.removeChild(child);
      child = ratingStarContainer.firstElementChild;
    }
  }
  selectedStarArray.forEach((rate, index) => {
    let fill;
    if (rate === 0) fill = `url(#null)`;
    if (rate === 1) fill = `url(#full)`;
    const starsHTML = `
		  <p class="rate">
			  <svg class="c-icon" viewBox="0 0 32 32">
				  <use href="#star" fill="${fill}" data-id="${index}"></use>
			  </svg>
		  </p>`;

    ratingStarContainer.insertAdjacentHTML("beforeend", starsHTML);
  });

  ratingStarContainer.querySelectorAll(".rate use").forEach((star) => {
    star.addEventListener("click", (e) => {
      insertRating(e.target.dataset.id);
    });
  });
};

export const submitRating = function (e) {
  nowDate = getDate();
  const ratingObj = {
    rate: rate,
    review: formGiveRating["review"].value,
    ratedAt: {
      day: nowDate.day,
      month: nowDate.month,
      year: nowDate.year,
    },
    status: "success",
  };
  if (isObjFull(ratingObj) === false) {
    showInputError(formGiveRating);
    removeLoadingBtn(formGiveRating);
    return;
  }
  console.log("ratingObj", ratingObj);

  setDoc(
    doc(db, `userBengkel/${choosenBengkel.uid}/orders/${nowOrderingId}`),
    ratingObj,
    {
      merge: true,
    }
  )
    .then((res) => {
      console.log("saving new review success!", res);
      cardMontirArrived.classList.remove("center-open");
      document.querySelector(".overlay").remove();
      showModalMessage(mainPengendaraSection, "Beri ulasan berhasil");
      formGiveRating.reset();
    })
    .catch((err) => console.log("err saving new review", err.message));

  //   addDoc(collection(db, `userBengkel/${choosenBengkel.uid}/orders/`), ratingObj)
  //     .then((res) => {
  //       console.log("saving new review success!", res);
  //     })
  //     .catch((err) => console.log("err saving new review", err.message));
};

// ====== [PANGGIL MONTIR] =======

export const watchOrderPengendara = function () {
  console.log("watchOrderPengendara. . .");
  onSnapshot(
    query(doc(db, `userBengkel/${choosenBengkel.uid}/orders/${nowOrderingId}`)),
    (doc) => {
      const orderData = doc.data();
      console.log("orderData : ", orderData);
      if (orderData.status === "running") {
        // Remove menunggu montir card
        mainPengendaraSection.querySelector(".overlay").remove();
        waitingCardPengendara.classList.remove("center-open");

        // Open montir berangkat card
        cardMontirIsComing.classList.add("center-open");
        cardMontirIsComing.querySelector(
          ".bengkel-name"
        ).textContent = `${choosenBengkel.bengkelName}`;
        cardMontirIsComing.querySelector(
          ".countdown-text"
        ).textContent = `Anda akan sampai ${orderData.travelTime} menit lagi`;

        const overlay = document.createElement("div");
        overlay.classList.add("overlay");
        mainPengendaraSection.insertBefore(overlay, cardMontirIsComing);
        countingMontirOtw(
          orderData.travelTime,
          cardMontirIsComing,
          "pengendara"
        );
      }
      if (orderData.status === "accepted") {
        clearTimeout(orderCountdown);
        console.log("orderCountdown cleared");
        // const pHTML = `Panggilan diterima!`;
        // waitingCardPengendara.insertAdjacentHTML("afterbegin", pHTML);
        waitingCardPengendara.querySelector(
          "p"
        ).textContent = `Panggilan diterima! Menunggu keberangkatan montir..`;
      }
      if (orderData.status === "arrived") {
        // Clear countingMontirOtw
        clearInterval(countingInterval);
        console.log("countingInterval cleared");
        mainPengendaraSection.querySelector(".overlay").remove();
        cardMontirIsComing.classList.remove("center-open");

        const waitingCostHTML = `
			<div class="card waiting-cost center-open">
				<h2>Montir telah sampai.</h2>
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
        mainPengendaraSection.insertAdjacentHTML("beforeend", waitingCostHTML);
        const cardWaitingCost =
          mainPengendaraSection.querySelector(".waiting-cost");
        const overlay = document.createElement("div");
        overlay.classList.add("overlay");
        mainPengendaraSection.insertBefore(overlay, cardWaitingCost);

        // ============================================================
      }
      if (orderData.status === "costDelivered") {
        console.log("costDelivered");
        mainPengendaraSection.querySelector(".overlay").remove();
        mainPengendaraSection.querySelector(".waiting-cost").remove();

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
      }
      if (orderData.status === "costPaid") {
        console.log("costPaid");
        mainPengendaraSection.querySelector(".overlay").remove();
        mainPengendaraSection.querySelector(".show-cost").remove();
        // Open review modal
        cardMontirArrived.classList.add("center-open");
        const overlay = document.createElement("div");
        overlay.classList.add("overlay");
        mainPengendaraSection.insertBefore(overlay, cardMontirArrived);
        selectedStarArray = [0, 0, 0, 0, 0];
        showRatingStars();
      }
      if (orderData.status === "rejected") {
        console.log("rejected");
        mainPengendaraSection.querySelector(".overlay").remove();
        waitingCardPengendara.classList.remove("center-open");

        orderRejectedCard.classList.add("center-open");
        let overlay = document.createElement("div");
        overlay.classList.add("overlay");
        mainPengendaraSection.insertBefore(overlay, orderRejectedCard);

        clearTimeout(orderCountdown);
        // setTimeout(() => {
        //   overlay.remove();
        //   orderRejectedCard.classList.remove("center-open");
        // }, 3000);
      }
    }
  );
};

const sendOrder = httpsCallable(functions, "sendOrder");
export const callMontir = async function () {
  try {
    console.log(choosenBengkel.uid);
    const bengkelResp = await getDoc(
      doc(db, `userBengkel`, `${choosenBengkel.uid}`)
    );
    const bengkelObj = bengkelResp.data();
    const token = bengkelObj.notificationTokens.token;
    console.log("bengkelObj", bengkelObj);
    console.log("notificationToken callmontir : ", token);
    console.log(typeof token);

    const travelObj = await getDistanceDurationRoute();
    const travelTimeText = `${travelObj.duration} menit`;
    console.log("travelTimeText : ", travelTimeText);
    // console.log("typeof travelTimeText", typeof travelTimeText);
    const sendOrderRes = await sendOrder({
      token: token,
      travelTime: travelTimeText,
    });

    console.log("sendOrderRes : ", sendOrderRes);

    nowDate = new Date().toLocaleDateString();
    const orderObj = {
      pengendaraName: currentUser.displayName,
      problem: problemDesc,
      status: "waiting",
      travelTime: travelObj.duration,
      travelDistance: travelObj.distance,
      createdAt: `${nowDate}`,
      userCoords: userCoords,
      pengendara_phoneNumber: currentUser.phoneNumber,
    };
    const addOrderResp = await addDoc(
      collection(db, `userBengkel/${choosenBengkel.uid}/orders`),
      orderObj
    );
    // console.log("addorderresp : ", addOrderResp);
    nowOrderingId = addOrderResp.id;

    // Countdown order 2 menit
    orderCountdown = setTimeout(() => {
      console.log("Order Countdown is Over");
      updateDoc(
        doc(
          db,
          `userBengkel`,
          `${choosenBengkel.uid}`,
          `orders`,
          `${nowOrderingId}`
        ),
        {
          status: "rejected",
        }
      );
    }, 120000);
    return addOrderResp;
  } catch (error) {
    console.log("error callmontir", error.message);
  }
};
