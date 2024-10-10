import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button, Grid, IconButton, Tooltip, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { color } from "../../../Config/theme";
import styles from "./styles";
import { getApiData } from "../../../Utils/APIHelper";
import { Setting } from "../../../Utils/Setting";
import { toast } from "react-toastify";
import { isArray, isEmpty } from "lodash";
import NoData from "../../../Components/NoData";
import BackBtn from "../../../Components/BackBtn";
import AddEmailsForm from "../../../Components/Forms/AddEmails";
import ConfirmDialog from "../../../Components/ConfirmDialog";
import MainLoader from "../../../Components/Loader/MainLoader";
import Edit from "../../../Components/CustomIcon/Global/Edit";
import { useSelector } from "react-redux";
import { EncDctFn } from "../../../Utils/EncDctFn";
import Delete from "../../../Components/CustomIcon/Header/Delete";
import { isBrowser } from "react-device-detect";

export default function EmailTemplates() {
  const { userType } = useSelector((state) => state.auth);
  const classes = styles();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParams = Object.fromEntries(searchParams.entries());

  const [loader, setLoader] = useState(false);
  const [changeTab, setChangeTab] = useState("");
  const [emailList, setEmailList] = useState([]);
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [editHover, setEditHover] = useState(null);
  const [deleteHover, setDeleteHover] = useState(null);

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
      field: "email_template_name",
      headerName: "Name",
      sortable: false,
      minWidth: 250,
      flex: 1,
      renderCell: (params) => {
        return (
          <Typography>{params?.row?.email_template_name || "-"}</Typography>
        );
      },
    },
    {
      field: "email_slug",
      sortable: false,
      headerName: "Slug",
      minWidth: 300,
      flex: 1,
      renderCell: (params) => {
        return <Typography>{params?.row?.email_slug || "-"}</Typography>;
      },
    },
    {
      field: "email_subject",
      headerName: "Subject",
      sortable: false,
      minWidth: 200,
      flex: 1,
      renderCell: (params) => {
        return <Typography>{params?.row?.email_subject || "-"}</Typography>;
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
                to={`/admin/email-templates?id=${EncDctFn(
                  params?.row?.id,
                  "encrypt"
                )}&tab=edit_email`}
                replace
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
            <Tooltip title="Delete" arrow>
              <IconButton
                onClick={() => {
                  setOpen(true);
                  setDeleteId(params?.row?.id);
                }}
                style={{ height: 40, width: 40 }}
                onMouseEnter={() => setDeleteHover(params?.row?.id)}
                onMouseLeave={() => setDeleteHover(null)}
                sx={{
                  color: color.error,
                  "&:hover": {
                    backgroundColor: isBrowser && color.error,
                  },
                }}
              >
                <Delete
                  fill={
                    isBrowser && deleteHover === params?.row?.id
                      ? color.white
                      : color.error
                  }
                />
              </IconButton>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    emailTemplateList();
    setEditHover(null);
    setDeleteHover(null);
  }, [changeTab]);

  useEffect(() => {
    if (searchParams.has("tab")) {
      setChangeTab(searchParams.get("tab"));
    } else {
      setChangeTab("");
    }
  }, [searchParams]);

  async function emailTemplateList(bool) {
    !bool && setLoader(true);
    try {
      const response = await getApiData(Setting.endpoints.getAll, "GET", {});
      if (response?.status) {
        if (!isEmpty(response?.data) && isArray(response?.data)) {
          setEmailList(response?.data);
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

  async function deleteEmail() {
    try {
      const response = await getApiData(Setting.endpoints.deleteEmail, "POST", {
        id: deleteId,
      });
      if (response?.status) {
        setOpen(false);
        toast.success(response?.message);
        emailTemplateList(true);
      } else {
        toast.error(response?.message);
      }
    } catch (er) {
      console.log("er=====>>>>>", er);
      toast.error(er.toString());
    }
  }

  return (
    <Grid className={classes.container}>
      {changeTab === "add_email" || changeTab === "edit_email" ? (
        <AddEmailsForm
          handleClick={(type) => {
            if (type === "cancel") {
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
                Email Templates
              </Typography>
            </div>
            {userType === "super_admin" && (
              <div>
                <Link to={"/admin/email-templates?tab=add_email"} replace>
                  <Button variant="contained" style={{ minWidth: 120 }}>
                    Add
                  </Button>
                </Link>
              </div>
            )}
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
          ) : !isEmpty(emailList) ? (
            <>
              <div style={{ margin: "16px 0px" }}>
                <DataGrid
                  rows={emailList}
                  columns={auditColumn}
                  getRowId={emailList?.role_id}
                  disableColumnMenu
                  hideFooter
                  showCellRightBorder
                  disableSelectionOnClick
                  showColumnRightBorder
                  autoHeight={true}
                  getRowHeight={() => "auto"}
                  scrollbarSize={2}
                  showCellVerticalBorder
                />
              </div>
            </>
          ) : (
            <NoData />
          )}
        </div>
      )}
      <ConfirmDialog
        title={`Are you sure you want to delete?`}
        visible={open}
        handleModal={(bool, id) => {
          if (bool) {
            deleteEmail();
          } else {
            setOpen(false);
          }
        }}
      />
    </Grid>
  );
}
