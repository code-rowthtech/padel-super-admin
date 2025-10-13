import React, { useEffect, useState } from 'react';
import { twoball, taness, line, home_banner, football, cricket, tennis2, batmintain, swiming } from '../../../assets/files';
import DirectionsIcon from '@mui/icons-material/Directions';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import PhoneIcon from '@mui/icons-material/Phone';
import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { FaArrowRight } from "react-icons/fa";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";
import { Link, useNavigate } from 'react-router-dom';
import 'animate.css';
import { useDispatch, useSelector } from 'react-redux';
import { addReviewClub, getReviewClub, getUserClub } from '../../../redux/user/club/thunk';
import { Avatar } from '@mui/material';
import { getLogo } from '../../../redux/user/auth/authThunk';
import { MdWatchLater } from "react-icons/md";
import { PiImagesSquareFill } from "react-icons/pi";
import { ReviewCard } from './ReviewCard';



const Home = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [photoIndex, setPhotoIndex] = useState(0);
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(null);
    const [message, setMessage] = useState("");
    const [currentSlide, setCurrentSlide] = useState(0);
    const [reviewSlide, setReviewSlide] = useState(0);
    const [selectedSport, setSelectedSport] = useState(0);
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const store = useSelector((state) => state)

    const clubData = store?.userClub?.clubData?.data?.courts[0] || []
    const addReviewLoading = store?.userClub?.reviewLoading
    const getReviewData = store?.userClub?.getReviewData?.data
    const galleryImages = clubData?.courtImage?.slice(0, 10) || [];
    const [loadedImages, setLoadedImages] = useState({});
    const handleImageLoad = (index) => {
        setLoadedImages((prev) => ({ ...prev, [index]: true }));
    };
    console.log({ getReviewData })
    const mapSrc =
        'https://www.google.com/maps/embed?pb=...'; // your map iframe src\

    const todayIndex = new Date().getDay(); // JS: Sunday = 0, Monday = 1, ...
    const adjustedIndex = todayIndex === 0 ? 6 : todayIndex - 1;

    useEffect(() => {
        dispatch(getUserClub({ search: "" }))
    }, [])

    useEffect(() => {
        if (clubData && clubData._id) {
            localStorage.setItem("register_club_id", clubData?._id);
            localStorage.setItem("owner_id", clubData?.ownerId);
            dispatch(getLogo(clubData?.ownerId))
        }
    }, [clubData]);

    const handleClick = (value) => {
        setRating(value);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };


    const handleSubmit = () => {
        const payload = {
            reviewComment: message,
            reviewRating: rating,
            register_club_id: clubData._id
        }
        dispatch(addReviewClub(payload)).unwrap().then(() => {
            setRating(0);
            setMessage('');
            dispatch(getReviewClub(clubData._id))

        })
    };

    const getRatingLabel = (rating) => {
        if (rating >= 4.5) return "Excellent";
        if (rating >= 3.5) return "Very Good";
        if (rating >= 2.5) return "Good";
        if (rating >= 1.5) return "Average";
        if (rating >= 0.5) return "Poor";
        return "Not Rated";
    };

    useEffect(() => {
        const id = clubData._id || '';
        if (id) {
            dispatch(getReviewClub(id));
        }
    }, [clubData?._id]);

    // Auto-play carousel
    useEffect(() => {
        if (clubData?.courtImage?.length > 3) {
            const interval = setInterval(() => {
                setCurrentSlide(prev => {
                    if (prev >= clubData.courtImage.length) {
                        return 1;
                    }
                    return prev + 1;
                });
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [clubData?.courtImage?.length]);

    // Handle seamless loop reset
    useEffect(() => {
        if (currentSlide === clubData?.courtImage?.length && clubData?.courtImage?.length > 3) {
            const timer = setTimeout(() => {
                setCurrentSlide(0);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [currentSlide, clubData?.courtImage?.length]);

    // Auto-play review carousel
    useEffect(() => {
        if (getReviewData?.reviews?.length > 3) {
            const interval = setInterval(() => {
                setReviewSlide(prev => {
                    if (prev >= getReviewData.reviews.length) {
                        return 1;
                    }
                    return prev + 1;
                });
            }, 4000);
            return () => clearInterval(interval);
        }
    }, [getReviewData?.reviews?.length]);

    // Handle seamless review loop reset
    useEffect(() => {
        if (reviewSlide === getReviewData?.reviews?.length && getReviewData?.reviews?.length > 3) {
            const timer = setTimeout(() => {
                setReviewSlide(0);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [reviewSlide, getReviewData?.reviews?.length]);

    const padelimg = [
        { img: football },
        { img: cricket },
        { img: swiming },
        { img: batmintain },
        { img: tennis2 },
    ]


    return (
        <>
            <div className="container px-0">
                <div className="row g-4">
                    {/* Hero Section */}
                    <div className="col-12 ps-md-0">
                        <div className="image-zoom-container position-relative overflow-hidden rounded-3" style={{ height: '100%' }}>
                            <img src={home_banner} alt="Paddle" className="img-fluid w-100 h-100 object-fit-cover rounded-3" />
                            <div
                                className="position-absolute start-0 w-100 h-100 d-flex flex-column justify-content-center text-white p-5  pb-2 pt-0"
                                style={{
                                    background: 'linear-gradient(269.34deg, rgba(255, 255, 255, 0) 0.57%, rgba(17, 24, 39, 0.5) 94.62%)',
                                    backgroundBlendMode: 'multiply',
                                    top: "-10%"
                                }}
                            >
                                <p className='mb-0 custom-title text-white' style={{ fontWeight: "400" }}>Welcome To Good Court</p>
                                <h1 className="home-main-heading ">Your Game, <br />Your Court,<br />Just a Tap Away.</h1>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container  p-0 rounded-3" style={{ backgroundColor: "#F5F5F569", marginTop: "-130px" }}>
                <div className="row position-relative align-items-stretch">

                    {/* Left Column: Club Name, About, Address, and Timings */}
                    <div className="col-lg-8  d-flex">
                        <div className=" row  me-2  pe-3 bg-white  p-2 flex-fill"
                            style={{ border: "0.3px solid #858080ff", borderRadius: "20px", }}
                        >
                            <div className='col-lg-8 ' style={{
                                borderRight: "3px solid transparent",
                                borderImage: "linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #a8b3d6ff 46.63%, rgba(255, 255, 255, 0) 94.23%)",
                                borderImageSlice: 1,
                            }}>
                                <div className="mb-4 pt-1   d-flex flex-column flex-lg-row align-items-start align-lg-center justify-content-start gap-3">
                                    <div className='mb-2 mt-lg-4 mb-lg-0 flex-shrink-0'>
                                        <Avatar>
                                            {clubData?.clubName ? clubData.clubName.charAt(0).toUpperCase() : "C"}
                                        </Avatar>
                                    </div>
                                    <div className="flex-shrink-0 mt-lg-3">
                                        <h5 className="mb-0 mt-lg-2" style={{ fontSize: '17px', fontWeight: "600", fontFamily: "Poppins" }}>{clubData?.clubName || "The Good Club"}</h5>
                                        <div className="d-flex align-items-center justify-content-start text-nowrap">
                                            <p className="text-success mb-0">
                                                {[...Array(5)].map((_, i) => {
                                                    const rating = getReviewData?.averageRating || 4.5;
                                                    if (i < Math.floor(rating)) {
                                                        return <StarIcon key={i} style={{ color: "#32B768" }} />;
                                                    } else if (i < rating && rating % 1 >= 0.5) {
                                                        return <StarHalfIcon key={i} style={{ color: "#32B768" }} />;
                                                    } else {
                                                        return <StarBorderIcon key={i} style={{ color: "#ccc" }} />;
                                                    }
                                                })}
                                            </p>
                                            <p className="ms-2 pt-1 mb-0" style={{ fontSize: '17.5px', color: '#374151', fontWeight: "500", fontFamily: "Poppins" }}>
                                                {getReviewData?.averageRating || 4.5}
                                            </p>
                                        </div>
                                    </div>
                                    <div
                                        className="border rounded-4 ms-lg-5 me-1 p-2 px-3 py-3 mt-0 sport-box d-inline-block"
                                        style={{
                                            borderColor: "#e5e7eb",
                                            backgroundColor: "#fff",
                                            
                                        }}
                                    >
                                        <p
                                            className="mb-1"
                                            style={{
                                                fontSize: "13px",
                                                fontWeight: "500",
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
                                                        backgroundColor: selectedSport === idx ? "#e5e7eb" : "transparent",
                                                        transition: "0.2s",
                                                        cursor: "pointer",
                                                        width: "45px",
                                                        height:"38px"
                                                    }}
                                                    onClick={() => setSelectedSport(idx)}
                                                >
                                                    <img
                                                        src={img.img}
                                                        alt=""
                                                        style={{
                                                            width: "38px",
                                                            height: "38px",
                                                            objectFit: "contain",
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </div>

                                <div className="flex-grow-1 pe-lg-5">
                                    <h4 style={{ fontWeight: "600", fontFamily: "Poppins", fontSize: "24px" }}>About</h4>
                                    <p className='' style={{ fontSize: "13px", fontFamily: "Poppins", fontWeight: "400" }}>
                                        {clubData?.clubName || "The Good Club"}{clubData?.description}
                                    </p>
                                    <p style={{ fontSize: "13px", fontFamily: "Poppins", fontWeight: "400", margin: "0px" }}>Join the Padel community group on WhatsApp</p>
                                    <a href="">https://chat.whatsapp.com/DqKAR0MiI5i8dP2Wqe0srt</a>
                                    <p className='mt-4'><a href="">https://maps.app.goo.gl/hLmCundx4GsjbaiB7?g_st=ic</a></p>
                                </div>
                            </div>

                            <div className=" col-lg-4 ps-lg-5">
                                <div className="pt-4">
                                    <div className="d-flex justify-content-center mb-4">
                                        <strong className='me-2 open-now-time' style={{ fontWeight: "600" }}>
                                            <MdWatchLater size={20} /> Open Now 6:00 AM - 11:00 PM
                                        </strong>
                                    </div>
                                    {clubData?.businessHours?.map((day, idx) => (
                                        <div
                                            key={idx}
                                            className={`d-flex justify-content-between open-now-time mb-3`}
                                            style={{ fontWeight: idx === adjustedIndex ? "600" : '400' }}
                                        >
                                            <span>{day?.day}</span>
                                            <span>{day?.time || (idx === 2 ? "6:00 AM - 11:00 PM" : "6:00 AM - 10:00 PM")}</span>
                                        </div>
                                    ))}
                                    <p className="mt-3 mb-0 text-center" style={{ fontWeight: "500",fontSize:"13px" ,fontFamily:"Poppins"}}>Time zone (India Standard Time)</p>
                                    <div className='text-center mb-3'>
                                        <Link to="/booking" state={{ clubData }} className="court-book-link animate__animated animate__fadeInUp" style={{fontSize:"13px",fontFamily:"Poppins"}}>
                                            Court Book <i className="bi bi-arrow-right"></i>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Upcoming Matches */}
                    <div className="col-lg-4 p-0 pe-2 ">
                        <div className="text-white  position-relative" style={{ background: 'linear-gradient(180deg, #0034E4 0%, #001B76 100%)', border: "0.5px solid #d4d1d1ff", borderRadius: "20px", height: "352px" }}>
                            <div className='pt-5 pb-1 px-3' style={{ padding: '2rem' }}>
                                <button className="btn mb-3 rounded-pill text-white px-4 py-1" onClick={() => navigate('/open-matches')}
                                    style={{ border: "3px solid #FFFFFF", fontSize: "23px", fontFamily: "Poppins", fontWeight: "500" }}>
                                    Open Matches
                                </button>
                                <h4 className="home-upcoming-heading mt-1">Upcoming Open Matches</h4>
                                <div className=''>
                                    <p className="mb-4 custom-title text-white" style={{ fontWeight: "400" }}>
                                        Join open matches happening <br />around you right now.
                                    </p>
                                </div>
                                <div className='text-start'>
                                    <Link to="/open-matches" className="text-decoration-none bg-white rounded-pill px-4 py-2 custom-title d-inline-flex align-items-center"
                                        style={{ color: "#2043BA", fontWeight: "500", fontSize: "19px", minWidth: "120px", justifyContent: "center" }}>
                                        View all <FaArrowRight className='ms-2' />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Photos Gallery Section */}
            <div className="mt-5 mb-5">
                <div className="position-relative">
                    <div className="overflow-hidden rounded-3">
                        <div
                            className="d-flex justify-content-cener align-items-center"
                            style={{
                                transform: `translateX(-${currentSlide * 25}%)`,
                                transition: currentSlide === 0 && currentSlide !== clubData?.courtImage?.length ? "none" : "transform 0.5s ease"
                            }}
                        >
                            {clubData?.courtImage?.concat(clubData?.courtImage?.slice(0, 4))?.map((image, index) => (
                                <div key={index} className="flex-shrink-0 d-flex justify-content-center" style={{ width: "25%", padding: "0 2px" }}>
                                    <div
                                        className="position-relative overflow-hidden rounded-3"
                                        style={{ height: "400px", width: "400px", cursor: 'pointer' }}
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
                                                display: loadedImages[index] ? 'block' : 'none',
                                                transition: "transform 0.3s ease"
                                            }}
                                            onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
                                            onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Arrows */}
                    <button
                        className="position-absolute top-50 start-0 translate-middle-y btn text-white rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: "30px", height: "30px", marginLeft: "10px", zIndex: 10, backgroundColor: "#011E84" }}
                        onClick={() => {
                            if (currentSlide === 0) {
                                setCurrentSlide(clubData?.courtImage?.length - 1);
                            } else {
                                setCurrentSlide(currentSlide - 1);
                            }
                        }}
                    >
                        <ArrowBackIosIcon style={{ fontSize: "16px" }} />
                    </button>

                    <button
                        className="position-absolute top-50 end-0 translate-middle-y btn text-white rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: "30px", height: "30px", marginRight: "10px", zIndex: 10, backgroundColor: "#011E84" }}
                        onClick={() => {
                            if (currentSlide >= clubData?.courtImage?.length - 1) {
                                setCurrentSlide(0);
                            } else {
                                setCurrentSlide(currentSlide + 1);
                            }
                        }}
                    >
                        <ArrowForwardIosIcon style={{ fontSize: "16px" }} />
                    </button>
                </div>

                {/* Lightbox */}
                {isOpen && galleryImages.length > 0 && (
                    <Lightbox
                        mainSrc={galleryImages[photoIndex]}
                        nextSrc={galleryImages[(photoIndex + 1) % galleryImages.length]}
                        prevSrc={galleryImages[(photoIndex + galleryImages.length - 1) % galleryImages.length]}
                        onCloseRequest={() => setIsOpen(false)}
                        onMovePrevRequest={() =>
                            setPhotoIndex((photoIndex + galleryImages.length - 1) % galleryImages.length)
                        }
                        onMoveNextRequest={() =>
                            setPhotoIndex((photoIndex + 1) % galleryImages.length)
                        }
                        imagePadding={0}
                        wrapperClassName="full-screen-lightbox"
                    />
                )}
            </div>

            {/* Reviews Section */}
            <div className="container my-5">
                <h4
                    style={{
                        fontWeight: "500",
                        fontFamily: "Poppins",
                        fontSize: "34px",
                        marginBottom: "25px",
                        color: "#000000"
                    }}
                >
                    Here’s what our previous players <br /> have to say!
                </h4>

                <div className="position-relative  ">
                    <div className="overflow-hidden ">
                        <div
                            className="d-flex p-0"
                            style={{
                                transform: `translateX(-${reviewSlide * 33.333}%)`,
                                transition: reviewSlide === 0 && reviewSlide !== getReviewData?.reviews?.length ? "none" : "transform 0.5s ease"
                            }}
                        >
                            {getReviewData?.reviews?.concat(getReviewData?.reviews?.slice(0, 3))?.map((review, index) => (
                                <div key={index} className="flex-shrink-0 ms-0 me-0" style={{ width: "33.333%" }}>
                                    <ReviewCard review={review} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Section */}
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <div className="mt-5 mb-5">
                            <h4 style={{ fontWeight: "600", fontFamily: "Poppins", fontSize: "34px", color: "#1C1B1F" }}>Address</h4>
                            <p
                                style={{
                                    fontSize: '16px',
                                    fontWeight: 500,
                                    textDecoration: 'underline',
                                    fontFamily: "Poppins",
                                    color: "#374151"
                                }}
                            >
                                {clubData?.clubName}
                                {clubData?.address || clubData?.city || clubData?.state || clubData?.zipCode ? ', ' : ''}
                                {[clubData?.address, clubData?.city, clubData?.state, clubData?.zipCode]
                                    .filter(Boolean)
                                    .join(', ')}
                            </p>
                            <div className="ratio ratio-16x9 rounded-4 overflow-hidden mt-4">
                                <iframe
                                    src={mapSrc}
                                    width="600"
                                    height="450"
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="The Good Club Map"
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
