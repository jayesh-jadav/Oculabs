import types from "./actions";

const initialState = {
  userData: {},
  oldUserData: {},
  token: "",
  oldToken: "",
  useruuid: "",
  isOnline: true,
  isNotifiy: false,
  isLogin: false,
  refreshTokenExpired: "",
  isRefreshToken: false,
  isSuperAdmin: false,
  userType: "",
  userOrg: "",
  isToggleDrawer: false,
  isActivePatient: "",
  isDrawerList: false,
  captcha: 0,
  checkList: {},
  eventID: "",
  notificationCount: "",
  selectedOrganization: null,
  setChangeOrganizationStatus: null,
  permissionData: {},
  adminLoader: false,
  backNotiCount: 0,
  realTimeApiCall: {},
  onlinePatients: [],
  patientStatus: false,
  hasIntro: {
    homeIntro: true,
    patientIntro: true,
    calenderIntro: true,
    adminIntro: true,
  },
  removeToken: false,
  loginImage: "",
  socketID: "",
  refDemoTime: "",
  playButton: true,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case types.SET_USER_DATA:
      localStorage.setItem("userData", JSON.stringify(action.userData));
      return {
        ...state,
        userData: action.userData,
      };

    case types.SET_OLD_USER_DATA:
      localStorage.setItem("oldUserData", JSON.stringify(action.oldUserData));
      return {
        ...state,
        oldUserData: action.oldUserData,
      };

    // online status
    case types.ONLINE_STATUS:
      return {
        ...state,
        isOnline: action.isOnline,
      };

    case types.LOGIN_STATUS:
      return {
        ...state,
        isLogin: action.isLogin,
      };
    //access token
    case types.USER_TOKEN:
      return {
        ...state,
        token: action.token,
      };

    case types.USER_OLD_TOKEN:
      return {
        ...state,
        oldToken: action.oldToken,
      };

    case types.SET_DISPLAY_NOTIFICATION_POP_UP:
      return {
        ...state,
        isNotifiy: action.isNotifiy,
      };

    case types.SET_NOTI_DATA:
      return {
        ...state,
        notiData: action.notiData,
      };

    case types.SET_USER_UUID:
      return {
        ...state,
        useruuid: action.useruuid,
      };

    case types.SET_IS_SUPERADMIN:
      return {
        ...state,
        isSuperAdmin: action.isSuperAdmin,
      };

    case types.SET_REFRESH_TOKEN_EXPIRED:
      return {
        ...state,
        refreshTokenExpired: action.refreshTokenExpired,
      };
    case types.SET_IS_REFRESH_TOKEN:
      return {
        ...state,
        isRefreshToken: action.isRefreshToken,
      };

    case types.SET_USERTYPE:
      return {
        ...state,
        userType: action.userType,
      };

    case types.SET_USER_ORG:
      return {
        ...state,
        userOrg: action.userOrg,
      };

    case types.SET_TOGGLEDRAWER:
      return {
        ...state,
        isToggleDrawer: action.isToggleDrawer,
      };
    case types.SET_ACTIVEPATIENT:
      return {
        ...state,
        isActivePatient: action.isActivePatient,
      };
    case types.SET_DRAWERLIST:
      return {
        ...state,
        isDrawerList: action.isDrawerList,
      };
    case types.SET_CAPTCHA:
      return {
        ...state,
        captcha: action.captcha,
      };
    case types.SET_CHECKLIST:
      return {
        ...state,
        checkList: {
          [action.id]: action.checkList,
        },
      };

    case types.CLEAR_CHECKLIST:
      return {
        ...state,
        checkList: [],
      };

    case types.SET_EVENT_ID:
      return {
        ...state,
        eventID: action.eventID,
      };
    case types.SET_NOTIFICATION_COUNT:
      return {
        ...state,
        notificationCount: action.notificationCount,
      };
    case types.SET_SELECTED_ORGANIZATION:
      return {
        ...state,
        selectedOrganization: action.selectedOrganization,
      };

    case types.SET_CHANGE_ORGANIZATION_STATUS:
      return {
        ...state,
        organizationStatus: action.organizationStatus,
      };

    case types.PERMISSION_DATA:
      return {
        ...state,
        permissionData: action.permissionData,
      };

    case types.ADMIN_LOADER:
      return { ...state, adminLoader: action.adminLoader };

    case types.SET_BACK_NOTI_COUNT:
      return { ...state, backNotiCount: action.backNotiCount };
    case types.SET_REALTIME_API_CALL:
      return { ...state, realTimeApiCall: action.realTimeApiCall };
    case types.SET_ONLINE_PATIENTS:
      return { ...state, onlinePatients: action.onlinePatients };
    case types.SET_PATIENT_STATUS:
      return { ...state, patientStatus: action.patientStatus };
    case types.SET_REMOVE_TOKEN:
      return { ...state, removeToken: action.removeToken };
    case types.SET_HAS_INTRO:
      return {
        ...state,
        hasIntro: {
          ...state.hasIntro,
          [action.payload.key]: action.payload.value, // Update the specific key
        },
      };
    case types.SET_LOGIN_IMAGE:
      return {
        ...state,
        loginImage: action.loginImage,
      };
    case types.SET_SOCKET_ID:
      return {
        ...state,
        socketID: action.socketID,
      };

    case types.SET_REF_DEMO_TIME:
      return {
        ...state,
        refDemoTime: action.refDemoTime,
      };

    case types.SET_PLAYBACK_BUTTON:
      return {
        ...state,
        playButton: action.playButton,
      };

    case types.CLEAR_ALL_STORAGE_DATA:
      // localStorage.clear();
      localStorage.removeItem("userData");
      localStorage.removeItem("oldUserData");
      return {
        ...state,
        userData: {},
        token: "",
        oldUserData: {},
        oldToken: "",
        isSuperAdmin: "",
        refreshTokenExpired: "",
        isRefreshToken: false,
        userType: "",
        userOrg: "",
        isToggleDrawer: false,
        isActivePatient: "",
        isDrawerList: false,
        captcha: 0,
        eventID: "",
        notificationCount: "",
        selectedOrganization: null,
        organizationStatus: null,
        permissionData: {},
        adminLoader: false,
        backNotiCount: 0,
        realTimeApiCall: {},
        onlinePatients: [],
        patientStatus: false,
        removeToken: false,
        socketID: "",
        playButton: false,
      };

    default:
      return state;
  }
}
