import { Grid } from "@mui/material";
import React, { useEffect, useState } from "react";
import Header from "../../Components/Header";
import { toast } from "react-toastify";
import { getApiData } from "../../Utils/APIHelper";
import { Setting } from "../../Utils/Setting";
import { useLocation } from "react-router-dom";
import { isEmpty } from "lodash";
import NoData from "../../Components/NoData";
import MainLoader from "../../Components/Loader/MainLoader";
import styles from "./styles";
import { isTablet } from "react-device-detect";

export default function CMS() {
  const className = styles();
  const location = useLocation();
  const [cmsData, setCmsData] = useState([]);
  const [pageLoad, setPageload] = useState(false);

  useEffect(() => {
    getCmsApi();
  }, []);

  async function getCmsApi() {
    setPageload(true);
    try {
      const response = await getApiData(Setting.endpoints.getCms, "POST", {
        slug: location?.state || "",
      });

      if (response?.status) {
        setCmsData(response?.data);
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      toast.error(err.toString());
      console.log("🚀 ~ file: index.js:10 ~ getCmsApi ~ err======>>>>>>>", err);
    } finally {
      setPageload(false);
    }
  }

  return (
    <>
      <Header from="cms" />
      <Grid
        container
        className={className.container}
        style={{ height: isTablet ? window.innerHeight : "100vh" }}
      >
        {pageLoad ? (
          <Grid item xs={12} className={className.loaderContainer}>
            <MainLoader />
          </Grid>
        ) : !isEmpty(cmsData) ? (
          <div dangerouslySetInnerHTML={{ __html: cmsData?.html_body }} />
        ) : (
          <Grid item xs={12} className={className.loaderContainer}>
            <NoData />
          </Grid>
        )}
      </Grid>
    </>
  );
}
