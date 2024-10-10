import {
  Backdrop,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Fade,
  Grid,
  IconButton,
  Modal,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { permissionArr } from "../../Config/Static_Data";
import { color } from "../../Config/theme";
import { getApiData } from "../../Utils/APIHelper";
import { Setting } from "../../Utils/Setting";
import { isMobile, isTablet } from "react-device-detect";
import { CloseOutlined } from "@mui/icons-material";
import { isArray, isEmpty } from "lodash";
import Info from "../CustomIcon/Global/Info";

export default function UserPermission(props) {
  const { handleClick = () => null, data, visible = false } = props;
  const { userData } = useSelector((state) => state.auth);
  const [checkedItem, setCheckedItem] = useState(permissionArr);
  const orgId = userData?.personal_info?.org_id;
  const role_slug = data?.role_slug;

  const [loader, setLoader] = useState(false);
  const [checkedPermission, setCheckedPermission] = useState([]);

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: isMobile ? "70vw" : isTablet ? "50vw" : 450,
    bgcolor: "background.paper",
    borderRadius: "12px",
    boxShadow: 24,
    p: 4,
  };

  useEffect(() => {
    setCheckedItem(permissionArr);
  }, []);

  useEffect(() => {
    permissionList();
  }, []);

  useEffect(() => {
    setData();
  }, [data]);

  function setData() {
    let dummy_Arr = [...checkedItem];
    // set permission array
    let slug_match_arr = [];
    if (!isEmpty(checkedPermission) && isArray(checkedPermission)) {
      checkedPermission?.map((val, ind) => {
        if (val?.role_slug === data?.role_slug) {
          slug_match_arr.push(val);
        }
      });
    }

    // find slug
    let permission = slug_match_arr.map((item) => item?.permission);
    // match and set status
    dummy_Arr?.map((item, index) => {
      if (permission.includes(item?.key)) {
        return (item.status = true);
      } else {
        return (item.status = false);
      }
    });
    setCheckedItem(dummy_Arr);
  }

  // check box chage function
  const handleChange = (val, index) => {
    var updatedList = [...checkedItem];

    updatedList.map((item, ind) => {
      if (index === ind) {
        item.status = !item.status;
      }
    });
    setCheckedItem(updatedList);
  };

  // save data function
  const handleSubmit = () => {
    let sendArr = [];
    checkedItem?.map((item, index) => {
      if (item?.status === true) {
        sendArr.push({ permission: item?.key });
      }
    });
    roleCustomize(sendArr);
  };

  // change role permission
  async function roleCustomize(data) {
    setLoader(true);
    try {
      const response = await getApiData(
        `${Setting.endpoints.roleCustomize}`,
        "POST",
        {
          data: isEmpty(data) ? "" : JSON.stringify(data),
          org_id: orgId,
          role_slug: role_slug,
        },
        true
      );
      if (response.status) {
        toast.success(response.message);
        permissionList();
        handleClick("close");
      } else {
        toast.error(response.message);
      }
      setLoader(false);
    } catch (error) {
      setLoader(false);
      toast.error(error.toString());
      console.log("error =======>>>", error);
    }
  }

  // permissions
  async function permissionList() {
    try {
      const response = await getApiData(
        Setting.endpoints.rolePermission,
        "GET",
        {},
        true
      );
      if (response?.status) {
        if (!isEmpty(response?.data) && isArray(response?.data)) {
          setCheckedPermission(response?.data);
        }
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(error.toString());
      console.log("error =======>>>", error);
    }
  }

  return (
    <Modal
      open={visible}
      closeAfterTransition
      disableAutoFocus
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
      onClose={() => {
        handleClick("close");
      }}
    >
      <Fade in={visible}>
        <Box sx={style}>
          <div style={{ position: "relative" }}>
            <IconButton
              style={{
                position: "absolute",
                top: -30,
                right: -30,
              }}
              onClick={() => {
                handleClick("close");
              }}
            >
              <CloseOutlined />
            </IconButton>
            <Grid
              item
              style={{
                disaply: "flex",
                justifyContent: "center",
                width: "100%",
              }}
            >
              {/* close  */}
              <Typography variant="title" style={{ color: color.primary }}>
                {data?.name} Permission
              </Typography>

              <Grid
                item
                style={{
                  marginTop: 20,
                  boxShadow: color.shadow,
                  padding: 20,
                  borderRadius: 12,
                  border: `1px solid ${color.borderColor}`,
                }}
              >
                {checkedItem?.map((item, index) => {
                  const lastindex = permissionArr.length - 1;
                  if (data?.id === 3 && index === 3) {
                    return null;
                  } else {
                    return (
                      <Grid
                        key={index}
                        item
                        xs={12}
                        display={"flex"}
                        alignItems="center"
                        style={{ marginBottom: index !== lastindex && 10 }}
                      >
                        <Tooltip
                          title="need to set tooltip"
                          arrow
                          placement="top"
                        >
                          <div
                            style={{
                              lineHeight: 0,
                              cursor: "pointer",
                              marginRight: 5,
                            }}
                          >
                            <Info fill={color.gray} />
                          </div>
                        </Tooltip>
                        <Typography style={{ marginRight: 20 }}>
                          {item?.title}
                        </Typography>
                        <Checkbox
                          checked={item?.status}
                          onChange={(event) => handleChange(item, index)}
                          style={{ marginLeft: "auto" }}
                        />
                      </Grid>
                    );
                  }
                })}
                <Grid
                  item
                  xs={12}
                  display={"flex"}
                  justifyContent="center"
                  alignItems={"center"}
                  style={{ marginTop: 20 }}
                >
                  <Button
                    variant="contained"
                    onClick={() => handleSubmit()}
                    style={{ minWidth: 120 }}
                    disabled={loader}
                  >
                    {loader ? <CircularProgress size={22} /> : "Save"}
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </div>
        </Box>
      </Fade>
    </Modal>
  );
}
