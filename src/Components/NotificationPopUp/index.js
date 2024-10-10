import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./styles.scss";
import Images from "../../Config/Images";
import { useNavigate } from "react-router-dom";
import { EncDctFn } from "../../Utils/EncDctFn";
import authActions from "../../Redux/reducers/auth/actions";
import { safeJsonParse } from "../../Utils/CommonFunctions";

const NotificationPopup = () => {
  const { isNotifiy, notiData } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { displayNotificationPopUp, setNotiData } = authActions;
  const title = notiData?.title !== "" ? notiData?.title : "-";
  const description = notiData?.msg !== "" ? notiData?.msg : "-";
  const navData = safeJsonParse(notiData?.data);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      dispatch(displayNotificationPopUp(false));
      dispatch(setNotiData({}));
    }, 5000);
  }, []);

  return isNotifiy ? (
    <div
      style={{
        cursor: "pointer",
      }}
      onClick={() => {
        dispatch(displayNotificationPopUp(false));
        if (
          notiData?.action === "open_request" ||
          notiData?.action === "request_page"
        ) {
          navigate("/admin/requests");
        } else if (notiData?.action === "patient_overview") {
          navigate(
            `/patient/details?patient_id=${EncDctFn(
              navData?.patient_id,
              "encrypt"
            )}`
          );
        }
        dispatch(setNotiData({}));
      }}
    >
      <div className={`notification-container top-right`}>
        <div className="sub-div-for-notification">
          <div className="sub-flex-con">
            <div className="notification-image">
              <img
                loading="lazy"
                src={Images.smallLogo}
                alt={"AppIcon"}
                className="noti-app-logo"
              />
              <span className="notification-title">Oculabs</span>
            </div>
            <span className="notification-title">{title || "Test"}</span>
            <span className="notification-message">
              {description || "Well come user"}
            </span>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

export default NotificationPopup;
