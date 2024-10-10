import _, { isEmpty } from "lodash";
import { Setting } from "./Setting";
import { store } from "../Redux/store/configureStore";
import authAction from "../Redux/reducers/auth/actions";
import CryptoJS from "crypto-js";
const secretKey = "NOT_IN_USE"; //process.env.REACT_APP_SECRET_KEY

function getUserToken() {
  const {
    auth: { token },
  } = store.getState();
  return `Bearer ${token}`;
}

export async function getApiData(endpoint, method, data, headers = {}) {
  const isOnline = window.navigator.onLine;
  if (isOnline) {
    const authState = store?.getState() || {};
    const token = authState?.auth?.token || "";
    const oldUserData = authState?.auth?.oldUserData || {};
    const userData = authState?.auth?.userData || {};
    const isLogin = authState?.auth?.isLogin;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const socketID = authState?.auth?.socketID;
    const authHeaders = {
      "Content-Type": "application/json",
      authorization: token ? `Bearer ${token}` : "",
    };
    return new Promise(async (resolve, reject) => {
      let query = "";
      let qs = "";

      const params = {};
      params.method = method.toUpperCase();

      if (!_.isEmpty(headers)) {
        params.headers = headers;
      } else {
        params.headers = authHeaders;
      }
      params.headers.timezone = timezone; //DONT REPLACE THIS LINE ABOVE
      if (Setting.domain) {
        if (!isEmpty(oldUserData)) {
          params.headers["tenant-alias"] = userData?.personal_info?.domain;
        } else {
          params.headers["tenant-alias"] = Setting.domain;
        }
      }
      params.headers["socket_token"] = socketID;
      if (params.method === "POST" || params.method === "PATCH") {
        if (
          params.headers &&
          params.headers["Content-Type"] &&
          params.headers["Content-Type"] === "application/json"
        ) {
          // FOR ENCRYPT DATA
          if (data?.encrypt === true) {
            Object.entries(data).forEach(async ([key, value]) => {
              const plaintext = JSON.stringify(value);
              const cipher = CryptoJS.AES.encrypt(
                plaintext,
                secretKey
              ).toString();
              data[key] = cipher;
            });
          }
          params.body = JSON.stringify(data);
        } else {
          params.body = query;
        }
      } else {
        qs = `?${query}`;
      }

      let url = Setting.api + endpoint + qs;
      let length = url.length;
      if (url.charAt(length - 1) === "?") url = url.slice(0, length - 1);
      await fetch(url, params)
        .then((response) => response.json())
        .then((resposeJson) => {
          if (
            _.isObject(resposeJson) &&
            _.has(resposeJson, "code") &&
            (_.toNumber(resposeJson.code) === 402 ||
              _.toNumber(resposeJson.code) === 403)
          ) {
            if (isLogin && endpoint !== "/user/refresh-token") {
              store.dispatch(authAction.setRemoveToken(true));
            }
            // Logout Process
          } else {
            if (
              !_.isEmpty(resposeJson?.data) &&
              resposeJson?.encrypt === true
            ) {
              const bytes = CryptoJS.AES.decrypt(resposeJson?.data, secretKey);
              const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
              resposeJson.data = JSON.parse(decryptedData);
            }
            resolve(resposeJson);
            if (!authState?.auth?.isRefreshToken && isLogin) {
              store.dispatch(authAction.setIsRefreshToken(true));
            }
          }
        })
        .catch((err) => {
          console.log("Catch Part", err);
          reject(err);
        });
    });
  }
}

export function getAPIProgressData(
  endpoint,
  method,
  data,
  headers = false,
  onProgress = null
) {
  const isOnline = window.navigator.onLine;
  const authState = store?.getState() || {};
  const isLogin = authState?.auth?.isLogin;
  const oldUserData = authState?.auth?.oldUserData || {};
  const userData = authState?.auth?.userData || {};
  if (isOnline) {
    return new Promise(async (resolve, reject) => {
      const url = Setting.api + endpoint;
      const oReq = new XMLHttpRequest();
      oReq.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded * 100) / event.total;
          if (onProgress) {
            onProgress(progress);
          }
        }
      });

      var FormData = require("form-data");
      var form = new FormData();
      if (data && Object.keys(data).length > 0) {
        Object.keys(data).map((k) => form.append(k, data[k]));
      }

      const hData = {
        "Content-Type": "multipart/form-data",
      };

      if (headers) {
        hData.Authorization = getUserToken();
      }

      let options = {
        method: method,
        headers: hData,
        body: form,
      };

      if (Setting.domain) {
        if (!isEmpty(oldUserData)) {
          options.headers["tenant-alias"] = userData?.personal_info?.domain;
        } else {
          options.headers["tenant-alias"] = Setting.domain;
        }
        // options.headers["tenant-alias"] = Setting.domain;
      }
      delete options.headers["Content-Type"];

      await fetch(url, options)
        .then(function (res) {
          resolve(res.json());
          if (!authState?.auth?.isRefreshToken && isLogin) {
            store.dispatch(authAction.setIsRefreshToken(true));
          }
        })
        .then(function (result) {})
        .catch((err) => {
          console.log("Catch Part", err);
          reject(err);
        });
    });
  }
}
