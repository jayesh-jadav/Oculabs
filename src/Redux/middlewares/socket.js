import { io } from "socket.io-client";
import { store } from "../store/configureStore";
import authActions from "../../Redux/reducers/auth/actions";
import { Setting } from "../../Utils/Setting";
import { isEmpty } from "lodash";

// Initialize the socket connection outside the middleware function
const socket = io(Setting.socket_url, {
  cors: {
    origin: "*",
  },
  autoConnect: false,
});

function connectAndJoinRoom(getState) {
  const {
    auth: {
      userData: { personal_info: { tenant_id, id, role_slug } = {} } = {},
    } = {},
  } = getState();
  const isLogin = getState().auth.isLogin;
  const fcm_token = getState().auth.useruuid;
  const platform = "web";
  if (!socket.connected && role_slug !== "super_admin" && isLogin) {
    socket.connect();
    // Listen for the 'connect' event to get the socket ID
    socket.on("connect", () => {
      if (socket.id) {
        store.dispatch(authActions.setSocketID(socket.id));
      }

      socket.emit(
        "joinRoom",
        { tenant_id, id, role_slug, fcm_token, platform },
        (callBack) => {
          console.log("callBack =======>>>", callBack);
        }
      );
    });
  }
}

export const socketMiddleware = () => (params) => (next) => (action) => {
  const { getState } = params;
  const { type } = action;
  let onlinePatientArr = getState().auth.onlinePatients;
  let isNotify = getState().auth.isNotifiy;
  const {
    auth: { userData: { personal_info: { tenant_id } = {} } = {} } = {},
  } = getState();
  const fcm_token = getState().auth.useruuid;
  const platform = "web";
  switch (type) {
    case "socket/notification":
      socket.on("notification", (data) => {
        if (data?.type) {
          store.dispatch(authActions.setRealTimeApiCall({ request: true }));
        } else {
          if (getState().auth.isLogin) {
            store.dispatch(
              authActions.setBackNotiCount(getState().auth.backNotiCount + 1)
            );
          } else {
            store.dispatch(authActions.setBackNotiCount(0));
          }
          store.dispatch(authActions.setNotiData(data));
          if (isNotify === false) {
            store.dispatch(authActions.displayNotificationPopUp(true));
          }
          setTimeout(() => {
            store.dispatch(authActions.displayNotificationPopUp(false));
          }, 5000);
        }
      });
      break;
    case "socket/userStatus":
      socket.on("userStatus", (data) => {
        // Check if onlinePatientArr is not empty
        if (!isEmpty(onlinePatientArr)) {
          const index = onlinePatientArr.findIndex(
            (item) => +item?.user_id === +data?.user_id
          );

          if (index !== -1) {
            // If the user is already in the array, update the status
            onlinePatientArr[index] = data;
          } else {
            // If the user is not in the array, add them
            onlinePatientArr.push(data);
          }
        } else {
          // If onlinePatientArr is empty, add the user
          onlinePatientArr.push(data);
        }

        // Dispatch actions to update Redux state
        store.dispatch(authActions.setOnlinePatients([...onlinePatientArr]));
        store.dispatch(authActions.setPatientStatus(true));
      });

      break;
    case "socket/connect":
      connectAndJoinRoom(getState);
      socket.on("connect_error", (error) => {
        console.error("Socket.IO connection error:", error);
      });
      break;
    case "socket/disconnect":
      if (socket.connected) {
        socket.emit(
          "userDisconnect",
          { tenant_id, fcm_token, platform },
          (callBack) => {
            console.log("userDisconnect callBack =======>>>", callBack);
          }
        );
        socket.disconnect();
      }
      break;

    default:
      break;
  }

  return next(action);
};
