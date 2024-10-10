import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Button,
  Grid,
  IconButton,
  Pagination,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { color } from "../../../Config/theme";
import styles from "./styles";
import { getApiData } from "../../../Utils/APIHelper";
import { Setting } from "../../../Utils/Setting";
import { toast } from "react-toastify";
import { isArray, isEmpty } from "lodash";
import NoData from "../../../Components/NoData";
import BackBtn from "../../../Components/BackBtn";
import ConfirmDialog from "../../../Components/ConfirmDialog";
import MainLoader from "../../../Components/Loader/MainLoader";
import AddCmsForm from "../../../Components/Forms/AddCms";
import { EncDctFn } from "../../../Utils/EncDctFn";
import Edit from "../../../Components/CustomIcon/Global/Edit";
import Delete from "../../../Components/CustomIcon/Header/Delete";
import { isBrowser } from "react-device-detect";

export default function CmsTemplates() {
  const classes = styles();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParams = Object.fromEntries(searchParams.entries());

  const [loader, setLoader] = useState(false);
  const [changeTab, setChangeTab] = useState("");
  const [cmsList, setCmsList] = useState([]);
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [pageNo, setPageNo] = useState(1);
  const [editHover, setEditHover] = useState(null);
  const [deleteHover, setDeleteHover] = useState(null);

  const cmsColumns = [
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
      field: "title",
      headerName: "Title",
      sortable: false,
      minWidth: 250,
      flex: 1,
      renderCell: (params) => {
        return <Typography>{params?.row?.title || "-"}</Typography>;
      },
    },
    {
      field: "meta_title",
      sortable: false,
      headerName: "Meta Title",
      minWidth: 300,
      flex: 1,
      renderCell: (params) => {
        return <Typography>{params?.row?.meta_title || "-"}</Typography>;
      },
    },
    {
      field: "meta_description",
      headerName: "Description",
      sortable: false,
      minWidth: 200,
      flex: 1,
      renderCell: (params) => {
        return <Typography>{params?.row?.meta_description || "-"}</Typography>;
      },
    },
    {
      field: "meta_keyword",
      headerName: "Meta Key",
      sortable: false,
      minWidth: 200,
      flex: 1,
      renderCell: (params) => {
        return <Typography>{params?.row?.meta_keyword || "-"}</Typography>;
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
                to={`/admin/cms-templates?id=${EncDctFn(
                  params?.row?.id,
                  "encrypt"
                )}&tab=edit_cms`}
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
                onMouseEnter={() => setDeleteHover(params?.row?.id)}
                onMouseLeave={() => setDeleteHover(null)}
                style={{ height: 40, width: 40 }}
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
    if (isEmpty(changeTab)) {
      cmsTemplateList();
    }
    setEditHover(null);
    setDeleteHover(null);
  }, [changeTab, pageNo]);
  useEffect(() => {
    if (searchParams.has("tab")) {
      setChangeTab(searchParams.get("tab"));
    } else {
      setChangeTab("");
    }
  }, [searchParams]);

  async function cmsTemplateList(bool) {
    !bool && setLoader(true);
    try {
      const response = await getApiData(
        `${Setting.endpoints.getAllCms}?page=${pageNo}`,
        "GET",
        {}
      );
      if (response?.status) {
        if (!isEmpty(response?.data)) {
          setCmsList(response?.data);
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

  async function deleteCms() {
    try {
      const response = await getApiData(
        `${Setting.endpoints.deleteCms}?id=${deleteId}`,
        "GET",
        {}
      );
      if (response?.status) {
        setOpen(false);
        toast.success(response?.message);
        cmsTemplateList(true);
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
      {changeTab === "add_cms" || changeTab === "edit_cms" ? (
        <AddCmsForm
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
                CMS Templates
              </Typography>
            </div>
            <div>
              <Link to={"/admin/cms-templates?tab=add_cms"} replace>
                <Button variant="contained" style={{ minWidth: 120 }}>
                  Add
                </Button>
              </Link>
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
          ) : !isEmpty(cmsList?.cmsData) && isArray(cmsList?.cmsData) ? (
            <>
              <div style={{ margin: "20px 0px" }}>
                <DataGrid
                  rows={cmsList?.cmsData}
                  columns={cmsColumns}
                  getRowId={cmsList?.role_id}
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
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Pagination
                  count={Math.ceil(cmsList?.pagination?.totalPage)}
                  defaultPage={pageNo}
                  boundaryCount={2}
                  siblingCount={0}
                  color="primary"
                  onChange={(v, e) => {
                    setPageNo(e);
                  }}
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
            deleteCms();
          } else {
            setOpen(false);
          }
        }}
      />
    </Grid>
  );
}
