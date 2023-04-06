// IMPORT DEPENDENCIES
console.log("FROM INDEX");
import {
  updatePhoneNumber,
  PhoneAuthProvider,
  RecaptchaVerifier,
  updateProfile,
  signOut,
} from "firebase/auth";
import bengkelIcon from "../images/bengkel-icon.png";
import { auth, checkOnlineStatus, db } from "./firebase-config";
import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  getDoc,
  setDoc,
  doc,
  where,
  updateDoc,
  query,
} from "firebase/firestore";

import {
  signingUpUser,
  recaptchaVerifierMaker,
  currentUser,
  signingInUser,
  openSignupBengkel,
  regisPhoto,
  validateUser,
  isObjFull,
} from "./auth";
import {
  getPengendaraPosition,
  showRoute,
  closeRoute,
  closeBengkelInfoCard,
  showProfilPengendara,
  inputOrderDesc,
  submitEditPengendara,
  showRatingStars,
  submitRating,
  callMontir,
  choosenBengkel,
  watchOrderPengendara,
  submitOtpEditProfile,
  openEditPengendara,
  unsubWatchBengkelStatus,
  unsubWatchMontirStatus,
} from "./main";
import {
  showMontirList,
  submitAddMontir,
  watchRequestOrders,
  updateBengkelStatus,
  updateAllMontirStatus,
  openEditBengkel,
  submitEditBengkel,
  signingOutBengkel,
  commandMontir,
  showSuccessOrders,
  showSuccessOrderCard,
  showProgressOrder,
  unsubWatchBengkel,
  editLocationBengkel,
  rejectOrder,
} from "./main-bengkel";
import { removeMap, map } from "./mapbox-config";
import {
  montirData,
  montirGo,
  montirIsArrived,
  montirRequestCost,
  unsubWatchOrderCost,
} from "./main-montir";

// [ GENERAL ]

export let appState;
export let bengkelStatus;
const btnSectionBack = document.querySelectorAll(".btn-section-back");
export const changeBengkelStatusVariable = function (status) {
  bengkelStatus = status;
  console.log("bengkelStatus from index.js : ", bengkelStatus);
};

window.addEventListener("DOMContentLoaded", (e) => {
  //   openingSection.classList.add("active");
  //   appState = openingSection;
  //   appState = mainPengendaraSection;
  //   appState = mainBengkelSection;
  //   console.log(currentUser);
});
window.addEventListener("load", async function (e) {
  if ("serviceWorker" in navigator) {
    try {
      console.log("registerServiceWorker . . .");
      await navigator.serviceWorker.register("./firebase-messaging-sw.js", {
        scope: "/",
      });
      console.log("SW Registered !");
      return;
    } catch (err) {
      return err;
    }
  }
});

// INSTALL
export let deferredPrompt;
// addBtn.style.display = "none";

window.addEventListener("beforeinstallprompt", (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  console.log("beforeinstallprompt event", e);
  e.preventDefault();
  deferredPrompt = e;

  const btnNavInstallApp = document.querySelectorAll(".btn-install-app");
  const installApp = function () {
    // Show the prompt
    console.log("btnNavInstallApp clicked, deferredPrompt :", deferredPrompt);
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the A2HS prompt");
      } else {
        console.log("User dismissed the A2HS prompt");
      }
    });
  };
  btnNavInstallApp.forEach((btn) => {
    btn.classList.remove("not-active");
    btn.addEventListener("click", installApp);
  });
});

// const body = document.querySelector("body");
// export const showInstallBanner = function () {
//   console.log("showInstallBanner . . .");
//   const installBannerHTML = `
// 	<div class="card install-banner brief-bottom">
// 	<p class="install-text">Pasang aplikasi untuk pengalaman lebih baik</p>
// 		<button class="btn btn-yes">Pasang aplikasi</button>
// 	</div>`;
//   body.insertAdjacentHTML("afterbegin", installBannerHTML);
// };

// if (deferredPrompt == undefined) {
//   alert("Anda sudah melakukan pemasangan aplikasi");
//   btnNavInstallApp.forEach((btn) => {
// 	btn.removeee
//     btn.addEventListener("click", (e) => {
//     });
//   });
// }

// [AUTHENTICATION]
// Logout
const btnLogout = document.querySelectorAll(".btn-logout");
// Opening Section
export const openingSection = document.querySelector(".opening");
const btnSelectSignIn = document.querySelector(".opening-options .btn-prim");
const btnSelectSignUp = document.querySelector(".opening-options .btn-second");

// SignIn Section
export const signInSection = document.querySelector(".signin");
export const formSignIn = document.querySelector(".signin-form");
export const btnSignIn = document.querySelector("#btn-signin");

// SignUp As Section
const signUpAsSection = document.querySelector(".signup-as");
const btnAsPengendara = document.querySelector(".btn-signup-as-2");
const btnAsBengkel = document.querySelector(".btn-signup-as-1");
// const btnAsMontir = document.querySelector(".btn-signup-as-1");
// SignUp Form Section
export const signUpPengendaraSection =
  document.querySelector(".signup-pengendara");
export const signUpBengkelSection = document.querySelector(".signup-bengkel");
export const formSignUpPengendara =
  signUpPengendaraSection.querySelector("form");
export const formSignUpBengkel = signUpBengkelSection.querySelector("form");

export const regisPhotoSection = document.querySelector(".photo-regis");
export const btnRegisPhoto = document.querySelector(
  ".photo-regis form .btn-lanjut"
);
export const outputSignup = document.querySelector("#result-signup");

// OTP Section
export const otpVerifySection = document.querySelector(".otp-verify");
export const formOtpVerify = otpVerifySection.querySelector("form");
export const otpTimerText = otpVerifySection.querySelector(".otp-timer span");
export const otpPhoneNumberText = otpVerifySection.querySelector(
  ".otp-header-text span"
);

// [MAIN PENGENDARA]
// Main Pengendara Section
export const mainPengendaraSection = document.querySelector(".main-pengendara");
export const offlineFallbackPage = document.querySelector(".offline-fallback");
export const offlineFallbackBtn = offlineFallbackPage.querySelector(".btn-yes");
export const mapPengendara = document.querySelector("#map-pengendara");
export const mapHeader = document.querySelector(".map-header");
const headerLogo = document.querySelector(".header-logo");
const headerUser = mapHeader.querySelector(".photo-box");
const headerUserPhoto = headerUser.querySelector(".user-photo");
export const navPengendaraContainer = document.querySelector(".nav-pengendara");
export const navPengendaraPhone =
  navPengendaraContainer.querySelector(".phone-number");
export const navPengendaraEmail =
  navPengendaraContainer.querySelector(".email");
export const navPengendaraName =
  navPengendaraContainer.querySelector(".identity-name");
const btnCloseNavPengendara = document.querySelector(".btn-close");
const btnEditPengendara = document.querySelector(".btn-edit-pengendara");

export const bengkelInfoCard = document.querySelector(".bengkel-info");
const btnInfoBack = bengkelInfoCard.querySelector(".btn-card-back");
const infoButtons = bengkelInfoCard.querySelector(".info-buttons");
export const btnCall = bengkelInfoCard.querySelector(".btn-call");
export const cardMontirIsComing = document.querySelector(".montir-is-coming");

const btnRoute = bengkelInfoCard.querySelector(".btn-route");
const btnViewMore = bengkelInfoCard.querySelector(".btn-view-more");
export const infoBengkelName =
  bengkelInfoCard.querySelector(".info-bengkel-name");
export const bengkelTag = bengkelInfoCard.querySelector(".bengkel-tag");
export const montirTag = bengkelInfoCard.querySelector(".montir-tag");
export const bengkelImages = bengkelInfoCard.querySelector(".images-slider");
export const ratingStat = bengkelInfoCard.querySelector(".rating-stat");
export const ratingSum = bengkelInfoCard.querySelector(".rating-sum");
export const ratingStars = bengkelInfoCard.querySelector(".rating-stars");
export const ratingTotalReviewers = bengkelInfoCard.querySelector(
  ".rating-total-reviewers"
);
// export const joinSince = bengkelInfoCard.querySelector(".join-since span");
export const infoBengkelAddress = bengkelInfoCard.querySelector(
  ".services.address .services-text"
);
export const infoBengkelOpenTime = bengkelInfoCard.querySelector(
  ".services.open-time .services-text"
);
export const infoBengkelDesc = bengkelInfoCard.querySelector(
  ".services.description .services-text"
);
export const reviewContainer = bengkelInfoCard.querySelector(".review-cards");
export const noReviewText = bengkelInfoCard.querySelector(".no-review-text");
export const showRouteCard = document.querySelector(".show-route");
const btnRouteBack = showRouteCard.querySelector(".btn-card-back");

// Edit Pengendara Profil
export const editPengendaraSection = document.querySelector(
  ".pengendara-edit-profil"
);
export const formEditPengendara = editPengendaraSection.querySelector("form");

// Order Sequences
export const orderDescContainer = document.querySelector(".call-montir-desc");
export const formOrderDesc = orderDescContainer.querySelector("form");
export const orderConfirmationContainer = document.querySelector(
  ".order-confirmation"
);
const orderConfirmationButtons = orderConfirmationContainer.querySelector(
  ".order-confirmation-buttons"
);
const btnOrderConfirmYes = orderConfirmationButtons.querySelector(".btn-yes");
const btnOrderConfirmNo = orderConfirmationButtons.querySelector(".btn-no");
export const waitingCardPengendara =
  mainPengendaraSection.querySelector(".waiting-card");

export const orderRejectedCard =
  mainPengendaraSection.querySelector(".order-rejected");

// CARD Montir Arrived
export const cardMontirArrived = document.querySelector(".montir-arrived");
export const formGiveRating = cardMontirArrived.querySelector("form");
export const ratingStarContainer =
  cardMontirArrived.querySelector(".rating-stars");

// [MAIN BENGKEL]
// Register Location Section
export const registerLocationSection =
  document.querySelector(".register-location");
export const mapRegisLocation = document.querySelector("#map-regis-location");

export const btnSelectLocation = document.querySelector(".btn-select-location");

// Main Bengkel Section
export const mainBengkelSection = document.querySelector(".main-bengkel");
export const mainBengkelButtons = mainBengkelSection.querySelector(
  ".main-bengkel-buttons"
);

export const bengkelProfileName = mainBengkelSection.querySelector(
  ".bengkel-profile-text .bengkel-name"
);
export const bengkelProfileOpenTime = mainBengkelSection.querySelector(
  ".bengkel-profile-text .bengkel-open-time"
);

// Bengkel Navigation
const btnEditProfil = document.querySelector(".btn-edit-bengkel");
const btnEditLocation = document.querySelector(".btn-edit-location-bengkel");
const btnSuccessOrder = document.querySelector(".btn-success-order");
const btnOnProgressOrder = document.querySelector(".btn-on-progress-order");
const btnSettingMontir = document.querySelector(".btn-setting-montir");

// Edit Profil Section
// Success Order Section
export const successOrderSection = document.querySelector(".success-order");
export const successOrderContainer = document.querySelector(".success-orders");
export const openSuccessOrder = document.querySelector(".open-success-order");
export const starsContainer = openSuccessOrder.querySelector(".rating-stars");
// On Progress Order Section
export const progressOrderSection =
  document.querySelector(".order-on-progress");
export const progressOrderContainer = document.querySelector(
  ".on-progress-orders"
);
// Setting Montir Section
export const settingMontirSection = document.querySelector(".setting-montir");
export const montirSettingList = settingMontirSection.querySelector(".montirs");
export const noMontirSetting = settingMontirSection.querySelector(".no-montir");
const btnAddMontir = document.querySelector(".btn-add-montir");
export const addMontirSection = document.querySelector(".add-montir");
export const formAddMontir = addMontirSection.querySelector("form");
// export const deleteMontirConfirm = settingMontirSection.querySelector(
//   ".delete-montir-confirm"
// );
// export const deleteMontirConfirmButtons =
//   deleteMontirConfirm.querySelector(".buttons");

const btnOpenBengkel = document.querySelector(".btn-open-bengkel");
const btnCloseBengkel = document.querySelector(".btn-close-bengkel");
const closeBengkelConfirmCard = document.querySelector(".close-bengkel");
const closeBengkelConfirmButtons = closeBengkelConfirmCard.querySelector(
  ".close-bengkel-confirm"
);
export const bengkelInitPage =
  mainBengkelSection.querySelector(".bengkel-init-page");
export const serviceState = mainBengkelSection.querySelector(".service-state");
export const serviceContainer = document.querySelector(".service-open");
export const orderContainer = document.querySelector(".orders");

export const montirContainer = mainBengkelSection.querySelector(".montirs");
const montir = document.querySelector(".montir");
export const noMontir = mainBengkelSection.querySelector(".no-montir");
// let montirCheckbox = [];

// Edit Profile Bengkel Section
export const editBengkelSection = document.querySelector(
  ".bengkel-edit-profil"
);
export const formEditBengkel = editBengkelSection.querySelector("form");
export const outputEdit = formEditBengkel.querySelector("#result-edit");

// Respon Order Sequences
export const mapOrderNotification = document.querySelector(
  "#map-order-notification"
);
export const orderNotification = document.querySelector(".order-notification");
export const cardOrderInfo = orderNotification.querySelector(".order-info");
const orderNotifButtons = orderNotification.querySelector(
  ".order-notif-buttons"
);
const btnAcceptOrder = orderNotification.querySelector(".btn-accept-order");
const btnRejectOrder = orderNotification.querySelector(".btn-reject-order");
export const rejectOrderConfirm = orderNotification.querySelector(
  ".reject-order-confirm"
);

export const cardSelectMontir =
  orderNotification.querySelector(".select-montir");
export const noMontirSelectMontir =
  cardSelectMontir.querySelector(".no-montir");
export const selectMontirList = cardSelectMontir.querySelector(".montirs");
export const formSelectMontir = cardSelectMontir.querySelector("form");

export const waitingCardBengkel =
  orderNotification.querySelector(".waiting-card");
export const confirmCardBengkel =
  orderNotification.querySelector(".confirm-card");
export const btnConfirmCardBengkel =
  confirmCardBengkel.querySelector(".btn-yes");
export const sendCostSection = document.querySelector(".send-cost");
export const sendCostRequestContainer =
  sendCostSection.querySelector(".requests");

// [MAIN MONTIR]
export const mainMontirSection = document.querySelector(".main-montir");
export const mapMontirOrderNotification = document.querySelector(
  "#map-montir-order-info"
);
export const montirOrderInformation = document.querySelector(
  ".montir-order-information"
);
export const montirProfile = mainMontirSection.querySelector(".montir-profile");
export const montirProfileName = montirProfile.querySelector(".montir-name");
export const montirProfileNumber =
  montirProfile.querySelector(".montir-number");
export const cardMontirOrderInfo =
  montirOrderInformation.querySelector(".order-info");

export const btnMontirBerangkat = cardMontirOrderInfo.querySelector(".btn-yes");

export const montirOtwSection = document.querySelector(".montir-otw");
export const mapMontirOtw = document.querySelector("#map-montir-otw");
export const cardMontirOtwInfo = montirOtwSection.querySelector(".otw-info");
export const arriveConfirm = montirOtwSection.querySelector(".arrive-confirm");
export const btnMontirArriveConfirm = montirOtwSection.querySelector(
  ".btn-arrive-confirm"
);
export const cardMontirArrivedMontir =
  montirOtwSection.querySelector(".you-arrived");
export const cardRequestingCost =
  mainMontirSection.querySelector(".requesting-cost");
export const formRequestCost = cardRequestingCost.querySelector("form");

// Logics

// Check Internet Connectivity
export const showModalNoInternet = function (section) {
  const modalHTML = `
		<div class="card no-internet center-open">
		  <p>Koneksi terputus, coba lagi nanti.</p>
		</div>`;
  section.insertAdjacentHTML("afterbegin", modalHTML);
  const overlay = document.createElement("div");
  overlay.classList.add("overlay");
  section.insertBefore(overlay, section.querySelector(".no-internet"));
  setTimeout(() => {
    section.querySelector(".no-internet").remove();
    overlay.remove();
  }, 3000);
};

export const showModalMessage = function (section, message) {
  const modalHTML = `
		<div class="card act-succeed center-open">
		  <p>${message}</p><?xml version="1.0" encoding="UTF-8"?>
		  <!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
		  <svg width="800px" height="800px" viewBox="0 -4 30 30" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
			  
			  <title>check</title>
			  <desc>Created with Sketch.</desc>
			  <defs>
				  <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="linearGradient-1">
					  <stop stop-color="#1DD47F" offset="0%">
		  
		  </stop>
					  <stop stop-color="#0DA949" offset="100%">
		  
		  </stop>
				  </linearGradient>
			  </defs>
			  <g id="icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
				  <g id="ui-gambling-website-lined-icnos-casinoshunter" transform="translate(-735.000000, -1911.000000)" fill="url(#linearGradient-1)" fill-rule="nonzero">
					  <g id="4" transform="translate(50.000000, 1871.000000)">
						  <path d="M714.442949,40.6265241 C715.185684,41.4224314 715.185684,42.6860985 714.442949,43.4820059 L697.746773,61.3734759 C697.314529,61.8366655 696.704235,62.0580167 696.097259,61.9870953 C695.539848,62.0082805 694.995328,61.7852625 694.600813,61.3625035 L685.557051,51.6712906 C684.814316,50.8753832 684.814316,49.6117161 685.557051,48.8158087 C686.336607,47.9804433 687.631056,47.9804433 688.410591,48.8157854 L696.178719,57.1395081 L711.589388,40.6265241 C712.368944,39.7911586 713.663393,39.7911586 714.442949,40.6265241 Z" id="check">
		  
		  </path>
					  </g>
				  </g>
			  </g>
		  </svg>
		</div>`;
  section.insertAdjacentHTML("afterbegin", modalHTML);
  const overlay = document.createElement("div");
  overlay.classList.add("overlay");
  section.insertBefore(overlay, section.querySelector(".act-succeed"));
  setTimeout(() => {
    section.querySelector(".act-succeed").remove();
    overlay.remove();
  }, 3000);
};

// export const showModalFailed = function (section, message) {
//   const modalHTML = `
// 		  <div class="card act-succeed center-open">
// 			<p>${message}</p><?xml version="1.0" encoding="UTF-8"?>
// 			<!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
// 			<svg width="800px" height="800px" viewBox="0 -4 30 30" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">

// 				<title>check</title>
// 				<desc>Created with Sketch.</desc>
// 				<defs>
// 					<linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="linearGradient-1">
// 						<stop stop-color="#1DD47F" offset="0%">

// 			</stop>
// 						<stop stop-color="#0DA949" offset="100%">

// 			</stop>
// 					</linearGradient>
// 				</defs>
// 				<g id="icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
// 					<g id="ui-gambling-website-lined-icnos-casinoshunter" transform="translate(-735.000000, -1911.000000)" fill="url(#linearGradient-1)" fill-rule="nonzero">
// 						<g id="4" transform="translate(50.000000, 1871.000000)">
// 							<path d="M714.442949,40.6265241 C715.185684,41.4224314 715.185684,42.6860985 714.442949,43.4820059 L697.746773,61.3734759 C697.314529,61.8366655 696.704235,62.0580167 696.097259,61.9870953 C695.539848,62.0082805 694.995328,61.7852625 694.600813,61.3625035 L685.557051,51.6712906 C684.814316,50.8753832 684.814316,49.6117161 685.557051,48.8158087 C686.336607,47.9804433 687.631056,47.9804433 688.410591,48.8157854 L696.178719,57.1395081 L711.589388,40.6265241 C712.368944,39.7911586 713.663393,39.7911586 714.442949,40.6265241 Z" id="check">

// 			</path>
// 						</g>
// 					</g>
// 				</g>
// 			</svg>
// 		  </div>`;
//   section.insertAdjacentHTML("afterbegin", modalHTML);
//   const overlay = document.createElement("div");
//   overlay.classList.add("overlay");
//   section.insertBefore(overlay, section.querySelector(".act-succeed"));
//   setTimeout(() => {
//     section.querySelector(".act-succeed").remove();
//     overlay.remove();
//   }, 3000);
// };

// Slider
export const sliderFunction = function (slides) {
  console.log("slides", slides);
  let isDragging = false,
    startPos = 0,
    currentTranslate = 0,
    prevTranslate = 0,
    animationID = 0,
    currentIndex = 0;
  slides.forEach((slide, index) => {
    const slideImage = slide.querySelector("img");
    slideImage.addEventListener("dragstart", (e) => e.preventDefault());

    //   Touch Events
    slide.addEventListener("touchstart", touchStart(index));
    slide.addEventListener("touchend", touchEnd(index));
    slide.addEventListener("touchmove", touchMove(index));

    //   Mouse Events
    slide.addEventListener("mousedown", touchStart(index));
    slide.addEventListener("mouseup", touchEnd(index));
    slide.addEventListener("mouseleave", touchEnd(index));
    slide.addEventListener("mousemove", touchMove(index));
  });

  //   Disable Context Menu
  window.oncontextmenu = function (event) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  };

  function touchStart(index) {
    return function (event) {
      console.log("Start");
      currentIndex = index;
      startPos = getPositionX(event);
      isDragging = true;

      animationID = requestAnimationFrame(animation);
    };
  }
  function touchEnd(index) {
    return function (event) {
      console.log("End");
      isDragging = false;
      cancelAnimationFrame(animationID);

      const movedBy = currentTranslate - prevTranslate;
      if (movedBy < -100 && currentIndex < slides.length - 1) currentIndex += 1;

      if (movedBy > 100 && currentIndex > 0) currentIndex -= 1;

      setPositionByIndex();
    };
  }
  function touchMove(index) {
    return function (event) {
      if (isDragging) {
        console.log("Move");
        const currentPosition = getPositionX(event);
        currentTranslate = prevTranslate + currentPosition - startPos;
      }
    };
  }
  function getPositionX(event) {
    return event.type.includes("mouse")
      ? event.pageX
      : event.touches[0].clientX;
  }

  function animation() {
    setSliderPosition();
    if (isDragging) requestAnimationFrame(animation);
  }

  function setSliderPosition() {
    bengkelImages.style.transform = `translateX(${currentTranslate}px)`;
  }

  function setPositionByIndex() {
    currentTranslate = currentIndex * -window.innerWidth;
    prevTranslate = currentTranslate;
    setSliderPosition();
  }
};

// Counting Stars Icon
export const countingStarsIcon = function (orderData, className) {
  let starsCounting = 1;
  let starsHTML = `
		<p class="rate">
			<svg class="${className}" viewBox="0 0 32 32">
			<use href="#star" fill="url(#full)"></use>
			</svg>
		</p>`;
  for (let i = 2; i <= orderData.rate; i++) {
    console.log("orderData.rate : ", orderData.rate);
    starsHTML += `
		<p class="rate">
			<svg class="${className}" viewBox="0 0 32 32">
			<use href="#star" fill="url(#full)"></use>
			</svg>
		</p>`;
    // console.log("starsHTML : ", starsHTML);
    starsCounting++;
  }
  const additionalStars = 5 - starsCounting;
  if (additionalStars > 0) {
    for (let i = 1; i <= additionalStars; i++) {
      starsHTML += `
				<p class="rate">
					<svg class="${className}" viewBox="0 0 32 32">
					<use href="#star" fill="url(#null)"></use>
					</svg>
				</p>`;
    }
  }
  starsHTML += ``;
  return starsHTML;
};

// Counting montir's arriving
export let countingInterval;
export const countingMontirOtw = function (minutes, div, actor) {
  console.log("countingMontirOtw Minutes : ", minutes);
  console.log("countingMontirOtw div : ", div.querySelector(".countdown-text"));
  // minutes = 5
  let message;
  if (actor === "pengendara") {
    message = "Montir sudah dekat dengan lokasi Anda";
  }
  if (actor === "montir") {
    message = "Anda sudah dekat dengan lokasi pelanggan";
  }

  div.querySelector(
    ".countdown-text"
  ).textContent = `Anda akan sampai ${minutes} menit lagi`;
  countingInterval = setInterval(() => {
    minutes -= 1;
    if (minutes > 0) {
      div.querySelector(
        ".countdown-text"
      ).textContent = `Anda akan sampai ${minutes} menit lagi`;
    }
    if (minutes === 0) {
      console.log("actor : ", actor);
      div.querySelector(".countdown-text").textContent = message;
      if (actor === "montir") arriveConfirm.style.display = "block";
    }
  }, 60000);
};

btnMontirArriveConfirm.addEventListener("click", async () => {
  // Montir is arrived!
  const status = await checkOnlineStatus();
  if (status === true) {
    createLoadingBtn(arriveConfirm);
    montirIsArrived();
  }
  if (status === false) {
    showModalNoInternet(montirOtwSection);
    return;
  }
});

// General Logic
export const moveSection = function (from, to) {
  if (from) from.classList.remove("active");
  to.classList.add("active");
  appState = to;
};

export const removeLoadingBtn = function (form) {
  console.log("removeLoadingBtn, before: ", form);
  form.querySelector(".btn-load").style.display = "none";
  form.querySelector(".btn-submit-form").style.display = "block";
  console.log("removeLoadingBtn, after: ", form);
};
export const createLoadingBtn = function (form) {
  console.log("createLoadingBtn, before: ", form);
  form.querySelector(".btn-submit-form").style.display = "none";
  form.querySelector(".btn-load").style.display = "block";
  console.log("createLoadingBtn, after: ", form);
  const timeOutId = setTimeout(() => {
    removeLoadingBtn(form);
    form.querySelector(".input-error-text").style.display = "none";
  }, 11000);
};
export const showInputError = function (form, errorText) {
  console.log("showInputError, form : ", form);
  if (errorText)
    form.querySelector(".input-error-text").textContent = `${errorText}`;
  form.querySelector(".input-error-text").style.display = "block";
};
export const removeInputError = function (form) {
  //   let errorTextStyle = form.querySelector(".input-error-text").style.display;
  //   console.log("errorTextStyle : ", errorTextStyle);
  //   if (errorTextStyle === "block") errorText = "none";
  console.log("removeInputError, form : ", form);
  form.querySelector(".input-error-text").style.display = "none";
};

// export const removeLoadingBtn = function (form) {
//   console.log(
//     "removeLoadingBtn, btnLoading: ",
//     form.querySelector(".btn-load")
//   );
//   console.log(
//     "removeLoadingBtn, btnLanjut: ",
//     form.querySelector(".btn-lanjut")
//   );
//   form.querySelector(".btn-load").remove();
//   form.querySelector(".btn-lanjut").style.display = "block";
//   console.log("removeLoadingBtn, form: ", form);
// };

// Buttons Event Handlers

formSignIn.addEventListener("submit", (e) => {
  e.preventDefault();
  createLoadingBtn(formSignIn);
  console.log("SIGNIN . . .");
  signingInUser();
});

btnLogout.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    if (mainPengendaraSection.classList.contains("active")) {
      removeMap();
      signOut(auth).then(() => {
        console.log("pengendara successfully signout");
        moveSection(appState, openingSection);
        window.location.reload();
      });
    }
    if (mainBengkelSection.classList.contains("active")) {
      signingOutBengkel();
    }
    if (mainMontirSection.classList.contains("active")) {
      if (map) removeMap();
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
          unsubWatchOrderCost();
          window.location.reload();
        });
      });
    }
  });
});

formSignUpPengendara.addEventListener("submit", (e) => {
  e.preventDefault();
  createLoadingBtn(formSignUpPengendara);
  signingUpUser("Pengendara");
});

formSignUpBengkel.addEventListener("submit", (e) => {
  e.preventDefault();
  console.log("SIGNUP BENGKEL");
  createLoadingBtn(formSignUpBengkel);
  signingUpUser("Bengkel");
});

btnSelectSignIn.addEventListener("click", (e) => {
  console.log("sign in!");
  moveSection(openingSection, signInSection);
});

btnSelectSignUp.addEventListener("click", (e) => {
  console.log("sign up!");
  moveSection(openingSection, signUpAsSection);
});

btnAsPengendara.addEventListener("click", (e) => {
  console.log("sign up as pengendara!");
  moveSection(signUpAsSection, signUpPengendaraSection);
});

btnAsBengkel.addEventListener("click", () => {
  console.log("sign up as bengkel!");
  moveSection(signUpAsSection, signUpBengkelSection);
});

btnOpenBengkel.addEventListener("click", () => {
  bengkelStatus = "open";

  updateBengkelStatus("open");
  updateAllMontirStatus(true);
  watchRequestOrders();
});

btnCloseBengkel.addEventListener("click", (e) => {
  e.preventDefault();
  closeBengkelConfirmCard.classList.add("center-open");
  const overlay = document.createElement("div");
  overlay.classList.add("overlay");
  mainBengkelSection.insertBefore(overlay, closeBengkelConfirmCard);
  overlay.addEventListener("click", () => {
    overlay.remove();
    closeBengkelConfirmCard.classList.remove("center-open");
  });
});

closeBengkelConfirmButtons.addEventListener("click", (e) => {
  e.preventDefault();
  if (e.target === closeBengkelConfirmButtons.children[0]) {
    console.log("closebengkelconfirm yes");
    unsubWatchBengkel();
    document.querySelector(".overlay").remove();
    closeBengkelConfirmCard.classList.remove("center-open");
    bengkelStatus = "closed";
    updateBengkelStatus("close");
    updateAllMontirStatus(false);
  }
  if (e.target === closeBengkelConfirmButtons.children[1]) {
    console.log("closebengkelconfirm no");
    document.querySelector(".overlay").remove();
    closeBengkelConfirmCard.classList.remove("center-open");
  }
});

btnEditProfil.addEventListener("click", (e) => {
  openEditBengkel(e);
});
// Click Unggah Foto Event Listener
formEditBengkel.querySelector(".input-pic").addEventListener("click", (e) => {
  e.preventDefault();
  document.querySelector("#files-edit").click();
});
formEditBengkel.addEventListener("submit", async function (e) {
  e.preventDefault();
  const status = await checkOnlineStatus();
  if (status === true) {
    createLoadingBtn(formAddMontir);
    submitEditBengkel();
  }
  if (status === false) {
    showModalNoInternet(editBengkelSection);
    return;
  }
});

btnEditLocation.addEventListener("click", async function (e) {
  const status = await checkOnlineStatus();
  if (status === true) {
    editLocationBengkel();
  }
  if (status === false) {
    showModalNoInternet(mainBengkelSection);
    return;
  }
});

btnSuccessOrder.addEventListener("click", () => {
  showSuccessOrders();
  moveSection(mainBengkelSection, successOrderSection);
});

const btnCloseSuccessOrderCard = openSuccessOrder.querySelector(".close-icon");

btnCloseSuccessOrderCard.addEventListener("click", () => {
  const overlay = document.querySelector(".overlay");
  overlay.remove();
  openSuccessOrder.classList.remove("center-top-open");
});

btnOnProgressOrder.addEventListener("click", () => {
  showProgressOrder();
  moveSection(mainBengkelSection, progressOrderSection);
});

btnSettingMontir.addEventListener("click", () => {
  moveSection(mainBengkelSection, settingMontirSection);
  showMontirList(settingMontirSection);
});

btnAddMontir.addEventListener("click", (e) => {
  e.preventDefault();
  moveSection(settingMontirSection, addMontirSection);
});

formAddMontir.addEventListener("submit", async function (e) {
  e.preventDefault();
  const status = await checkOnlineStatus();
  if (status === true) {
    createLoadingBtn(formAddMontir);
    submitAddMontir(e);
  }
  if (status === false) {
    showModalNoInternet(addMontirSection);
    return;
  }
});

offlineFallbackBtn.addEventListener("click", (e) => {
  window.location.reload();
});

infoButtons.addEventListener("click", (e) => {
  e.preventDefault();
  if (e.target === btnViewMore) {
    bengkelInfoCard.classList.remove("brief");
    bengkelInfoCard.classList.add("full-open");
  }
  if (e.target === btnRoute) {
    console.log("click btnRoute");
    checkOnlineStatus().then((status) => {
      if (status === true) {
        showRoute();
      }
      if (status === false) {
        // alert("Koneksi internet terputus. Coba lagi beberapa saat.");
        showModalNoInternet(mainPengendaraSection);
      }
    });
  }
  if (e.target === btnCall) {
    console.log("click btnCall");
    checkOnlineStatus().then((status) => {
      if (status === true) {
        orderDescContainer.classList.add("center-open");
        const overlay = document.createElement("div");
        overlay.classList.add("overlay");
        mainPengendaraSection.insertBefore(overlay, orderDescContainer);
        overlay.addEventListener("click", (e) => {
          overlay.remove();
          orderDescContainer.classList.remove("center-open");
        });
      }
      if (status === false) {
        showModalNoInternet(mainPengendaraSection);
        return;
      }
    });
  }
});

formOrderDesc.addEventListener("submit", (e) => {
  e.preventDefault();
  inputOrderDesc();
});

orderConfirmationButtons.addEventListener("click", (e) => {
  if (e.target === btnOrderConfirmYes) {
    checkOnlineStatus().then((status) => {
      if (status === true) {
        console.log("yes 1");
        createLoadingBtn(orderConfirmationButtons);
        callMontir()
          .then((resp) => {
            console.log("callmontir resp", resp);
            orderConfirmationContainer.classList.remove("center-open");
            mainPengendaraSection.querySelector(".overlay").remove();
            waitingCardPengendara.querySelector(
              "p"
            ).textContent = `Memanggil montir dari ${choosenBengkel.bengkelName}`;
            waitingCardPengendara.classList.add("center-open");
            const overlay = document.createElement("div");
            overlay.classList.add("overlay");
            mainPengendaraSection.insertBefore(overlay, waitingCardPengendara);

            watchOrderPengendara();
          })
          .catch((err) => console.log("callMontir error : ", err.message));
      }
      if (status === false) {
        showModalNoInternet(mainPengendaraSection);
        return;
      }
    });
  }
  if (e.target === btnOrderConfirmNo) {
    console.log("no");
    mainPengendaraSection.querySelector(".overlay").remove();
    orderConfirmationContainer.classList.remove("center-open");
  }
});

orderRejectedCard.querySelector(".btn-yes").addEventListener("click", (e) => {
  orderRejectedCard.classList.remove("center-open");
  document.querySelector(".overlay").remove();
});

orderNotifButtons.addEventListener("click", (e) => {
  if (e.target === btnAcceptOrder) {
    showMontirList(orderNotification);
  }
  if (e.target === btnRejectOrder) {
    rejectOrderConfirm.classList.add("center-open");
    const overlay = document.createElement("div");
    overlay.classList.add("overlay");
    orderNotification.insertBefore(overlay, rejectOrderConfirm);
  }
});
rejectOrderConfirm.addEventListener("click", (e) => {
  if (e.target === rejectOrderConfirm.querySelector(".btn-yes")) {
    rejectOrder();
  }
  if (e.target === rejectOrderConfirm.querySelector(".btn-no")) {
    rejectOrderConfirm.classList.remove("center-open");
    orderNotification.querySelector(".overlay").remove();
  }
});
formSelectMontir.addEventListener("submit", async function (e) {
  e.preventDefault();
  const status = await checkOnlineStatus();
  if (status === true) {
    createLoadingBtn(formSelectMontir);
    commandMontir();
  }
  if (status === false) {
    cardSelectMontir.classList.remove("center-open");
    orderNotification.querySelector(".overlay").remove();
    showModalNoInternet(orderNotification);
    return;
  }
});

headerUser.addEventListener("click", (e) => {
  navPengendaraContainer.classList.add("full-float-open");
  const overlay = document.createElement("div");
  overlay.classList.add("overlay");
  mainPengendaraSection.insertBefore(overlay, navPengendaraContainer);
  overlay.addEventListener("click", (e) => {
    overlay.remove();
    navPengendaraContainer.classList.remove("full-float-open");
  });
  showProfilPengendara();
});

btnEditPengendara.addEventListener("click", openEditPengendara);

export let setTimerTextEditPengendara;
formEditPengendara.addEventListener("submit", async (e) => {
  e.preventDefault();
  createLoadingBtn(formEditPengendara);
  // Cek koneksi
  const status = await checkOnlineStatus();
  if (status === true) {
    const userDoc = await getDoc(
      doc(db, `userPengendara`, `${currentUser.uid}`)
    );
    console.log(userDoc.data());
    const userData = userDoc.data();

    const userObj = {
      name: formEditPengendara["pengendara-name"].value,
      email: formEditPengendara["email"].value,
    };
    console.log("userObj : ", userObj);

    //   Validate phoneNumber
    if (isObjFull(userObj) === false) {
      showInputError(formEditPengendara);
      removeLoadingBtn(formEditPengendara);
      return;
    }
    if (formEditPengendara["phone-number"].value == "") {
      showInputError(formEditPengendara);
      removeLoadingBtn(formEditPengendara);
      return;
    }
    if (
      userData.phoneNumber !== `+62${formEditPengendara["phone-number"].value}`
    ) {
      const isUserRegistered = await validateUser(
        `+62${formEditPengendara["phone-number"].value}`
      );

      if (isUserRegistered) {
        showInputError(
          formEditPengendara,
          "Nomor sudah terdaftar, silakan ubah nomor"
        );
        removeLoadingBtn(formEditPengendara);
        return;
      }
    }

    // Saving new data to Firestore
    // checkOnlineStatus().then((res) => {
    // 	console.log('checkOnlineStatus ok', res)
    // });

    await setDoc(doc(db, `userPengendara`, `${currentUser.uid}`), userObj, {
      merge: true,
    });
    console.log("update firestore success!");

    // Update DisplayName in Credential
    if (userObj.name !== userData.name) {
      let oldDisplayName = currentUser.displayName;

      await updateProfile(auth.currentUser, {
        displayName: userObj.name,
      });

      console.log("update displayname success", currentUser);

      // Update pengendaraName pada orders collection
      const bengkelSnapshot = await getDocs(collection(db, `userBengkel`));
      bengkelSnapshot.forEach(async (bengkelDoc) => {
        const orderSnapshot = await getDocs(
          query(
            collection(db, `userBengkel/${bengkelDoc.id}/orders`),
            where("pengendaraName", "==", oldDisplayName)
          )
        );
        orderSnapshot.forEach(async (orderDoc) => {
          await setDoc(
            doc(db, `userBengkel/${bengkelDoc.id}/orders/${orderDoc.id}`),
            { pengendaraName: currentUser.displayName },
            {
              merge: true,
            }
          );
          console.log("update reviewer success!");
        });
      });
    }
    // Update Phone Number in Credential
    if (
      userData.phoneNumber !== `+62${formEditPengendara["phone-number"].value}`
    ) {
      recaptchaVerifierMaker("btn-update-pengendara");
      // 82210176648
      const appVerifier = window.recaptchaVerifier;
      const phoneNumber = `+62${formEditPengendara["phone-number"].value}`;
      const provider = new PhoneAuthProvider(auth);

      console.log("pengendara update phoneNumber");
      const verificationId = await provider.verifyPhoneNumber(
        phoneNumber,
        appVerifier
      );
      moveSection(editPengendaraSection, otpVerifySection);
      otpPhoneNumberText.textContent = phoneNumber;

      let seconds_left = 60;
      console.log("first second_left : ", seconds_left);
      setTimerTextEditPengendara = setInterval(function () {
        seconds_left = --seconds_left;
        otpTimerText.textContent = `${seconds_left}`;
        console.log("interval ke : ", seconds_left);

        if (seconds_left <= 0) {
          clearInterval(setTimerTextEditPengendara);
          console.log("setTimerText stopped");
          if (appState == otpVerifySection) {
            // navPengendaraContainer.classList.remove("full-float-open");
            moveSection(otpVerifySection, editPengendaraSection);
            showModalMessage(editPengendaraSection, "Ubah Nomor HP gagal");
            window.location.reload();
          }
        }
      }, 1000);

      otpVerifySection.removeEventListener("submit", (e) => {
        e.preventDefault();
        submitOtpEditProfile(verificationId);
      });
      otpVerifySection.addEventListener("submit", (e) => {
        e.preventDefault();
        submitOtpEditProfile(verificationId);
      });
      return;
    }

    moveSection(appState, mainPengendaraSection);
    navPengendaraContainer.classList.remove("full-float-open");
    document.querySelector(".overlay").remove();
    showModalMessage(mainPengendaraSection, "Ubah profil berhasil");
  }
  if (status === false) {
    showModalNoInternet(editPengendaraSection);
    removeLoadingBtn(formEditPengendara);
    return;
  }
});

formGiveRating.addEventListener("submit", (e) => {
  e.preventDefault();
  checkOnlineStatus().then((status) => {
    if (status === true) {
      createLoadingBtn(formGiveRating);
      submitRating();
    }
    if (status === false) {
      showModalNoInternet(mainPengendaraSection);
      return;
    }
  });
});

btnCloseNavPengendara.addEventListener("click", (e) => {
  document.querySelector(".overlay").remove();
  navPengendaraContainer.classList.remove("full-float-open");
});

btnMontirBerangkat.addEventListener("click", (e) => {
  checkOnlineStatus().then((status) => {
    if (status === true) {
      //   cardMontirOrderInfo.querySelector(".btn-yes-load").style.display =
      //     "block";
      // 	btnMontirBerangkat.style.display = 'none'
      console.log("CEK DISINI 1");
      createLoadingBtn(cardMontirOrderInfo);
      console.log("CEK DISINI 2");
      montirGo();
    }
    if (status === false) {
      showModalNoInternet(montirOrderInformation);
      return;
    }
  });
});

cardMontirArrivedMontir
  .querySelector(".btn-yes")
  .addEventListener("click", () => {
    removeMap();
    moveSection(montirOtwSection, mainMontirSection);
    cardMontirOtwInfo.classList.remove("brief-bottom");
    montirOtwSection.querySelector(".overlay").remove();
    cardMontirArrivedMontir.classList.remove("center-open");

    // open requesting cost card
    cardRequestingCost.classList.add("center-open");
    const overlay = document.createElement("div");
    overlay.classList.add("overlay");
    mainMontirSection.insertBefore(overlay, cardRequestingCost);
  });

formRequestCost.addEventListener("submit", (e) => {
  e.preventDefault();
  checkOnlineStatus().then((status) => {
    if (status === true) {
      createLoadingBtn(formRequestCost);
      montirRequestCost();
    }
    if (status === false) {
      showModalNoInternet(mainMontirSection);
      return;
    }
  });
});

btnConfirmCardBengkel.addEventListener("click", (e) => {
  orderNotification.querySelector(".overlay").remove();
  confirmCardBengkel.classList.remove("center-open");
  moveSection(orderNotification, mainBengkelSection);
});

btnInfoBack.addEventListener("click", (e) => {
  e.preventDefault();
  if (bengkelInfoCard.classList.contains("full-open")) {
    bengkelInfoCard.classList.remove("full-open");
    bengkelInfoCard.classList.add("brief");
  }
  if (bengkelInfoCard.classList.contains("brief")) {
    closeBengkelInfoCard();
  }
  if (unsubWatchBengkelStatus) {
    unsubWatchBengkelStatus();
  }
  if (unsubWatchMontirStatus) {
    unsubWatchMontirStatus();
  }
});

btnRouteBack.addEventListener("click", (e) => {
  e.preventDefault();
  showRouteCard.classList.remove("brief-bottom");
  closeRoute();
});

btnSectionBack.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    if (appState === signInSection) {
      moveSection(signInSection, openingSection);
      removeInputError(formSignIn);
    }
    if (appState === signUpAsSection) {
      moveSection(signUpAsSection, openingSection);
    }
    if (appState === signUpPengendaraSection) {
      moveSection(signUpPengendaraSection, signUpAsSection);
      removeInputError(formSignUpPengendara);
    }
    if (appState === signUpBengkelSection) {
      moveSection(signUpBengkelSection, signUpAsSection);
      removeInputError(formSignUpBengkel);
    }
    // if (appState === otpVerifySection) {
    //   moveSection(otpVerifySection, openingSection);
    //   removeInputError(formOtpVerify);
    // }
    if (appState === editBengkelSection) {
      moveSection(editBengkelSection, mainBengkelSection);
      removeInputError(formEditBengkel);
    }
    if (appState === successOrderSection) {
      moveSection(successOrderSection, mainBengkelSection);
    }
    if (appState === progressOrderSection) {
      moveSection(progressOrderSection, mainBengkelSection);
    }
    if (appState === settingMontirSection) {
      moveSection(settingMontirSection, mainBengkelSection);
    }
    if (appState === addMontirSection) {
      moveSection(addMontirSection, settingMontirSection);
      removeInputError(formAddMontir);
    }
    if (appState === editPengendaraSection) {
      moveSection(editPengendaraSection, mainPengendaraSection);
      removeInputError(formEditPengendara);
    }
    if (appState === orderNotification) {
      moveSection(orderNotification, mainBengkelSection);
    }
  });
});

console.log("from index js");

// ===========================
