import { LoaderTargetPlugin } from "webpack";

// ATTRIBUTES
const userCol = collection(db, "users");
let appState = "main";
let map;
let userCoords;
let userElement;
let userMarker;
let currentBengkelId;
let currentBengkelCoord;
let geojsonBengkel;
let featuresArray = [];
const bengkelObjects = [];

// Event Listeners :
// login
// regis
// btnLogout

// CLASS APP
// ============
// ATTRIBUTES
// appState
// map
// userCoord
// userElement
// userMarker
//
// bengkels = []
// geojsonBengkel
// selectedBengkel
// ----------
// FUNCTIONS
// signInWithEmailAndPassword
// createUserWithEmailAndPassword
// signOut
// onAuthStateChanged
// getPosition
// loadMap
// showUserMarker
// getBengkels
// filterBengkels
// showBengkelsMarker(){showBengkelInfoCard for each marker}
// selectBengkel
// showRoute
// removeRoute

// CLASS USERINTERFACE
// ============
// ATTRIBUTES
//
// --------------------
// EVENT LISTENERS
// authToggleLinks => click
// formSignIn => submit
// formSignUp => submit
// btnLogout => click
// btnCloseInfo => click
// btnCloseRoute => click

// --------------------
// FUNCTIONS
// toggleSignForm
// showBengkelInfoCard(selectedBengkel)
// closeBengkelInfoCard
// closeRouteInfo (){ app.removeRoute }
