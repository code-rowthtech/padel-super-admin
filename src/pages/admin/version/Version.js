import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import {
    FaApple,
    FaAndroid,
    FaCog,
} from "react-icons/fa";
import { app_logo } from "../../../assets/files";
import { useDispatch, useSelector } from "react-redux";
import { getVersion, updateVersion } from "../../../redux/thunks";
import { ButtonLoading } from "../../../helpers/loading/Loaders";

const Version = () => {
    const dispatch = useDispatch()
    const versionData = useSelector((state) => state?.version?.versionData)
    const versionLoading = useSelector((state) => state?.version?.versionLoading)
    const updateLoading = useSelector((state) => state?.version?.updateVersionLoading)
    const [andLoading, setAndLoading] = useState(false);
    const [iosLoading, setIosLoading] = useState(false);

    console.log({ versionData })
    const [initialVersions, setInitialVersions] = useState({
        ios: "",
        ios_admin: "",
        android: "",
        android_admin: "",
    });
    const [versions, setVersions] = React.useState({
        ios: "",
        ios_admin: "",
        android: "",
        android_admin: "",
    });

    useEffect(() => {
        dispatch(getVersion())
    }, [dispatch])

    useEffect(() => {
        if (versionData?.length) {
            const data = {};

            versionData.forEach((item) => {

                if (item.platform === "ios") {
                    data.ios = item.latestVersion;
                }

                if (item.platform === "ios_admin") {
                    data.ios_admin = item.latestVersion;
                }

                if (item.platform === "android") {
                    data.android = item.latestVersion;
                }

                if (item.platform === "android_admin") {
                    data.android_admin = item.latestVersion;
                }

            });
            setVersions(data);
            setInitialVersions(data);
        }
    }, [versionData]);

    const handleChange = (platform, value) => {
        setVersions((prev) => ({
            ...prev,
            [platform]: value,
        }));
    };
    const handleIosUpdate = async () => {
        try {
            setIosLoading(true);

            if (
                versions.ios !== initialVersions.ios &&
                versions.ios.trim() !== ""
            ) {
                await dispatch(updateVersion({
                    platform: "ios",
                    latestVersion: versions.ios
                })).unwrap();
            }

            if (
                versions.ios_admin !== initialVersions.ios_admin &&
                versions.ios_admin.trim() !== ""
            ) {
                await dispatch(updateVersion({
                    platform: "ios_admin",
                    latestVersion: versions.ios_admin
                })).unwrap();
            }

            dispatch(getVersion());

        } catch (err) {
            console.error(err);
        } finally {
            setIosLoading(false);
        }
    };

    const handleAndroidUpdate = async () => {
        try {
            setAndLoading(true);

            if (
                versions.android !== initialVersions.android &&
                versions.android.trim() !== ""
            ) {
                await dispatch(updateVersion({
                    platform: "android",
                    latestVersion: versions.android
                })).unwrap();
            }

            if (
                versions.android_admin !== initialVersions.android_admin &&
                versions.android_admin.trim() !== ""
            ) {
                await dispatch(updateVersion({
                    platform: "android_admin",
                    latestVersion: versions.android_admin
                })).unwrap();
            }

            dispatch(getVersion());

        } catch (err) {
            console.error(err);
        } finally {
            setAndLoading(false);
        }
    };
    return (
        <Container fluid className="p-4 bg-light">

            {/* Title */}
            <h2 className="fw-bold mb-4">Versions</h2>

            <Row className="g-4">

                {/* iOS */}
                <Col xs={12} lg={4} className="">
                    <div
                        className="p-4  h-100"
                        style={{
                            background: "#e6edf7",
                            borderRadius: "20px",
                        }}
                    >
                        {/* Header */}
                        <div
                            className="d-flex align-items-center w-100 gap-3 p-3 mb-4"
                            style={{
                                background: "#ffffff",
                                borderRadius: "14px",
                            }}
                        >
                            <FaApple size={28} color="#6c6f7d" />
                            <h4 className="mb-0 fw-semibold">iOS</h4>
                        </div>

                        {/* App Store Version */}
                        <Row className="mx-auto">
                            <Col lg={6} className="pe-3">
                                <div
                                    className="row d-flex align-items-center p-2 mb-4 "
                                    style={{
                                        background: "#ffffff",
                                        borderRadius: "18px",
                                    }}
                                >
                                    <div
                                        className="col-3 d-flex p-1 align-items-center justify-content-center overflow-hidden"
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: "16px",
                                            background: "linear-gradient(180deg, #0034E4 0%, #0034E4 100%)",
                                            border: "1px solid #e0e0e0",
                                        }}
                                    >
                                        <img
                                            src={app_logo}
                                            alt="Logo"
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                            }}
                                        />
                                    </div>

                                    <div className="ps-2 col-9">
                                        <div
                                            className="text-secondary text-nowrap"
                                            style={{
                                                fontSize: "13px",
                                                fontWeight: 500,
                                            }}
                                        >
                                            Swoot App Partner
                                        </div>
                                        <input
                                            type="text"
                                            value={versionLoading ? 'Loading....' : versions.ios_admin}
                                            onChange={(e) =>
                                                handleChange("ios_admin", e.target.value)
                                            }
                                            className="formdata border-0 w-100"
                                            style={{
                                                backgroundColor: "transparent",
                                                boxShadow: "none",
                                            }}
                                        />
                                    </div>

                                </div>
                            </Col>
                            <Col lg={6}>
                                <div
                                    className="row d-flex align-items-center p-2 mb-4"
                                    style={{
                                        background: "#ffffff",
                                        borderRadius: "18px",
                                    }}
                                >
                                    <div
                                        className="col-3 d-flex p-1 align-items-center justify-content-center overflow-hidden"
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: "16px",
                                            background: "linear-gradient(180deg, #0034E4 0%, #0034E4 100%)",
                                            border: "1px solid #e0e0e0",
                                        }}
                                    >
                                        <img
                                            src={app_logo}
                                            alt="Logo"
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                            }}
                                        />
                                    </div>

                                    <div className="ps-2 col-9">
                                        <div
                                            className="text-secondary text-nowrap"
                                            style={{
                                                fontSize: "13px",
                                                fontWeight: 500,
                                            }}
                                        >
                                            Swoot App User
                                        </div>
                                        <input
                                            type="text"
                                            value={versionLoading ? 'Loading....' : versions.ios}
                                            onChange={(e) =>
                                                handleChange("ios", e.target.value)
                                            }
                                            className="formdata border-0 w-100"
                                            style={{
                                                backgroundColor: "transparent",
                                                boxShadow: "none",
                                            }}
                                        />
                                    </div>
                                </div>
                            </Col>
                            <div className="d-flex justify-content-end">
                                <button onClick={handleIosUpdate} disabled={updateLoading && iosLoading} className="border-0 btn rounded-3 text-white" style={{ fontSize: "14px", fontWeight: "500", fontFamily: "Poppins", background: "linear-gradient(180deg, #0034E4 0%, #0034E4 100%)" }}>{(updateLoading && iosLoading) ? <ButtonLoading /> : "Update"}</button>
                            </div>
                        </Row>

                    </div>
                </Col>

                {/* Android */}
                <Col xs={12} lg={4}>
                    <div
                        className="p-4 h-100"
                        style={{
                            background: "#e8efe8",
                            borderRadius: "20px",
                           
                        }}
                    >
                        {/* Header */}
                        <div
                            className="d-flex align-items-center w-100 gap-3 p-3 mb-4"
                            style={{
                                background: "#ffffff",
                                borderRadius: "14px",
                                 width:"100%"
                            }}
                        >
                            <FaAndroid size={28} color="#63b44c" />
                            <h4 className="mb-0 fw-semibold">Android</h4>
                        </div>

                        {/* Play Store Version */}
                        <Row className="mx-auto">
                            <Col lg={6} className="pe-3">
                                <div
                                    className="row d-flex align-items-center p-2 mb-4"
                                    style={{
                                        background: "#ffffff",
                                        borderRadius: "18px",
                                    }}
                                >
                                    <div
                                        className="d-flex col-3 p-1 align-items-center justify-content-center overflow-hidden"
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: "16px",
                                            background: "linear-gradient(180deg, #0034E4 0%, #0034E4 100%)",
                                            border: "1px solid #e0e0e0",
                                        }}
                                    >
                                        <img
                                            src={app_logo}
                                            alt="Logo"
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                            }}
                                        />
                                    </div>

                                    <div className="ps-2 col-9">
                                        <div
                                            className="text-secondary text-nowrap"
                                            style={{
                                                fontSize: "13px",
                                                fontWeight: 500,
                                            }}
                                        >
                                            Swoot App Partner
                                        </div>
                                        <input
                                            type="text"
                                            value={versionLoading ? 'Loading....' : versions.android_admin}
                                            onChange={(e) =>
                                                handleChange("android_admin", e.target.value)
                                            }
                                            className="formdata border-0 w-100"
                                            style={{
                                                backgroundColor: "transparent",
                                                boxShadow: "none",
                                            }}
                                        />
                                    </div>
                                </div>
                            </Col>
                            <Col lg={6}>
                                <div
                                    className="row d-flex align-items-center p-2 mb-4"
                                    style={{
                                        background: "#ffffff",
                                        borderRadius: "18px",
                                    }}
                                >
                                    <div
                                        className="d-flex col-3 p-1 align-items-center justify-content-center overflow-hidden"
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: "16px",
                                            background: "linear-gradient(180deg, #0034E4 0%, #0034E4 100%)",
                                            border: "1px solid #e0e0e0",
                                        }}
                                    >
                                        <img
                                            src={app_logo}
                                            alt="Logo"
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                            }}
                                        />
                                    </div>

                                    <div className="col-9 ps-2">
                                        <div
                                            className="text-secondary text-nowrap"
                                            style={{
                                                fontSize: "13px",
                                                fontWeight: 500,
                                            }}
                                        >
                                            Swoot App User
                                        </div>
                                        <input
                                            type="text"
                                            value={versionLoading ? 'Loading....' : versions.android}
                                            onChange={(e) =>
                                                handleChange("android", e.target.value)
                                            }
                                            className="formdata border-0 w-100"
                                            style={{
                                                backgroundColor: "transparent",
                                                boxShadow: "none",
                                            }}
                                        />
                                    </div>
                                </div>
                            </Col>
                            <div className="d-flex justify-content-end">
                                <button onClick={handleAndroidUpdate} disabled={updateLoading && andLoading} className="border-0 btn rounded-3 text-white" style={{ fontSize: "14px", fontWeight: "500", fontFamily: "Poppins", background: "linear-gradient(180deg, #0034E4 0%, #0034E4 100%)" }}>{(updateLoading && andLoading) ? <ButtonLoading /> : "Update"}</button>
                            </div>
                        </Row>


                    </div>
                </Col>

            </Row>
        </Container >
    );
};

export default Version;