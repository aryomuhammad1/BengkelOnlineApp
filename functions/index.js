const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
// admin.initializeApp({
//   credential: admin.credential.applicationDefault(),
// });

// const serviceAccount = require("../public/aplikasi-bengkel-online-firebase-adminsdk-lk8a1-74808928af.json");
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

exports.addRole = functions.https.onCall(async (data, context) => {
  // get user and add custom claim
  return admin
    .auth()
    .getUser(data.uid)
    .then((userRecord) => {
      return admin.auth().setCustomUserClaims(userRecord.uid, {
        role: data.userRole,
      });
    })
    .then(() => {
      return {
        message: `Success! ${data.uid} has given a role : ${data.userRole}`,
      };
    })
    .catch((err) => {
      return err;
    });
});

exports.deleteAuthUser = functions.https.onCall(async (data, context) => {
  //   return { message: "tetot" };
  return admin
    .auth()
    .getUserByPhoneNumber(data.phoneNumber)
    .then((userRecord) => {
      return admin.auth().deleteUser(userRecord.uid);
    })
    .then(() => {
      return {
        message: `Success! ${data.phoneNumber} has been deleted`,
      };
    })
    .catch((err) => {
      return err;
    });
});

// Send Order Function, mengirim orderan ke bengkel
exports.sendOrder = functions.https.onCall(async (data) => {
  const message = {
    data: {
      topic: "sendOrder",
      travelTime: data.travelTime,
    },
    token: data.token,
  };

  return admin
    .messaging()
    .send(message)
    .then((response) => {
      console.log("Succesfully sent a notification");
      return { response: response, message: "yes" };
    })
    .catch((err) => {
      return { token: registrationToken };
    });
});

// Request Cost Function, mengirim request biaya ke bengkel
exports.requestCost = functions.https.onCall(async (data) => {
  const message = {
    data: {
      topic: "requestCost",
      montirName: data.montirName,
    },
    token: data.token,
  };

  return admin
    .messaging()
    .send(message)
    .then((response) => {
      console.log("Succesfully sent a notification");
      return { response: response, message: "yes" };
    })
    .catch((err) => {
      return { token: registrationToken };
    });
});
