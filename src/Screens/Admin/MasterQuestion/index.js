import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Grid, IconButton, Tooltip, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { color } from "../../../Config/theme";
import styles from "./styles";
import { getApiData } from "../../../Utils/APIHelper";
import { Setting } from "../../../Utils/Setting";
import { toast } from "react-toastify";
import { isArray, isEmpty } from "lodash";
import NoData from "../../../Components/NoData";
import BackBtn from "../../../Components/BackBtn";
import UpdateQuestions from "../../../Components/Forms/UpdateQuestions";
import MainLoader from "../../../Components/Loader/MainLoader";
import Edit from "../../../Components/CustomIcon/Global/Edit";
import { EncDctFn } from "../../../Utils/EncDctFn";
import { isBrowser } from "react-device-detect";

export default function EmailTemplates() {
  const classes = styles();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParams = Object.fromEntries(searchParams.entries());

  const [loader, setLoader] = useState(false);

  // change tab
  const [changeTab, setChangeTab] = useState("");
  const [questionList, setQuestionList] = useState([]);
  const [editHover, setEditHover] = useState(null);

  const auditColumn = [
    {
      field: "id",
      headerName: "Sr. No.",
      width: 70,
      headerAlign: "center",
      align: "center",
      sortable: false,
      renderCell: (params) => {
        const ind =
          params?.api?.getRowIndexRelativeToVisibleRows(params?.row?.id) + 1;
        return <Typography>{ind}</Typography>;
      },
    },
    {
      field: "question",
      headerName: "Proctor Question",
      sortable: false,
      minWidth: 300,
      flex: 1,
      renderCell: (params) => {
        return <Typography>{params?.row?.question || "-"}</Typography>;
      },
    },
    {
      field: "patient_question",
      headerName: "Patient Question",
      sortable: false,
      minWidth: 300,
      flex: 1,
      renderCell: (params) => {
        return <Typography>{params?.row?.patient_question || "-"}</Typography>;
      },
    },
    {
      field: "meta_name",
      sortable: false,
      headerName: "Metric Name",
      minWidth: 200,
      flex: 1,
      renderCell: (params) => {
        return <Typography>{params?.row?.meta_name || "-"}</Typography>;
      },
    },
    {
      field: "event_type",
      sortable: false,
      headerName: "Event Type",
      minWidth: 300,
      flex: 1,
      renderCell: (params) => {
        let event_type;
        switch (params?.row?.event_type) {
          case "1":
            event_type = "Med History";
            break;
          case "2":
            event_type = "Immediate Post Injury Screening";
            break;
          case "3":
            event_type = "Potential Concussive Event Information";
            break;
          case "4":
            event_type = "Treatment Info";
            break;
          case "5":
            event_type = "Symptom Inventory";
            break;
          case "6":
            event_type = "Immediate Recall";
            break;
          case "7":
            event_type = "Digit Recall";
            break;
          default:
            event_type = "";
        }
        return <Typography>{event_type || "-"}</Typography>;
      },
    },
    {
      field: "action",
      headerName: "Action",
      width: 100,
      align: "center",
      sortable: false,
      headerAlign: "center",
      renderCell: (params) => {
        return (
          <div style={{ display: "flex" }}>
            <Tooltip title="Edit" arrow>
              <Link
                replace
                to={`/admin/master-question?id=${EncDctFn(
                  params?.row?.id,
                  "encrypt"
                )}&tab=edit`}
              >
                <IconButton
                  onMouseEnter={() => setEditHover(params?.row?.id)}
                  onMouseLeave={() => setEditHover(null)}
                  style={{ height: 40, width: 40 }}
                >
                  <Edit
                    fill={
                      isBrowser && editHover === params?.row?.id
                        ? color.white
                        : color.primary
                    }
                  />
                </IconButton>
              </Link>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    MasterQuestionList();
  }, [changeTab]);

  useEffect(() => {
    setEditHover(null);
  }, [changeTab]);

  useEffect(() => {
    if (searchParams.has("tab")) {
      setChangeTab(searchParams.get("tab"));
    }
  }, [searchParams]);

  async function MasterQuestionList(bool) {
    !bool && setLoader(true);
    try {
      const response = await getApiData(
        Setting.endpoints.patientQuestions,
        "GET",
        {}
      );
      if (response?.status) {
        if (!isEmpty(response?.data) && isArray(response?.data)) {
          setQuestionList(response?.data);
        }
      } else {
        toast.error(response?.message);
      }
      setLoader(false);
    } catch (er) {
      console.log("er=====>>>>>", er);
      toast.error(er.toString());
      setLoader(false);
    }
  }

  return (
    <Grid className={classes.container}>
      {changeTab === "edit" ? (
        <UpdateQuestions
          handleClick={(type) => {
            if (type === "cancel") {
              setChangeTab("");
              delete queryParams.tab;
              delete queryParams.id;
              setSearchParams({ ...queryParams }, { replace: true });
            }
          }}
        />
      ) : (
        <div className={classes.gridContainer}>
          <Grid
            item
            container
            display={"flex"}
            alignItems="center"
            justifyContent={"space-between"}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <BackBtn handleClick={() => navigate(-1)} />
              <Typography variant="title" style={{ color: color.primary }}>
                Master Questions
              </Typography>
            </div>
          </Grid>
          {loader ? (
            <Grid
              container
              display={"flex"}
              alignItems="center"
              justifyContent={"center"}
              style={{ height: 500 }}
            >
              <MainLoader />
            </Grid>
          ) : !isEmpty(questionList) ? (
            <div style={{ margin: "20px 0px" }}>
              <DataGrid
                rows={questionList}
                columns={auditColumn}
                getRowId={questionList?.role_id}
                disableColumnMenu
                hideFooter
                showCellRightBorder
                disableSelectionOnClick
                showColumnRightBorder
                autoHeight={true}
                getRowHeight={() => "auto"}
                scrollbarSize={2}
                showCellVerticalBorder
                paginationMode="server"
              />
            </div>
          ) : (
            <NoData />
          )}
        </div>
      )}
    </Grid>
  );
}
