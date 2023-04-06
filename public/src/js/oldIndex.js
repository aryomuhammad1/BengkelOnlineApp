// IMPORT DEPENDENCIES
import { auth, db } from "./firebase-config";
import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signOut,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";

import bengkelIcon from "../images/bengkel-icon.png";

// ===================================================================
// = WELCOMING PAGE =
// const optionPengendara = document.querySelector('.option-pengendara');
// const optionBengkel = document.querySelector('.option-bengkel');
// const authBackBtn = document.querySelector('.auth-back-btn');

// const welcomeContainer = document.querySelector('.welcome-page');
// jfdsjlkfds
// const SignInContainer = document.querySelector('.auth-SignIn');
// const signupContainer = document.querySelector('.auth-signup');

// const btnSignInBack = SignInContainer.querySelector('.btn-auth-back');
// const btnSignupBack = signupContainer.querySelector('.btn-auth-back');
// const btnSignIn = document.querySelector('.btn-SignIn');
// const btnSignup = document.querySelector('.btn-signup');

// WELCOMING LOGIC
// btnSignIn.addEventListener('click', (e)=>{
//   e.preventDefault();
//   welcomeContainer.classList.remove('open');
//   SignInContainer.classList.add('open');
// })

// btnSignup.addEventListener('click', (e)=>{
//   e.preventDefault();
//   welcomeContainer.classList.remove('open');
//   signupContainer.classList.add('open');
// })

// btnSignInBack.addEventListener('click', (e)=>{
//   SignInContainer.classList.remove('open');
//   welcomeContainer.classList.add('open');
// })
// btnSignupBack.addEventListener('click', (e)=>{
//   signupContainer.classList.remove('open');
//   welcomeContainer.classList.add('open');
// })

// optionPengendara.addEventListener('click', (e)=>{
//   userOption = 'pengendara';
//   console.log(userOption);
//   welcomeContainer.classList.remove('open');
// });
// optionBengkel.addEventListener('click', (e)=>{
//   userOption = 'bengkel';
//   console.log(userOption);
//   welcomeContainer.classList.remove('open');
// });

// authBackBtn.addEventListener('click', (e)=>{
//   userOption = '';
//   welcomeContainer.classList.add('open');
// })

// ===================================================================

// === GENERAL VARIABLES ===
const userCol = collection(db, "users");
let appState = "main";

// === AUTH PAGE ===
const modals = document.querySelectorAll(".modal");
// const authSwitchLinks = document.querySelectorAll(".switch");
const formSignIn = document.querySelector(".signin-form");
const formSignUp = document.querySelector(".signup-form");
const btnLogout = document.querySelector(".btn-logout");

const authContainer = document.querySelector(".auth");
const waitingText = document.querySelector(".waitingText");

// let userOption;
// console.log('cek user option : ', userOption);
// if (!userOption) {
//   welcomeContainer.classList.add('open');
// };

// authSwitchLinks.forEach((authSwitchLink) => {
//   authSwitchLink.addEventListener("click", (e) => {
//     e.preventDefault();
//     modals.forEach((modal) => {
//       modal.classList.toggle("active");
//     });
//   });
// });

// SignIn LOGIC
formSignIn.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = formSignIn.email.value;
  const password = formSignIn.password.value;
  formSignIn.reset();

  signInWithEmailAndPassword(auth, email, password)
    .then((cred) => {
      console.log("The user signed in");
    })
    .catch((err) => console.log(err.message));
});

// SignUp LOGIC
formSignUp.addEventListener("submit", (e) => {
  e.preventDefault();
  const fullName = formSignUp.fullname.value;
  const email = formSignUp.email.value;
  const password = formSignUp.password.value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((cred) => {
      addDoc(userCol, {
        email: cred.user.email,
        fullName: fullName,
        createdAt: serverTimestamp(),
      }).then(() => {
        formSignUp.reset();
        console.log("User Created: ", cred.user);
      });
    })
    .catch((err) => console.log(err.message));
});

// LOGOUT LOGIC
btnLogout.addEventListener("click", (e) => {
  e.preventDefault();
  signOut(auth)
    .then(() => {
      console.log("The user signed out");
    })
    .catch((err) => console.log(err.message));
});
// ===================================================================

// === MAIN PAGE ===
const mapContainer = document.querySelector("#map");
// const openedMap = document.querySelector('.main.open #map');
const mainContainer = document.querySelector(".main");
const mapHeader = document.querySelector(".map-header");

const infoCard = document.querySelector(".info-card");
const gallery = document.querySelector(".bengkel-gallery");
const btnRoute = document.querySelector(".btn-rute");
const infoDynamicBox = document.querySelector(".bengkel-dynamic-info");
// const infoNav = document.querySelector('.info-nav');
const btnInfoBack = document.querySelector(".info-nav svg");

const routeCard = document.querySelector(".route-card");
const btnRouteBack = document.querySelector(".btn-back");

let map;
let userCoords;
let userElement;
let userMarker;
let bengkelPoints;
let currentBengkel;
let currentBengkelId;
let currentBengkelCoord;
let geojsonBengkel;
let featuresArray = [];

const bengkelObjects = [
  {
    userId: "00",
    bName: "Bengkel Mas Kiri",
    work_time: " ",
    services: ["Tambal ban", "Ganti oli", "Strum accu", "Kelistrikan"],
    wa_number: "081291056652",
    coords: [109.31782695856032, -7.424573498557848],
  },
  {
    userId: "01",
    bName: "Bengkel Mas Deket",
    work_time: " ",
    services: ["Tambal ban", "Ganti oli"],
    wa_number: "082134656211",
    coords: [106.89921929882291, -6.121838871902696],
  },
  {
    userId: "02",
    bName: "Bengkel Mas Rizky",
    work_time: " ",
    services: [
      "Sedia spare part motor",
      "Sedia aksesoris motor",
      "Tambal ban",
      "Tambal ban",
      "Tambal ban",
      "Tambal ban",
      "Strum accu",
      "Modifikasi motor",
      "Ganti oli",
    ],
    wa_number: "083224656211",
    coords: [109.33615511252947, -7.395205408116794],
  },
  {
    userId: "03",
    bName: "Bengkel Mas Jauh",
    work_time: " ",
    services: [
      "Sedia spare part motor",
      "Sedia aksesoris motor",
      "Tambal ban",
      "Strum accu",
      "Modifikasi motor",
      "Ganti oli",
    ],
    wa_number: "083224656211",
    coords: [110.44022243206336, -6.997814009973965],
  },
  {
    userId: "04",
    bName: "Bengkel Mas Kanan",
    work_time: " ",
    services: [
      "Sedia spare part motor",
      "Sedia aksesoris motor",
      "Tambal ban",
      "Strum accu",
      "Modifikasi motor",
      "Ganti oli",
    ],
    wa_number: "083224656211",
    coords: [109.3535568091562, -7.422839752325714],
  },
  {
    userId: "05",
    bName: "Bengkel Pwt",
    work_time: " ",
    services: [
      "Sedia spare part motor",
      "Sedia aksesoris motor",
      "Tambal ban",
      "Strum accu",
      "Modifikasi motor",
      "Ganti oli",
    ],
    wa_number: "083224656211",
    coords: [109.25032918970783, -7.402285971758474],
  },
];

// [SHOWING BENGKEL INFO CARD]
const showBengkelInfoCard = function () {
  const bengkelData = bengkelObjects.find(
    (obj) => obj.userId === currentBengkelId
  );
  let htmlServiceList = ``;
  bengkelData["services"].forEach(
    (service) => (htmlServiceList += `<li>${service}</li>`)
  );
  let htmlBengkelInfo = ``;
  htmlBengkelInfo = `
  <div class="info-header">
    <p class="info-name">${bengkelData["bName"]}</p>
    <div class="status"></div>
  </div> 
  <div class="bengkel-images">
    <div class="bengkel-image">
      <img src="../src/images/bengkel_1.jpg" alt="" srcset="">
    </div>
    <div class="bengkel-image">
      <img src="../src/images/bengkel_2.jpg" alt="" srcset="">
    </div>
    <div class="bengkel-image">
      <img src="../src/images/bengkel_3.jpg" alt="" srcset="">
    </div>
  </div>
  <div class="services">
    <div class="service">
        <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
            width="96.000000pt" height="96.000000pt" viewBox="0 0 96.000000 96.000000"
            preserveAspectRatio="xMidYMid meet">
            <g transform="translate(0.000000,96.000000) scale(0.100000,-0.100000)"
            stroke="none">
            <path d="M386 870 c-63 -16 -153 -70 -197 -117 -22 -24 -55 -74 -72 -111 -29
            -61 -32 -76 -32 -163 0 -90 2 -99 37 -171 45 -90 104 -148 191 -188 72 -33
            137 -47 137 -29 0 6 9 23 20 39 l20 27 -52 7 c-56 8 -128 41 -175 80 -16 14
            -45 53 -64 88 -31 58 -34 70 -33 148 0 69 5 94 24 135 115 237 450 246 567 15
            18 -36 35 -76 37 -91 4 -15 21 -35 47 -52 l42 -28 -6 63 c-20 191 -182 344
            -375 354 -42 2 -94 -1 -116 -6z"/>
            <path d="M440 607 l0 -113 -70 -69 c-38 -38 -70 -74 -70 -80 0 -12 36 -45 48
            -45 4 0 44 37 90 83 l82 82 0 128 0 127 -40 0 -40 0 0 -113z"/>
            <path d="M691 426 c-87 -48 -50 -186 49 -186 51 0 100 49 100 99 0 75 -83 124
            -149 87z"/>
            <path d="M646 149 c-48 -12 -103 -44 -116 -69 -6 -10 -10 -32 -10 -49 l0 -31
            220 0 220 0 0 35 c0 42 -31 78 -87 102 -46 19 -174 26 -227 12z"/>
            </g>
        </svg>
        <p class="waktu-kerja"><span>Buka</span> . Tutup pukul 20.00</p>
    </div>
    <div class="service">
        <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
            width="96.000000pt" height="96.000000pt" viewBox="0 0 96.000000 96.000000"
            preserveAspectRatio="xMidYMid meet">
            <g transform="translate(0.000000,96.000000) scale(0.100000,-0.100000)"
            stroke="none">
            <path d="M437 914 c-4 -4 -7 -17 -7 -29 0 -36 -25 -51 -55 -31 -33 22 -48 20
            -75 -9 -23 -25 -23 -25 -5 -59 21 -39 18 -46 -28 -62 -27 -9 -32 -16 -35 -49
            -4 -41 8 -55 46 -55 30 0 38 -24 18 -55 -22 -33 -20 -48 7 -73 28 -27 32 -27
            66 -3 33 24 51 15 60 -30 7 -33 9 -34 51 -34 44 0 45 1 48 33 4 42 24 50 68
            26 l34 -19 27 28 28 27 -19 34 c-24 44 -16 64 26 68 32 3 33 4 33 48 0 43 -1
            45 -37 53 -42 10 -46 22 -21 66 17 29 17 30 -6 55 -28 30 -47 33 -72 10 -25
            -22 -47 -11 -57 28 -7 30 -12 33 -48 36 -22 2 -43 0 -47 -4z m89 -187 c54 -46
            23 -130 -47 -130 -33 0 -79 39 -79 68 0 26 22 63 44 73 33 17 53 14 82 -11z"/>
            <path d="M136 382 c-49 -21 -91 -43 -93 -49 -4 -11 81 -210 96 -226 4 -4 28 4
            53 18 l46 25 113 -56 c153 -75 153 -75 350 52 190 122 221 148 217 183 -5 46
            -45 39 -144 -25 -49 -31 -103 -73 -121 -93 l-31 -36 -119 1 c-123 1 -173 12
            -173 40 0 13 6 15 28 10 15 -4 72 -9 128 -13 113 -6 144 3 144 42 0 32 -35 55
            -85 55 -65 0 -106 17 -152 62 -40 39 -47 42 -105 45 -55 3 -75 -2 -152 -35z"/>
            <path d="M571 386 l-54 -33 39 -5 c31 -4 50 1 92 26 28 17 52 34 52 38 0 21
            -79 5 -129 -26z"/>
            <path d="M755 390 c-12 -4 -42 -21 -67 -37 -40 -25 -44 -31 -33 -46 7 -9 16
            -17 20 -17 13 0 135 81 135 90 0 6 -27 22 -33 19 -1 0 -11 -4 -22 -9z"/>
            </g>
        </svg>
        <ul>
        ${htmlServiceList}
        </ul>
    </div>
    <div class="service">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
        <p>${bengkelData["wa_number"]}</p>
    </div>
  </div>`;
  infoDynamicBox.insertAdjacentHTML("afterbegin", htmlBengkelInfo);
  // infoCard.style.display = 'block';
  mapHeader.style.display = "none";
  infoCard.classList.add("open");
  appState = "infoCard";
  // btnLogout.style.display = 'none';
};

// [SHOWING ROUTE]
async function showRoute(routeType) {
  const end = currentBengkelCoord;
  const query = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/cycling/${userCoords[0]},${userCoords[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
    { method: "GET" }
  );
  const json = await query.json();
  const data = json.routes[0];
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

  // if(routeType=='justShow'){
  const bounds = new mapboxgl.LngLatBounds(userCoords, userCoords);
  for (const coord of route) {
    bounds.extend(coord);
  }
  map.fitBounds(bounds, {
    padding: 30,
    duration: 1000,
  });
  appState = "route";
}
const closeRoute = function () {
  routeCard.style.display = "none";
  btnRouteBack.style.display = "none";
  showBengkelInfoCard();
};

// DOM EVENT HANDLERS
btnInfoBack.addEventListener("click", () => {
  if (map.getSource("route")) {
    map.removeLayer("route");
    map.removeSource("route");
    map.easeTo({
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
  }
  infoDynamicBox.replaceChildren();
  infoCard.classList.remove("open");
  mapHeader.style.display = "flex";
  mapContainer.style.height = "100%";
  map.resize();
  appState = "main";
  // btnLogout.style.display = 'block';
});
btnRoute.addEventListener("click", () => {
  infoDynamicBox.replaceChildren();
  infoCard.classList.remove("open");
  routeCard.style.display = "block";
  btnRouteBack.style.display = "block";
  mapContainer.style.height = "78%";
  map.resize();
  showRoute("justShow");
});
btnRouteBack.addEventListener("click", () => {
  closeRoute();
});

// GENERATE A MAP - MAP CONFIG
const showUserMarker = function () {
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
  userElement.className = "marker-user";

  userMarker = new mapboxgl.Marker(userElement)
    .setLngLat(geojson.geometry.coordinates)
    .addTo(map);
};

const loadMap = function (position) {
  const { latitude, longitude } = position.coords;
  userCoords = [longitude, latitude];
  console.log("Ini loadMap function");

  mapboxgl.accessToken =
    "pk.eyJ1IjoiYXJ5b211aGFtbWFkLWRldiIsImEiOiJjbDR3OXhjc3QxaHYzM2NudXkxNjE1cjl6In0.Pn0BSM87Vv_JWFiXZg7doQ";
  map = new mapboxgl.Map({
    container: "map", // container ID
    style: "mapbox://styles/mapbox/streets-v11", // style URL
    center: userCoords, // starting position [lng, lat]
    // pitch: 68, // pitch in degrees
    // bearing: 0, // bearing in degrees
    zoom: 14, // starting zoom
  });

  map.on("load", () => {
    console.log("ini map.on load");
    waitingText.classList.remove("active");
    // bName: 'Bengkel Mas Kanan',
    // work_time: ' ',
    // services: ['Sedia spare part motor',
    //           'Sedia aksesoris motor',
    //           'Tambal ban',
    //           'Strum accu',
    //           'Modifikasi motor',
    //           'Ganti oli',],
    // wa_number: '083224656211',
    // coords: [109.3535568091562, -7.422839752325714]

    showUserMarker();
    // Mencari bengkel terdekat
    // 1. Ambil data bengkel dari database
    // 2. Masukkan semua data ke array [{}]
    // 3. Looping data bengkel, push featruesArray, input ke geojsonbengkel
    bengkelObjects.forEach((bengkelObj) => {
      featuresArray.push({
        type: "Feature",
        properties: {
          userId: bengkelObj["userId"],
          bName: bengkelObj["bName"],
          work_time: bengkelObj["work_time"],
          services: bengkelObj["services"],
          wa_number: bengkelObj["wa_number"],
        },
        geometry: {
          type: "Point",
          coordinates: bengkelObj["coords"],
        },
      });
    });
    geojsonBengkel = {
      type: "FeatureCollection",
      features: featuresArray,
    };
    // 4. Buat layer semua bengkel
    map.addLayer({
      id: "all-bengkel",
      source: {
        type: "geojson",
        data: geojsonBengkel,
      },
      type: "circle",
      paint: {
        "circle-color": "#5555f6",
        "circle-radius": 8,
        "circle-opacity": 0,
      },
    });
    // 5. Buat layer bengkel terdekat (diisi nanti)
    // =====TES TES=====
    map.loadImage(bengkelIcon, (error, image) => {
      if (error) throw error;
      map.addImage("bengkel-icon", image);
    });
    // ========
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

    // 7. Jalankan function buffer
    const makeRadius = function (lngLatArray, radiusInMeters) {
      const point = turf.point(lngLatArray);
      const buffered = turf.buffer(point, radiusInMeters, { units: "meters" });
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
    const featuresInBuffer = spatialJoin(geojsonBengkel, searchRadius);

    // 6. Tampilkan feature bengkel hasil filter
    map
      .getSource("nearest-bengkels")
      .setData(turf.featureCollection(featuresInBuffer));

    // 7. Event listener pada icon bengkel
    map.on("click", "nearest-bengkels", (e) => {
      if (appState !== "main") return;
      currentBengkelId = e.features[0].properties.userId;
      currentBengkelCoord = e.features[0].geometry.coordinates.slice();
      showBengkelInfoCard();
    });
  });

  map.on("click", (e) => {
    console.log(JSON.stringify(e.lngLat.wrap()));
  });
};

const getPosition = function () {
  navigator.geolocation.getCurrentPosition(loadMap, function () {
    alert("Cannot get your location");
  });
};

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Active User : ", user);
    authContainer.classList.remove("open");
    mainContainer.classList.add("open");
    waitingText.classList.add("active");
    getPosition();
  } else {
    console.log("[No Active User]");
    mainContainer.classList.remove("open");
    authContainer.classList.add("open");
    waitingText.classList.remove("active");
  }
});

// // LIVE LOCATION
// // let watching=0;
// const liveText = document.querySelector(".pricing span");
// const btnStart = document.querySelector(".btn-start");

// const liveGuide = function (position) {
//   const { latitude, longitude } = position.coords;
//   userCoords = [longitude, latitude];

//   showUserMarker();
//   showRoute("justGuide");
//   liveText.textContent = "";
//   liveText.textContent = `${userCoords}`;
// };

// btnStart.addEventListener("click", (e) => {
//   // if(watching==0){
//   // watching=1;
//   map.easeTo({
//     zoom: 18,
//     pitch: 70,
//     // bearing: ,
//     duration: 1500,
//     easing(t) {
//       return t;
//     },
//   });

//   navigator.geolocation.watchPosition(liveGuide, function () {
//     alert("Cannot get your live location");
//   });
//   // }
// });
