import React, { useEffect, useState } from "react";
import {
  home_banner,
  football,
  cricket,
  tennis2,
  batmintain,
  swiming,
  bannerimg,
} from "../../../assets/files";
import { LuClock4 } from "react-icons/lu";
import StarIcon from "@mui/icons-material/Star";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CloseIcon from "@mui/icons-material/Close";
import { FaArrowRight } from "react-icons/fa";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getReviewClub, getUserClub, getMapData } from "../../../redux/user/club/thunk";
import { Avatar } from "@mui/material";
import { getLogo, getUserProfile } from "../../../redux/user/auth/authThunk";
import { ReviewCard } from "./ReviewCard";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const Home = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [reviewSlide, setReviewSlide] = useState(0);
  const [selectedSport, setSelectedSport] = useState(0);
  const [loadedImages, setLoadedImages] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const store = useSelector((state) => state);
  const clubData = store?.userClub?.clubData?.data?.courts[0] || [];
  const User = useSelector((state) => state?.userAuth)

  const getReviewData = store?.userClub?.getReviewData?.data;
  const mapApiData = store?.userClub?.mapData?.data;
  const galleryImages = clubData?.courtImage?.slice(0, 10) || [];

  const handleImageLoad = (index) => {
    setLoadedImages((prev) => ({ ...prev, [index]: true }));
  };

  const defaultMapSrc =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.1422937950147!2d-73.98731968482413!3d40.75889497932681!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c6480299%3A0x55194ec5a1ae072e!2sTimes+Square!5e0!3m2!1sen!2sus!4v1510579767645";

  const createEmbedUrl = (address) => {
    const encodedAddress = encodeURIComponent(address);
    return `https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  };

  const mapSrc = mapApiData?.address ? createEmbedUrl(mapApiData.address) : defaultMapSrc;

  const todayIndex = new Date().getDay();
  const adjustedIndex = todayIndex === 0 ? 6 : todayIndex - 1;

  useEffect(() => {
    dispatch(getUserClub({ search: "" }));
    if (User?.user?.token) {
      dispatch(getUserProfile());
    }
    window.scrollTo(0, 0);
  }, [User?.user?.token]);

  useEffect(() => {
    if (clubData && clubData._id) {
      localStorage.setItem("register_club_id", clubData?._id);
      localStorage.setItem("owner_id", clubData?.ownerId?._id);
      dispatch(getLogo(clubData?.ownerId?._id));
    }
  }, [clubData]);

  const width = 370;
  const height = 70;
  const circleRadius = height * 0.3;
  const curvedSectionStart = width * 0.76;
  const curvedSectionEnd = width * 0.996;
  const circleX =
    curvedSectionStart + (curvedSectionEnd - curvedSectionStart) * 0.7 + 1;
  const circleY = height * 0.5;
  const arrowSize = circleRadius * 0.6;
  const arrowX = circleX;
  const arrowY = circleY;
  const buttonStyle = {
    position: "relative",
    width: `${width}px`,
    height: `${height}px`,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: 0,
    overflow: "visible",
  };

  const svgStyle = {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 1,
  };

  const contentStyle = {
    position: "relative",
    zIndex: 2,
    color: "#fff",
    fontWeight: "600",
    fontSize: "13px",
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    paddingRight: `${circleRadius * 2}px`,
    fontFamily: "Poppins",
    textDecoration: "none",
  };

  useEffect(() => {
    const id = clubData._id || "";
    if (id) {
      dispatch(getReviewClub(id));
    }
  }, [clubData?._id]);

  useEffect(() => {
    if (clubData?.address && clubData?.city) {
      const fullAddress = `${clubData.address}, ${clubData.city}`;
      dispatch(getMapData(fullAddress));
    }
  }, [clubData?.address, clubData?.city]);

  useEffect(() => {
    if (clubData?.courtImage?.length > 3) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => {
          if (prev >= clubData.courtImage.length) {
            return 1;
          }
          return prev + 1;
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [clubData?.courtImage?.length]);

  useEffect(() => {
    if (
      currentSlide === clubData?.courtImage?.length &&
      clubData?.courtImage?.length > 3
    ) {
      const timer = setTimeout(() => {
        setCurrentSlide(0);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentSlide, clubData?.courtImage?.length]);

  useEffect(() => {
    if (getReviewData?.reviews?.length > 3) {
      const interval = setInterval(() => {
        setReviewSlide((prev) => {
          if (prev >= getReviewData.reviews.length) {
            return 1;
          }
          return prev + 1;
        });
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [getReviewData?.reviews?.length]);

  useEffect(() => {
    if (
      reviewSlide === getReviewData?.reviews?.length &&
      getReviewData?.reviews?.length > 3
    ) {
      const timer = setTimeout(() => {
        setReviewSlide(0);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [reviewSlide, getReviewData?.reviews?.length]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const padelimg = [
    { img: football },
    { img: cricket },
    { img: swiming },
    { img: batmintain },
    { img: tennis2 },
  ];

  return (
    <>
      <div className="container px-0 mt-md-4 mt-0">
        <div className="row g-4 px-3 px-md-0">
          <div className="col-12 ps-md-0 pt-0 mt-3 mt-md-4">
            <div
              className="image-zoom-container position-relative overflow-hidden rounded-3"
              style={{ height: "100%" }}
            >
              <img
                src={home_banner}
                alt="Paddle"
                className="img-fluid w-100 h-100 object-fit-cover rounded-3 d-md-block d-none"
              />
              <img
                src={bannerimg}
                alt="Paddle"
                className="img-fluid w-100 h-100 object-fit-cover rounded-3 d-block d-md-none"
              />

              <div
                className="position-absolute start-0 w-100 h-100 d-flex flex-column justify-content-center text-white p-md-5 px-3  pb-2 pt-0 topzero"
                style={{
                  background:
                    "linear-gradient(269.34deg, rgba(158, 153, 153, 0) 0.57%, rgba(17, 24, 39, 0.5) 94.62%)",
                  backgroundBlendMode: "multiply",
                  backgroundBlendMode: "multiply",
                  top: "-10%",
                }}
              >
                <h1 className="home-main-heading ">
                  Your Game, <br />
                  Your Court,
                  <br />
                  Just a Tap Away.
                </h1>
                <Link
                  to="/booking"
                  className="text-decoration-none rounded-pill px-4 py-1 pt-2 custom-title d-inline-flex align-items-center book-now-btn d-md-flex d-none"
                  style={{
                    color: "#2043BA",
                    fontWeight: "600",
                    fontSize: "24px",
                    minWidth: "200px",
                    fontFamily: "Poppins",
                    justifyContent: "center",
                    width: "150px",
                  }}
                >
                  Book Now <FaArrowRight className="ms-2" />
                </Link>
                <style>{`
                  .book-now-btn {
                    background: #ffffff;
                    position: relative;
                    overflow: hidden;
                  }
                  .book-now-btn::before {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(
                      90deg,
                      transparent,
                      rgba(32, 67, 186, 0.4),
                      transparent
                    );
                    animation: shimmer 2.5s infinite;
                  }
                  @keyframes shimmer {
                    0% {
                      left: -100%;
                    }
                    100% {
                      left: 100%;
                    }
                  }
                `}</style>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="container  p-lg-0 rounded-3 home-second-banner"
        style={{ backgroundColor: "#F5F5F569" }}
      >
        <div className="row position-relative align-items-stretch px-0 px-md-0">
          <div className="col-lg-8 col-12  d-md-flex d-block ps-2 ps-md-0">
            <div
              className=" row mx-2 ms-lg-0 me-lg-2  pe-lg-3 bg-white  p-lg-2 flex-fill"
              style={{ border: "0.3px solid #858080ff", borderRadius: "20px" }}
            >
              <div
                className="col-lg-8 col-12 "
                style={{
                  borderRight: "1px solid transparent",
                  borderImage:
                    "linear-gradient(180deg,  rgba(255, 255, 255, 0) 0%, #002DC7 46.63%, rgba(255, 255, 255, 0) 94.23%)",
                  borderImageSlice: 1,
                }}
              >
                <div className="mb-md-4 mb-2 pt-md-1 pt-3   d-flex flex-column flex-lg-row align-items-start align-lg-center justify-content-start gap-md-3 gap-1">
                  <div className="mb-2 mt-lg-4 mb-lg-0 flex-shrink-0">
                    <Avatar>
                      {clubData?.clubName
                        ? clubData.clubName.charAt(0).toUpperCase()
                        : "User"}
                    </Avatar>
                  </div>
                  <div className="flex-shrink-0 mt-lg-3">
                    <h5
                      className="mb-0 mt-lg-2"
                      style={{
                        fontSize: "17px",
                        fontWeight: "600",
                        fontFamily: "Poppins",
                      }}
                    >
                      {clubData?.clubName || "The Court Line Club"}
                    </h5>
                    <div className="d-flex align-items-center justify-content-start text-nowrap">
                      <p className="text-success mb-0">
                        {[...Array(5)].map((_, i) => {
                          const rating = getReviewData?.averageRating || "";
                          if (i < Math.floor(rating)) {
                            return (
                              <StarIcon key={i} style={{ color: "#32B768" }} />
                            );
                          } else if (i < rating && rating % 1 >= 0.5) {
                            return (
                              <StarHalfIcon
                                key={i}
                                style={{ color: "#32B768" }}
                              />
                            );
                          } else {
                            return (
                              <StarBorderIcon
                                key={i}
                                style={{ color: "#ccc" }}
                              />
                            );
                          }
                        })}
                      </p>
                      <p
                        className="ms-2 pt-1 mb-0"
                        style={{
                          fontSize: "17.5px",
                          color: "#374151",
                          fontWeight: "500",
                          fontFamily: "Poppins",
                        }}
                      >
                        {getReviewData?.averageRating || ""}
                      </p>
                    </div>
                  </div>
                  {/* <div
                                        className="border rounded-4  me-1 p-2  py-3 mt-0 sport-box d-inline-block"
                                        style={{
                                            borderColor: "#e5e7eb",
                                            backgroundColor: "#fff",

                                        }}
                                    >
                                        <p
                                            className="mb-1"
                                            style={{
                                                fontSize: "8.57px",
                                                fontWeight: "600",
                                                fontFamily: "Poppins",
                                                color: "#111827",
                                            }}
                                        >
                                            cc
                                        </p>

                                        <div
                                            className="d-flex align-items-center  justify-content-between border rounded-pill  "
                                            style={{
                                                backgroundColor: "#f9fafb",
                                                overflowX: "auto",
                                                whiteSpace: "nowrap",
                                                scrollbarWidth: "none",
                                            }}
                                        >
                                            {padelimg.map((img, idx) => (
                                                <div
                                                    key={idx}
                                                    className="d-flex align-items-center p-0 justify-content-center rounded-pill"
                                                    style={{
                                                        backgroundColor: selectedSport === idx ? "#D9D9D9" : "transparent",
                                                        transition: "0.2s",
                                                        cursor: "pointer",
                                                        width: "63px",
                                                        height: "38px"
                                                    }}
                                                    onClick={() => setSelectedSport(idx)}
                                                >
                                                    <img
                                                        src={img.img}
                                                        alt=""
                                                        style={{
                                                            width: "45px",
                                                            height: "45px",
                                                            objectFit: "contain",
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div> */}
                </div>

                <div className="flex-grow-1 pe-lg-5 custom-scroll-dec">
                  <p
                    className="mb-2 mb-md-3 add_font_small_mobile"
                    style={{
                      fontSize: "13px",
                      fontFamily: "Poppins",
                      fontWeight: "400",
                    }}
                  >
                    {clubData?.clubName || "The Court Line Club"}{" "}
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ ...props }) => <h1 style={{ fontSize: 20, fontWeight: 700 }} {...props} />,
                        h2: ({ ...props }) => <h2 style={{ fontSize: 18, fontWeight: 600 }} {...props} />,
                        h3: ({ ...props }) => <h3 style={{ fontSize: 16, fontWeight: 600 }} {...props} />,
                        p: ({ ...props }) => <span style={{ fontSize: 14, marginBottom: 6 }} {...props} />,
                        li: ({ ...props }) => <li style={{ marginLeft: 18, fontSize: 14 }} {...props} />,
                        strong: ({ ...props }) => <strong style={{ fontWeight: 700 }} {...props} />,
                        em: ({ ...props }) => <em style={{ fontStyle: "italic" }} {...props} />,
                      }}
                    >
                      {clubData?.description
                        ?.replace(/\\r\\n/g, "\n")
                        ?.replace(/\r\n/g, "\n")
                        ?.replace(/\\n/g, "\n")}
                    </ReactMarkdown>

                  </p>
                  {/* <p
                    className="add_font_small_mobile"
                    style={{
                      fontSize: "13px",
                      fontFamily: "Poppins",
                      fontWeight: "400",
                      margin: "0px",
                    }}
                  >
                    Join the Padel community group on WhatsApp
                  </p>
                  <a href="" className="add_font_small_mobile">
                  </a>
                  <p className="mt-md-4 mt-2 add_font_small_mobile">
                    <a href="">
                    </a>
                  </p> */}
                </div>
              </div>

              <div className=" col-lg-4 col-12 ps-md-3 ">
                <div className="pt-md-4 pt-2 px-md-0">
                  <div className="col-12 d-none d-flex align-items-center justify-content-center border_right_bottom">
                    <h6 className="mb-2 add_font_heading_mobile">
                      Open now   6 AM - 11 PM
                    </h6>
                  </div>
                  {clubData?.businessHours?.length < 0 ? (
                    <div
                      className="text-center py-5"
                      style={{ fontFamily: "Poppins" }}
                    >
                      No Timing
                    </div>
                  ) : (
                    clubData?.businessHours?.map((day, idx) => (
                      <div
                        key={idx}
                        className={`d-flex justify-content-between open-now-time mb-3`}
                        style={{
                          fontWeight: idx === adjustedIndex ? "600" : "400",
                        }}
                      >
                        <span>{day?.day}</span>
                        <span>
                          {day?.time ||
                            (idx === 2
                              ? "6:00 AM - 11:00 PM"
                              : "6:00 AM - 10:00 PM")}
                        </span>
                      </div>
                    ))
                  )}
                  <p
                    className="mt-3 mb-2 mb-md-0 text-center add_font_small_mobile"
                    style={{
                      fontWeight: "500",
                      fontSize: "12px",
                      fontFamily: "Poppins",
                    }}
                  >
                    Time zone (India Standard Time)
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="row p-2 mt-3 add_shadow_rounded mx-auto d-block d-md-none">
            <div className="d-flex justify-content-center align-items-center px-0 ">
              <button
                style={{
                  ...buttonStyle,
                }}
                className=""
              >
                <svg
                  style={svgStyle}
                  viewBox={`0 0 ${width} ${height}`}
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient
                      id={`buttonGradient-${width}-${height}`}
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#001B76" />
                      <stop offset="50%" stopColor="#001B76" />
                      <stop offset="100%" stopColor="#001B76" />
                    </linearGradient>
                  </defs>
                  <path
                    d={`M ${width * 0.76} ${height * 0.15} C ${width * 0.79} ${height * 0.15
                      } ${width * 0.81} ${height * 0.2} ${width * 0.83} ${height * 0.3
                      } C ${width * 0.83} ${height * 0.32} ${width * 0.84} ${height * 0.34
                      } ${width * 0.84} ${height * 0.34} C ${width * 0.85} ${height * 0.34
                      } ${width * 0.86} ${height * 0.32} ${width * 0.86} ${height * 0.3
                      } C ${width * 0.88} ${height * 0.2} ${width * 0.9} ${height * 0.15
                      } ${width * 0.92} ${height * 0.15} C ${width * 0.97} ${height * 0.15
                      } ${width * 0.996} ${height * 0.3} ${width * 0.996} ${height * 0.5
                      } C ${width * 0.996} ${height * 0.7} ${width * 0.97} ${height * 0.85
                      } ${width * 0.92} ${height * 0.85} C ${width * 0.9} ${height * 0.85
                      } ${width * 0.88} ${height * 0.8} ${width * 0.86} ${height * 0.7
                      } C ${width * 0.86} ${height * 0.68} ${width * 0.85} ${height * 0.66
                      } ${width * 0.84} ${height * 0.66} C ${width * 0.84} ${height * 0.66
                      } ${width * 0.83} ${height * 0.68} ${width * 0.83} ${height * 0.7
                      } C ${width * 0.81} ${height * 0.8} ${width * 0.79} ${height * 0.85
                      } ${width * 0.76} ${height * 0.85} L ${width * 0.08} ${height * 0.85
                      } C ${width * 0.04} ${height * 0.85} ${width * 0.004} ${height * 0.7
                      } ${width * 0.004} ${height * 0.5} C ${width * 0.004} ${height * 0.3
                      } ${width * 0.04} ${height * 0.15} ${width * 0.08} ${height * 0.15
                      } L ${width * 0.76} ${height * 0.15} Z`}
                    fill={`url(#buttonGradient-${width}-${height})`}
                  />
                  <circle
                    cx={circleX}
                    cy={circleY}
                    r={circleRadius}
                    fill="#fff"
                  />
                  <g
                    stroke="#001B76"
                    strokeWidth={height * 0.03}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path
                      d={`M ${arrowX - arrowSize * 0.3} ${arrowY + arrowSize * 0.4
                        } L ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4
                        }`}
                    />
                    <path
                      d={`M ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4
                        } L ${arrowX - arrowSize * 0.1} ${arrowY - arrowSize * 0.4
                        }`}
                    />
                    <path
                      d={`M ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4
                        } L ${arrowX + arrowSize * 0.4} ${arrowY + arrowSize * 0.1
                        }`}
                    />
                  </g>
                </svg>
                <Link to={"/booking"} style={contentStyle}>
                  Book Now
                </Link>
              </button>
            </div>
          </div>

          <div className="col-lg-4 p-0  mt-3 mt-lg-0 pe-lg-2 d-md-block d-none ">
            <div
              className="text-white  position-relative h-100"
              style={{
                background: "linear-gradient(180deg, #0034E4 0%, #001B76 100%)",
                border: "2px solid #eceaeaff",
                borderRadius: "20px",
                height: "auto",
              }}
            >
              <div className="pt-5 pb-1 px-3" style={{ padding: "2rem" }}>
                <button
                  className="btn mb-3 rounded-pill text-white px-4 py-1"
                  onClick={() => navigate("/open-matches")}
                  style={{
                    border: "3px solid #FFFFFF",
                    fontSize: "23px",
                    fontFamily: "Poppins",
                    fontWeight: "500",
                  }}
                >
                  Open Matches
                </button>
                <h4 className="home-upcoming-heading mt-1">
                  Upcoming Open Matches
                </h4>
                <div className="">
                  <p
                    className="mb-4 custom-title text-white"
                    style={{ fontWeight: "400" }}
                  >
                    Join open matches happening <br />
                    around you right now.
                  </p>
                </div>
                <div className="text-start mb-3">
                  <Link
                    to="/open-matches"
                    className="text-decoration-none bg-white rounded-pill px-4 py-2 custom-title d-inline-flex book-now-btn align-items-center"
                    style={{
                      color: "#2043BA",
                      fontWeight: "500",
                      fontSize: "21px",
                      minWidth: "120px",
                      justifyContent: "center",
                      fontFamily: "Poppins",
                    }}
                  >
                    View all <FaArrowRight className="ms-2" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-md-5 mb-md-5 my-4">
        <div className="position-relative">
          <div className="overflow-hidden rounded-3">
            <div
              className={`d-flex ${clubData?.courtImage?.length > 4
                ? window.innerWidth >= 992
                  ? "justify-content-start"
                  : "justify-content-start"
                : "justify-content-center"
                } align-items-center gap-3`}
              style={{
                transform:
                  clubData?.courtImage?.length > 4
                    ? window.innerWidth >= 992
                      ? `translateX(-${currentSlide * 25}%)`
                      : `translateX(-${currentSlide * 50}%)`
                    : "translateX(0%)",
                transition:
                  clubData?.courtImage?.length > 4 && currentSlide !== 0
                    ? "transform 0.5s ease"
                    : "none",
              }}
            >
              {(clubData?.courtImage?.length > 4
                ? clubData?.courtImage?.concat(
                  clubData?.courtImage?.slice(0, 4)
                )
                : clubData?.courtImage
              )?.map((image, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 d-lg-block d-none"
                  style={{
                    width: clubData?.courtImage?.length > 4 ? "24%" : "22%",
                    padding: "0 6px",
                  }}
                >
                  <div
                    className="position-relative overflow-hidden rounded-3"
                    style={{
                      height: "400px",
                      width: "100%",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setPhotoIndex(index % clubData?.courtImage?.length);
                      setIsOpen(true);
                    }}
                  >
                    {!loadedImages[index] && (
                      <div className="image-loader youtube-style">
                        <div className="youtube-spinner"></div>
                      </div>
                    )}
                    <img
                      src={image}
                      alt={`Gallery ${(index % clubData?.courtImage?.length) + 1
                        }`}
                      className="w-100 h-100 object-fit-cover"
                      onLoad={() => handleImageLoad(index)}
                      onError={() => handleImageLoad(index)}
                      style={{
                        display: loadedImages[index] ? "block" : "none",
                        transition: "transform 0.3s ease",
                        imageRendering: "auto",
                        filter: "none",
                        objectPosition: "center",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.transform = "scale(1.05)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.transform = "scale(1)")
                      }
                    />
                  </div>
                </div>
              ))}

              {(clubData?.courtImage?.length > 4
                ? clubData?.courtImage?.concat(
                  clubData?.courtImage?.slice(0, 2)
                )
                : clubData?.courtImage
              )?.map((image, index) => (
                <div
                  key={`mobile-${index}`}
                  className="flex-shrink-0 d-lg-none d-block"
                  style={{ width: "calc(50% - 6px)" }}
                >
                  <div
                    className="position-relative overflow-hidden rounded-3"
                    style={{
                      height: "200px",
                      width: "100%",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setPhotoIndex(index % clubData?.courtImage?.length);
                      setIsOpen(true);
                    }}
                  >
                    {!loadedImages[index] && (
                      <div className="image-loader youtube-style">
                        <div className="youtube-spinner"></div>
                      </div>
                    )}
                    <img
                      src={image}
                      alt={`Gallery ${(index % clubData?.courtImage?.length) + 1
                        }`}
                      className="w-100 h-100 object-fit-cover"
                      onLoad={() => handleImageLoad(index)}
                      onError={() => handleImageLoad(index)}
                      style={{
                        display: loadedImages[index] ? "block" : "none",
                        transition: "transform 0.3s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.transform = "scale(1.05)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.transform = "scale(1)")
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {clubData?.courtImage?.length > 4 && (
            <>
              <button
                className="position-absolute top-50 start-0 translate-middle-y btn text-white rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: "30px",
                  height: "30px",
                  marginLeft: "10px",
                  zIndex: 10,
                  backgroundColor: "#011E84",
                }}
                onClick={() => {
                  if (window.innerWidth < 992) {
                    if (currentSlide === 0) {
                      setCurrentSlide(Math.ceil(clubData?.courtImage?.length / 2) - 1);
                    } else {
                      setCurrentSlide(currentSlide - 1);
                    }
                  } else {
                    if (currentSlide === 0) {
                      setCurrentSlide(clubData?.courtImage?.length - 1);
                    } else {
                      setCurrentSlide(currentSlide - 1);
                    }
                  }
                }}
              >
                <ArrowBackIosIcon style={{ fontSize: "16px" }} />
              </button>

              <button
                className="position-absolute top-50 end-0 translate-middle-y btn text-white rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: "30px",
                  height: "30px",
                  marginRight: "10px",
                  zIndex: 10,
                  backgroundColor: "#011E84",
                }}
                onClick={() => {
                  if (window.innerWidth < 992) {
                    if (currentSlide >= Math.ceil(clubData?.courtImage?.length / 2) - 1) {
                      setCurrentSlide(0);
                    } else {
                      setCurrentSlide(currentSlide + 1);
                    }
                  } else {
                    if (currentSlide >= clubData?.courtImage?.length - 1) {
                      setCurrentSlide(0);
                    } else {
                      setCurrentSlide(currentSlide + 1);
                    }
                  }
                }}
              >
                <ArrowForwardIosIcon style={{ fontSize: "16px" }} />
              </button>
            </>
          )}
        </div>

        {isOpen && galleryImages.length > 0 && (
          <>
            <Lightbox
              mainSrc={galleryImages[photoIndex]}
              nextSrc={galleryImages[(photoIndex + 1) % galleryImages.length]}
              prevSrc={
                galleryImages[
                (photoIndex + galleryImages.length - 1) % galleryImages.length
                ]
              }
              onCloseRequest={() => setIsOpen(false)}
              onMovePrevRequest={() =>
                setPhotoIndex(
                  (photoIndex + galleryImages.length - 1) % galleryImages.length
                )
              }
              onMoveNextRequest={() =>
                setPhotoIndex((photoIndex + 1) % galleryImages.length)
              }
              imagePadding={50}
              wrapperClassName="full-screen-lightbox"
              imageLoadErrorMessage="Image failed to load"
            />
            <button
              onClick={() => setIsOpen(false)}
              className="close-btn-on-image"
              style={{
                background: "rgba(0, 0, 0, 0.8)",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CloseIcon />
            </button>
          </>
        )}
        <style>{`
          .full-screen-lightbox .ril-image-current {
            max-width: 30vw !important;
            max-height: 30vh !important;
            object-fit: contain !important;
            margin: 0 auto !important;
            display: block !important;
            position: relative !important;
          }
          .full-screen-lightbox .ril-inner {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            position: relative !important;
            height: 100vh !important;
            width: 100vw !important;
          }
          .full-screen-lightbox .ril-image-current::after {
            content: "" !important;
            position: absolute !important;
            top: 0 !important;
            right: 0 !important;
            width: 50px !important;
            height: 50px !important;
            pointer-events: none !important;
          }
          .close-btn-on-image {
            position: absolute !important;
            top: 10% !important;
            right: 10% !important;
            transform: translateX(50%) translateY(-50%) !important;
            z-index: 10001 !important;
          }
        `}</style>
      </div>
      <div className="col-lg-4 p-0  mt-3 mt-lg-0 pe-lg-2 d-md-none d-block px-1">
        <div
          className="text-white  position-relative h-100"
          style={{
            background: "linear-gradient(180deg, #0034E4 0%, #001B76 100%)",
            border: "2px solid #eceaeaff",
            borderRadius: "20px",
            height: "auto",
          }}
        >
          <div className="pt-4 pb-4 px-3" style={{ padding: "2rem" }}>
            <button
              className="btn mb-0 rounded-pill text-white px-4 py-1"
              onClick={() => navigate("/open-matches")}
              style={{
                border: "3px solid #FFFFFF",
                fontSize: "14px",
                fontFamily: "Poppins",
                fontWeight: "500",
              }}
            >
              Open Matches
            </button>
            <div className="d-flex align-items-center justify-content-between">
              <div className="">
                <h4 className="home-upcoming-heading mt-2 mb-0">
                  Upcoming Open Matches
                </h4>
                <p
                  className="mb-0 custom-title text-white"
                  style={{ fontWeight: "400" }}
                >
                  Join open matches happening around you right now.
                </p>
              </div>

              <div className="text-start mb-0">
                <Link
                  to="/open-matches"
                  className="text-decoration-none bg-white rounded-pill px-2 py-1 custom-title d-inline-flex align-items-center"
                  style={{
                    color: "#2043BA",
                    fontWeight: "500",
                    fontSize: "21px",
                    minWidth: "94px",
                    justifyContent: "center",
                    fontFamily: "Poppins",
                  }}
                >
                  View all <FaArrowRight className="ms-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container my-md-5 mt-4 mb-0">
        {getReviewData?.reviews?.length > 0 && (
          <h4
            className="reviews-heading"
            style={{
              fontWeight: "500",
              fontFamily: "Poppins",
              fontSize: "34px",
              marginBottom: "25px",
              color: "#000000",
            }}
          >
            Here’s what our previous players <br /> have to say!
          </h4>
        )}
        <div className="position-relative  ">
          <div className="overflow-hidden ">
            <div
              className="d-flex"
              style={{
                transform:
                  window.innerWidth >= 992
                    ? `translateX(-${reviewSlide * 33.333}%)`
                    : `translateX(-${reviewSlide * 100}%)`,
                transition:
                  reviewSlide === 0 &&
                    reviewSlide !== getReviewData?.reviews?.length
                    ? "none"
                    : "transform 0.5s ease",
              }}
            >
              {getReviewData?.reviews
                ?.concat(getReviewData?.reviews?.slice(0, 3))
                ?.map((review, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0  d-lg-block d-none"
                    style={{ width: "33.333%" }}
                  >
                    <ReviewCard review={review} />
                  </div>
                ))}
              {getReviewData?.reviews
                ?.concat(getReviewData?.reviews?.slice(0, 1))
                ?.map((review, index) => (
                  <div
                    key={`mobile-${index}`}
                    className="flex-shrink-0 d-lg-none d-block"
                    style={{ width: "100%" }}
                  >
                    <ReviewCard review={review} />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="my-md-5 my-4">
              <h4
                className="font_heading_address"
                style={{
                  fontWeight: "600",
                  fontFamily: "Poppins",
                  fontSize: "34px",
                  color: "#1C1B1F",
                }}
              >
                Address
              </h4>
              <p
                className="address_data"
                style={{
                  fontSize: "16px",
                  fontWeight: 500,
                  textDecoration: "underline",
                  fontFamily: "Poppins",
                  color: "#374151",
                }}
              >
                {clubData?.clubName}
                {clubData?.address ||
                  clubData?.city ||
                  clubData?.state ||
                  clubData?.zipCode
                  ? ", "
                  : ""}
                {[
                  clubData?.address,
                  clubData?.city,
                  clubData?.state,
                  clubData?.zipCode,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              <div className="ratio ratio-16x9 rounded-4 overflow-hidden mt-4">
                <iframe
                  src={mapSrc}
                  width="600"
                  height="450"
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="The Court Line Club Map"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
