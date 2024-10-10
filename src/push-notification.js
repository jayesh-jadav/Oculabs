import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import authActions from "./Redux/reducers/auth/actions";
import { store } from "./Redux/store/configureStore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: "oculo-web.firebaseapp.com",
  projectId: "oculo-web",
  storageBucket: "oculo-web.appspot.com",
  messagingSenderId: "892302063818",
  appId: "1:892302063818:web:73e89671fcea4be3e95c33",
  measurementId: "G-JLT8HNS31T",
};
let firebaseApp;
let messaging;
const fun = async () => {
  try {
    firebaseApp = await initializeApp(firebaseConfig);
    messaging = await getMessaging(firebaseApp);
  } catch (err) {
    console.log("An error occurred while retrieving token. ", err);
  }
};
fun();
export const askForPermissionToReceiveNotifications = async () => {
  try {
    const currentToken = await getToken(messaging, {
      vapidKey:
        "BPMsWp38JEt7xvBg55ZJLhML5d_6wpKBmD9AnZo4-Q5sh3vfjIa2QdwkQWFYOZeq2LmDrgy9NiYvWgWM5tHrTtI",
    });

    if (currentToken) {
      console.log("current token for client: ", currentToken);
      store.dispatch(authActions.setUserUUID(currentToken));
    } else {
      console.log(
        "No registration token available. Request permission to generate one."
      );
    }
  } catch (err) {
    console.log("An error occurred while retrieving token. ", err);
  }
};

export function onMessageListener() {
  return new Promise((resolve, reject) => {
    onMessage(messaging, (payload) => {
      const notiData = payload?.notification;
      // store.dispatch(authActions.setNotiData(notiData));
      // store.dispatch(authActions.displayNotificationPopUp(true));
      // setTimeout(() => {
      //   store.dispatch(authActions.displayNotificationPopUp(false));
      // }, 5000);
    });
  });
}
