/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./public/firebase-messaging-sw.js":
/*!*****************************************!*\
  !*** ./public/firebase-messaging-sw.js ***!
  \*****************************************/
/***/ (() => {

eval("// // // FIREBASE INIT\r\n// // // console.log('INI DARI DB.JS')\r\n// import { initializeApp } from \"/firebase/app\";\r\n// import { getMessaging } from \"firebase/messaging\";\r\n\r\n// import { initializeApp } from \"https://www.gstatic.com/firebasejs/9.9.4/firebase-app.js\";\r\n// import { getMessaging } from \"https://www.gstatic.com/firebasejs/9.9.4/firebase-messaging.js\";\r\n// import { messaging } from \"./src/js/firebase-config\";\r\nimportScripts(\"https://www.gstatic.com/firebasejs/9.9.4/firebase-app.js\");\r\nimportScripts(\"https://www.gstatic.com/firebasejs/9.9.4/firebase-messaging.js\");\r\n// importScripts(\"https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js\");\r\n// importScripts(\r\n//   \"https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js\"\r\n// );\r\n\r\nconst version = \"v8\";\r\n\r\nself.addEventListener(\"install\", () => {\r\n  console.log(\"ServiceWorker installed!\");\r\n});\r\n\r\nself.addEventListener(\"activate\", () => {\r\n  console.log(\"ServiceWorker Activated !\");\r\n\r\n  //   const firebaseApp = initializeApp({\r\n  //     apiKey: \"AIzaSyA51anpLkYPlxlhJj7HR-vG1JVOkAJZSHA\",\r\n  //     authDomain: \"aplikasi-bengkel-online.firebaseapp.com\",\r\n  //     projectId: \"aplikasi-bengkel-online\",\r\n  //     storageBucket: \"aplikasi-bengkel-online.appspot.com\",\r\n  //     messagingSenderId: \"721522428619\",\r\n  //     appId: \"1:721522428619:web:5360c606488d277182694e\",\r\n  //     measurementId: \"G-01H5MHX8H2\",\r\n  //   });\r\n  //   console.log(\"firebaseApp sw : \", firebaseApp);\r\n\r\n  //   const messaging = getMessaging(firebaseApp);\r\n  console.log(\"messaging : \", messaging);\r\n});\r\n\r\n// const firebaseApp = initializeApp({\r\n//   apiKey: \"AIzaSyA51anpLkYPlxlhJj7HR-vG1JVOkAJZSHA\",\r\n//   authDomain: \"aplikasi-bengkel-online.firebaseapp.com\",\r\n//   projectId: \"aplikasi-bengkel-online\",\r\n//   storageBucket: \"aplikasi-bengkel-online.appspot.com\",\r\n//   messagingSenderId: \"721522428619\",\r\n//   appId: \"1:721522428619:web:5360c606488d277182694e\",\r\n//   measurementId: \"G-01H5MHX8H2\",\r\n// });\r\n// const messaging = getMessaging(firebaseApp);\r\n// console.log(\"messaging : \", messaging);\r\n// console.log(\"firebaesApp : \", firebaseApp);\r\n// messaging.onBackgroundMessage((payload) => {\r\n//   console.log(\r\n//     \"[firebase-messaging-sw.js] Received bakcground message\",\r\n//     payload\r\n//   );\r\n//   const notificationTitle = \"Background Message Title\";\r\n//   const notificationOptions = {\r\n//     body: \"Background Message Body\",\r\n//   };\r\n\r\n//   navigator.serviceWorker.ready\r\n//     .then((registration) => {\r\n//       registration.showNotification(notificationTitle, notificationOptions);\r\n//     })\r\n//     .catch((err) => console.log(\"showNotif Error : \", err.message));\r\n// });\r\n\r\n// // import { messaging } from \"./src/js/firebase-config\";\r\n// import { initializeApp } from \"firebase/app\";\r\n// import { getMessaging } from \"firebase/messaging\";\r\n\r\n// const firebaseApp = initializeApp({\r\n//   messagingSenderId: \"721522428619\",\r\n// });\r\n\r\n// const messaging = getMessaging(firebaseApp);\r\n// messaging.onBackgroundMessage((payload) => {\r\n//   console.log(\r\n//     \"[firebase-messaging-sw.js] Received bakcground message\",\r\n//     payload\r\n//   );\r\n//   const notificationTitle = \"Background Message Title\";\r\n//   const notificationOptions = {\r\n//     body: \"Background Message Body\",\r\n//   };\r\n\r\n//   navigator.serviceWorker.ready\r\n//     .then((registration) => {\r\n//       registration.showNotification(notificationTitle, notificationOptions);\r\n//     })\r\n//     .catch((err) => console.log(\"showNotif Error : \", err.message));\r\n// });\r\n\n\n//# sourceURL=webpack://bengkel-online-v6/./public/firebase-messaging-sw.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./public/firebase-messaging-sw.js"]();
/******/ 	
/******/ })()
;