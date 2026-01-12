import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  home_banner,
  bannerimg,
} from "../../../assets/files";
import StarIcon from "@mui/icons-material/Star";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { FaArrowRight } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getReviewClub, getUserClub, getMapData } from "../../../redux/user/club/thunk";
import { getUserProfile, updateUser } from "../../../redux/user/auth/authThunk";
import { ReviewCard } from "./ReviewCard";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { showSuccess, showError } from "../../../helpers/Toast";
import { getUserFromSession } from "../../../helpers/api/apiCore";

const Home = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [reviewSlide, setReviewSlide] = useState(0);
  const [loadedImages, setLoadedImages] = useState({});
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [locationRequested, setLocationRequested] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const store = useSelector((state) => state);
  const clubData = store?.userClub?.clubData?.data?.courts[0] || [];
  const clubDataLoading = store?.userClub?.clubLoading || [];
  const User = useSelector((state) => state?.userAuth);
  const getReviewData = store?.userClub?.getReviewData?.data;
  const mapApiData = store?.userClub?.mapData?.data;
  const logo = clubData?.logo;
  const userFromSession = getUserFromSession();

  // Add fake reviews to make it look better
  const fakeReviews = [
    {
      _id: 'fake1',
      reviewRating: 3.5,
      reviewComment: 'Amazing facilities and great atmosphere! The courts are well-maintained and the staff is very professional Amazing facilities and great atmosphere! The courts are well-maintained and the staff is very professional.',
      userId: { name: 'Rajesh Kumar' },
      register_club_id: clubData?._id || '692f4431e3230ac71d22bdd1',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'fake2',
      reviewRating: 4,
      reviewComment: 'Excellent padel experience! Clean courts, good lighting, and convenient booking system. Highly recommended.',
      userId: { name: 'Priya Sharma' },
      register_club_id: clubData?._id || '692f4431e3230ac71d22bdd1',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'fake3',
      reviewRating: 5,
      reviewComment: 'Best padel club in the area! Great community, top-notch facilities, and reasonable pricing. Will definitely come back.',
      userId: { name: 'Amit Patel' },
      register_club_id: clubData?._id || '692f4431e3230ac71d22bdd1',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'fake4',
      reviewRating: 5,
      reviewComment: 'Outstanding service and quality courts. The booking process is smooth and the staff is always helpful.',
      userId: { name: 'Sneha Gupta' },
      register_club_id: clubData?._id || '692f4431e3230ac71d22bdd1',
      createdAt: new Date().toISOString()
    }
  ];

  // Combine real reviews with fake ones
  const allReviews = [...(getReviewData?.reviews || []), ...fakeReviews];
  const enhancedReviewData = {
    ...getReviewData,
    reviews: allReviews,
    totalReviews: allReviews?.length,
    averageRating: getReviewData?.averageRating || 0
  };

  const handleImageLoad = useCallback((index) => {
    setLoadedImages((prev) => ({ ...prev, [index]: true }));
  }, []);

  const defaultMapSrc =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.1422937950147!2d-73.98731968482413!3d40.75889497932681!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c6480299%3A0x55194ec5a1ae072e!2sTimes+Square!5e0!3m2!1sen!2sus!4v1510579767645";

  // Convert address to embeddable Google Maps URL
  const createEmbedUrl = useCallback((address) => {
    const encodedAddress = encodeURIComponent(address);
    return `https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }, []);

  const mapSrc = useMemo(() =>
    mapApiData?.address ? createEmbedUrl(mapApiData?.address) : defaultMapSrc,
    [mapApiData?.address, createEmbedUrl]
  );

  const adjustedIndex = useMemo(() => {
    const todayIndex = new Date().getDay();
    return todayIndex === 0 ? 6 : todayIndex - 1;
  }, []);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Location detection for first-time users
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      showError('Geolocation is not supported by this browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();
          const city = data?.city || data?.locality || data?.principalSubdivision || 'Unknown';
          
          const payload = new FormData();
          payload.append('city', city);
          
          dispatch(updateUser(payload))
            .then((res) => {
              if (res?.payload?.status === '200') {
                showSuccess(`Location updated to ${city}`);
                dispatch(getUserProfile());
                localStorage.setItem('locationDetected', 'true');
              }
            })
            .catch(() => {
              showError('Failed to update location');
            });
        } catch (error) {
          showError('Failed to detect location');
        }
      },
      (error) => {
        localStorage.setItem('locationDetected', 'declined');
        switch (error.code) {
          case error.PERMISSION_DENIED:
            showError('Location access denied by user');
            break;
          case error.POSITION_UNAVAILABLE:
            showError('Location information is unavailable');
            break;
          case error.TIMEOUT:
            showError('Location request timed out');
            break;
          default:
            showError('An unknown error occurred while retrieving location');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, [dispatch]);

  // Check if user needs location detection - only show manual option
  useEffect(() => {
    const isLocationDetected = localStorage.getItem('locationDetected');
    const hasUserCity = User?.user?.response?.city || userFromSession?.city;
    
    // Only set the flag, don't automatically request location
    if (User?.user?.token && !hasUserCity && !isLocationDetected && !locationRequested) {
      setLocationRequested(true);
    }
  }, [User?.user?.token, User?.user?.response?.city, userFromSession?.city, locationRequested]);

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
    }
  }, [clubData]);

  const width = 370;
  const height = 70;
  const circleRadius = height * 0.3;
  const curvedSectionStart = width * 0.76;
  const curvedSectionEnd = width * 0.996;
  const circleX = curvedSectionStart + (curvedSectionEnd - curvedSectionStart) * 0.7 + 1;
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
    const id = clubData?._id || "";
    if (id) {
      dispatch(getReviewClub(id));
    }
  }, [clubData?._id]);

  // Fetch map data when club address is available
  useEffect(() => {
    if (clubData?.address && clubData?.city) {
      const fullAddress = `${clubData?.address}, ${clubData?.city}`;
      dispatch(getMapData(fullAddress));
    }
  }, [clubData?.address, clubData?.city]);

  // Auto-play carousel
  useEffect(() => {
    if (clubData?.courtImage?.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => prev + 1);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [clubData?.courtImage?.length]);

  // Handle seamless loop reset
  useEffect(() => {
    const imagesLength = clubData?.courtImage?.length || 0;
    if (windowWidth >= 992 && currentSlide >= imagesLength && imagesLength > 4) {
      setTimeout(() => setCurrentSlide(0), 500);
    } else if (windowWidth < 992 && currentSlide >= imagesLength && imagesLength > 1) {
      setTimeout(() => setCurrentSlide(0), 500);
    }
  }, [currentSlide, clubData?.courtImage?.length, windowWidth]);

  // Auto-play review carousel
  useEffect(() => {
    if (enhancedReviewData?.reviews?.length > 1) {
      const interval = setInterval(() => {
        setReviewSlide((prev) => prev + 1);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [enhancedReviewData?.reviews?.length]);

  // Handle seamless loop reset
  useEffect(() => {
    const reviewsLength = enhancedReviewData?.reviews?.length || 0;
    if (windowWidth >= 992 && reviewSlide >= reviewsLength && reviewsLength > 3) {
      setTimeout(() => setReviewSlide(0), 500);
    } else if (windowWidth < 992 && reviewSlide >= reviewsLength && reviewsLength > 1) {
      setTimeout(() => setReviewSlide(0), 500);
    }
  }, [reviewSlide, enhancedReviewData?.reviews?.length, windowWidth]);

  return (
    <>
      <div className="container px-0 mt-md-4 mt-0">
        <div className="row g-4 px-1 px-md-0 mx-auto">
          {/* Hero Section */}
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
                  className="text-decoration-none rounded-pill px-4 py-2 custom-title d-inline-flex align-items-center book-now-btn d-md-flex d-none"
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
                <style >{`
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
        <div className="row position-relative align-items-stretch px-0 px-md-0 mx-auto">
          {clubDataLoading === true ? (<>
            <div className="col-lg-8 col-12 d-md-flex d-block px-0 ps-md-0">
              <div
                className="row mx-0 ms-lg-0 me-lg-2 pe-lg-3 bg-white p-lg-2 flex-fill"
                style={{ border: "0.3px solid #e0e0e0", borderRadius: "20px" }}
              >
                <div className="col-lg-8 col-12">
                  <div className="mb-4 pt-3 d-md-flex d-none align-items-center gap-3">
                    <div className="shimmer" style={{ width: 50, height: 50, borderRadius: "50%" }} />
                    <div>
                      <div className="shimmer mb-2" style={{ width: 200, height: 24, borderRadius: 8 }} />
                      <div className="d-flex align-items-center gap-2">
                        <div className="shimmer" style={{ width: 120, height: 20, borderRadius: 6 }} />
                      </div>
                    </div>
                  </div>

                  {/* Mobile Header */}
                  <div className="d-flex d-md-none align-items-center bg-dark text-white px-3 py-2 mb-3" style={{ borderRadius: "50px 38px 38px 50px", gap: "12px" }}>
                    <div className="shimmer" style={{ width: 50, height: 50, borderRadius: "50%" }} />
                    <div>
                      <div className="shimmer mb-2" style={{ width: 140, height: 18, borderRadius: 6 }} />
                      <div className="shimmer" style={{ width: 100, height: 16, borderRadius: 6 }} />
                    </div>
                  </div>

                  {/* Description Area */}
                  <div className="pe-lg-5">
                    <div className="mb-3">
                      <div className="shimmer mb-2" style={{ width: "100%", height: 16, borderRadius: 6 }} />
                      <div className="shimmer mb-2" style={{ width: "95%", height: 16, borderRadius: 6 }} />
                      <div className="shimmer mb-2" style={{ width: "98%", height: 16, borderRadius: 6 }} />
                      <div className="shimmer mb-2" style={{ width: "80%", height: 16, borderRadius: 6 }} />
                      <div className="shimmer mb-2" style={{ width: "90%", height: 16, borderRadius: 6 }} />
                      <div className="shimmer" style={{ width: "70%", height: 16, borderRadius: 6 }} />
                    </div>
                  </div>
                </div>

                <div className="col-lg-4 col-12 ps-md-3">
                  <div className="pt-md-4 pt-2">
                    <div className="shimmer mb-4" style={{ width: 160, height: 20, borderRadius: 8, margin: "0 auto" }} />

                    {[...Array(7)].map((_, i) => (
                      <div key={i} className="d-flex justify-content-between mb-3">
                        <div className="shimmer" style={{ width: 80, height: 18, borderRadius: 6 }} />
                        <div className="shimmer" style={{ width: 120, height: 18, borderRadius: 6 }} />
                      </div>
                    ))}

                    <div className="shimmer mt-4" style={{ width: 180, height: 14, borderRadius: 6, margin: "0 auto" }} />
                  </div>
                </div>
              </div>
            </div>
          </>) : (<>
            <div className="col-lg-8 col-12  d-md-flex d-block px-0 ps-md-0">
              <div
                className=" row mx-0 ms-lg-0 me-lg-2  pe-lg-3 bg-white  p-lg-2 flex-fill"
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
                  <div className="mb-md-4 mb-2 pt-md-1 pt-3   d-md-flex d-none flex-column flex-lg-row align-items-start align-lg-center justify-content-start gap-md-3 gap-1">
                    <div className="mb-2 mt-lg-4 mb-lg-0 flex-shrink-0">
                      {/* <Avatar>
                      {clubData?.clubName
                        ? clubData.clubName.charAt(0).toUpperCase()
                        : "User"}
                    </Avatar> */}
                      <div className="logo_add_star bg-white rounded-circle  py-1" style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#f9f9f9",
                        borderBottomRightRadius: "38px", borderTopRightRadius: "38px"
                      }}>
                        <img
                          src={logo}
                          alt="Swoot"
                          style={{
                            width: "100%",
                            height: "auto",
                            objectFit: "cover",
                            objectPosition: "center"
                          }}
                        />
                      </div>
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
                        {clubData?.clubName || "The SwootClub"}
                      </h5>
                      <div className="d-flex align-items-center justify-content-start text-nowrap">
                        <p className="text-success mb-0">
                          {[...Array(5)].map((_, i) => {
                            const rating = enhancedReviewData?.averageRating || "";
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
                          {enhancedReviewData?.averageRating || ""}
                        </p>
                      </div>
                    </div>

                  </div>
                  <div
                    className="d-flex d-md-none align-items-center bg-black text-white px-3 py-0 ps-0 mb-2 mt-3"
                    style={{ width: "fit-content", gap: "12px", borderRadius: "50px 38px 38px 50px" }}
                  >
                    <div className='ogo_add_star border-0 rounded-circle p-1'
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#f9f9f9",
                      }}
                    >
                      <img
                        src={logo}
                        alt="Swoot"
                        style={{
                          width: "100%",
                          height: "auto",
                          objectFit: "cover",
                          objectPosition: "center"
                        }}
                      />
                    </div>

                    {/* Club Name + Green Stars */}
                    <div className="d-flex flex-column" style={{ lineHeight: "1.2" }}>
                      <span style={{ fontSize: "14px", fontWeight: 600, }}>
                        {clubData?.clubName || "Swoot"}
                      </span>

                      <div className="d-flex align-items-center" style={{ marginTop: "2px" }}>
                        {[...Array(5)].map((_, i) => {
                          const rating = enhancedReviewData?.averageRating || "";
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
                        <span style={{ fontSize: "13px" }} className="ms-3">{enhancedReviewData?.averageRating || ""}</span>
                      </div>
                    </div>

                    {/* Rating */}

                  </div>


                  <div className="flex-grow-1 pe-lg-5 custom-scroll-dec">
                    {/* <h4 style={{ fontWeight: "600", fontFamily: "Poppins", fontSize: "24px" }}>About</h4> */}
                    <div
                      className="mb-2 mb-md-3 add_font_small_mobile"
                      style={{
                        fontSize: "13px",
                        fontFamily: "Poppins",
                        fontWeight: "400",
                        textAlign: "justify"
                      }}
                    >
                      <span>{clubData?.clubName || "The Swoot Club"} </span>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ ...props }) => <h1 style={{ fontSize: 20, fontWeight: 700 }} {...props} />,
                          h2: ({ ...props }) => <h2 style={{ fontSize: 18, fontWeight: 600 }} {...props} />,
                          h3: ({ ...props }) => <h3 style={{ fontSize: 16, fontWeight: 600 }} {...props} />,
                          p: ({ ...props }) => <p style={{ fontSize: 14, marginBottom: 6 }} {...props} />,
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
                    </div>
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
                    https://chat.whatsapp.com/DqKAR0MiI5i8dP2Wqe0srt
                  </a>
                  <p className="mt-md-4 mt-2 add_font_small_mobile">
                    <a href="">
                      https://maps.app.goo.gl/hLmCundx4GsjbaiB7?g_st=ic
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
          </>)}
          <div className="row p-2 mt-3 add_shadow_rounded mx-auto d-block d-md-none">
            <div className="d-flex justify-content-center align-items-center px-0 ">
              <button
                style={{
                  ...buttonStyle,
                }}
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
                    className="book-now-arrow"
                    style={{
                      transformOrigin: `${arrowX}px ${arrowY}px`,
                      transition: "transform 0.3s ease"
                    }}
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

          {/* Right Column: Upcoming Matches */}
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

      {/* Photos Gallery Section */}
      <div className="mt-md-5 mb-md-5 my-4 px-2 px-md-5">
        <div className="position-relative">
          <div className="overflow-hidden rounded-3">
            <div
              className={`d-flex align-items-center ${windowWidth >= 992 ? "gap-4" : ""}`}
              style={{
                transform:
                  windowWidth >= 992
                    ? clubData?.courtImage?.length > 4
                      ? `translateX(-${currentSlide * 25}%)`
                      : "translateX(0%)"
                    : clubData?.courtImage?.length > 1
                      ? `translateX(-${currentSlide * 100}%)`
                      : "translateX(0%)",
                transition:
                  (windowWidth >= 992 && currentSlide === clubData?.courtImage?.length) ||
                    (windowWidth < 992 && currentSlide === clubData?.courtImage?.length)
                    ? "none"
                    : "transform 0.5s ease",
                justifyContent:
                  windowWidth >= 992 && clubData?.courtImage?.length <= 4
                    ? "center"
                    : "flex-start",
              }}
            >
              {/* Desktop Images */}
              {(clubData?.courtImage?.length > 4
                ? [...clubData?.courtImage, ...clubData?.courtImage?.slice(0, 4)]
                : clubData?.courtImage
              )?.map((image, index) => (
                <div
                  key={`desktop-${index}`}
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
                      alt={`Gallery ${(index % clubData?.courtImage?.length) + 1}`}
                      className="w-100 h-100 object-fit-cover"
                      onLoad={() => handleImageLoad(index)}
                      onError={() => handleImageLoad(index)}
                      style={{
                        display: loadedImages[index] ? "block" : "none",
                        transition: "transform 0.3s ease",
                      }}
                      onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
                      onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                    />
                  </div>
                </div>
              ))}

              {/* Mobile Images */}
              {(clubData?.courtImage?.length > 1
                ? [...clubData?.courtImage, clubData?.courtImage[0]]
                : clubData?.courtImage
              )?.map((image, index) => (
                <div
                  key={`mobile-${index}`}
                  className="flex-shrink-0 d-lg-none d-block"
                  style={{ width: "100%", minWidth: "100%" }}
                >
                  <div
                    className="position-relative overflow-hidden rounded-3 mx-auto"
                    style={{
                      height: "200px",
                      width: "98%",
                      maxWidth: "350px",
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
                      alt={`Gallery ${(index % clubData?.courtImage?.length) + 1}`}
                      className="w-100 h-100 object-fit-cover"
                      onLoad={() => handleImageLoad(index)}
                      onError={() => handleImageLoad(index)}
                      style={{
                        display: loadedImages[index] ? "block" : "none",
                        transition: "transform 0.3s ease",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DESKTOP BUTTONS (LEFT / RIGHT MIDDLE) */}
          {windowWidth >= 992 && clubData?.courtImage?.length > 4 && (
            <>
              <button
                className="position-absolute top-50 start-0 translate-middle-y btn text-white rounded-circle d-none d-lg-flex align-items-center justify-content-center"
                style={{
                  width: "30px",
                  height: "30px",
                  marginLeft: "-35px",
                  zIndex: 10,
                  backgroundColor: "#011E84",
                }}
                onClick={() => currentSlide > 0 && setCurrentSlide(currentSlide - 1)}
              >
                <ArrowBackIosIcon style={{ fontSize: "20px", paddingLeft: "5px" }} />
              </button>

              <button
                className="position-absolute top-50 end-0 translate-middle-y btn text-white rounded-circle d-none d-lg-flex align-items-center justify-content-center"
                style={{
                  width: "30px",
                  height: "30px",
                  marginRight: "-35px",
                  zIndex: 10,
                  backgroundColor: "#011E84",
                }}
                onClick={() => setCurrentSlide(currentSlide + 1)}
              >
                <ArrowForwardIosIcon style={{ fontSize: "18px", paddingLeft: "3px" }} />
              </button>
            </>
          )}

          {/* MOBILE BUTTONS (BOTTOM CENTER) */}
          {windowWidth < 992 && clubData?.courtImage?.length > 1 && (
            <div className="d-flex justify-content-center gap-3 mt-2 d-lg-none">

              <button
                className="btn text-white rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: "35px",
                  height: "35px",
                  backgroundColor: "#011E84",
                }}
                onClick={() => {
                  if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
                }}
              >
                <ArrowBackIosIcon style={{ fontSize: "18px", paddingLeft: "4px" }} />
              </button>

              <button
                className="btn text-white rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: "35px",
                  height: "35px",
                  backgroundColor: "#011E84",
                }}
                onClick={() => {
                  if (currentSlide >= clubData?.courtImage?.length - 1)
                    setCurrentSlide(0);
                  else setCurrentSlide(currentSlide + 1);
                }}
              >
                <ArrowForwardIosIcon style={{ fontSize: "18px", paddingLeft: "3px" }} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="col-lg-4 p-0  mt-3 mt-lg-0 pe-lg-2 d-md-none d-block px-2">
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
      {/* Reviews Section */}
      <div className="container my-md-5 mt-4 mb-0">
        {enhancedReviewData?.reviews?.length > 0 && (
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

        <div className="position-relative">
          <div className="overflow-hidden">
            <div
              className="d-flex"
              style={{
                transform:
                  windowWidth >= 992
                    ? `translateX(-${reviewSlide * 33.333}%)`
                    : `translateX(-${reviewSlide * 100}%)`,
                transition:
                  (windowWidth >= 992 && reviewSlide === enhancedReviewData?.reviews?.length) ||
                    (windowWidth < 992 && reviewSlide === enhancedReviewData?.reviews?.length)
                    ? "none"
                    : "transform 0.5s ease",
              }}
            >
              {windowWidth >= 992
                ? (enhancedReviewData?.reviews?.length > 3
                  ? [...enhancedReviewData?.reviews, ...enhancedReviewData?.reviews?.slice(0, 3)]
                  : enhancedReviewData?.reviews
                )?.map((review, index) => (
                  <div
                    key={`${review?._id}-${index}`}
                    className="flex-shrink-0 d-lg-block d-none"
                    style={{ width: "33.333%" }}
                  >
                    <ReviewCard review={review} />
                  </div>
                ))
                : (enhancedReviewData?.reviews?.length > 1
                  ? [...enhancedReviewData?.reviews, enhancedReviewData?.reviews[0]]
                  : enhancedReviewData?.reviews
                )?.map((review, index) => (
                  <div
                    key={`mobile-${review._id}-${index}`}
                    className="flex-shrink-0 d-lg-none d-block"
                    style={{ width: "100%" }}
                  >
                    <ReviewCard review={review} />
                  </div>
                ))}
            </div>
          </div>

          {/* DESKTOP BUTTONS (LEFT/RIGHT MIDDLE) */}
          {(windowWidth >= 992 &&
            enhancedReviewData?.reviews?.length > 3) && (
              <>
                <button
                  className="position-absolute top-50 start-0 translate-middle-y btn text-white rounded-circle 
                     d-none d-lg-flex align-items-center justify-content-center"
                  style={{
                    width: "30px",
                    height: "30px",
                    marginLeft: "-35px",
                    zIndex: 10,
                    backgroundColor: "#011E84",
                  }}
                  onClick={() => {
                    if (reviewSlide === 0) {
                      setReviewSlide(enhancedReviewData?.reviews?.length - 1);
                    } else {
                      setReviewSlide(reviewSlide - 1);
                    }
                  }}
                >
                  <ArrowBackIosIcon style={{ fontSize: "20px", paddingLeft: "5px" }} />
                </button>

                <button
                  className="position-absolute top-50 end-0 translate-middle-y btn text-white rounded-circle 
                     d-none d-lg-flex align-items-center justify-content-center"
                  style={{
                    width: "30px",
                    height: "30px",
                    marginRight: "-35px",
                    zIndex: 10,
                    backgroundColor: "#011E84",
                  }}
                  onClick={() => {
                    if (reviewSlide >= enhancedReviewData?.reviews?.length - 1) {
                      setReviewSlide(0);
                    } else {
                      setReviewSlide(reviewSlide + 1);
                    }
                  }}
                >
                  <ArrowForwardIosIcon
                    style={{ fontSize: "18px", paddingLeft: "3px" }}
                  />
                </button>
              </>
            )}

          {/* MOBILE BUTTONS (BOTTOM CENTER) */}
          {windowWidth < 992 &&
            enhancedReviewData?.reviews?.length > 1 && (
              <div className="d-flex justify-content-center gap-3 mt-2 d-lg-none">

                <button
                  className="btn text-white rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "35px",
                    height: "35px",
                    backgroundColor: "#011E84",
                  }}
                  onClick={() => {
                    if (reviewSlide === 0) {
                      setReviewSlide(enhancedReviewData?.reviews?.length - 1);
                    } else {
                      setReviewSlide(reviewSlide - 1);
                    }
                  }}
                >
                  <ArrowBackIosIcon
                    style={{ fontSize: "18px", paddingLeft: "4px" }}
                  />
                </button>

                <button
                  className="btn text-white rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "35px",
                    height: "35px",
                    backgroundColor: "#011E84",
                  }}
                  onClick={() => {
                    if (
                      reviewSlide >=
                      enhancedReviewData?.reviews?.length - 1
                    ) {
                      setReviewSlide(0);
                    } else {
                      setReviewSlide(reviewSlide + 1);
                    }
                  }}
                >
                  <ArrowForwardIosIcon
                    style={{ fontSize: "18px", paddingLeft: "4px" }}
                  />
                </button>

              </div>
            )}
        </div>
      </div>


      {/* Map Section */}
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="mb-md-5 mt-0 my-4">
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
              <div
                className="ratio ratio-16x9 rounded-4 overflow-hidden mt-4"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  const address = mapApiData?.address || `${clubData?.address}, ${clubData?.city}`;
                  window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, "_blank");
                }}
              >
                <iframe
                  src={mapSrc}
                  width="600"
                  height="450"
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="The Swoot Club Map"
                  style={{ pointerEvents: "none" }}
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
