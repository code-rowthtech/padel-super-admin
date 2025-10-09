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
                                className="position-absolute start-0 w-100 h-100 d-flex flex-column justify-content-center text-white p-5 pt-0"
                                style={{
                                    background: 'linear-gradient(269.34deg, rgba(255, 255, 255, 0) 0.57%, rgba(17, 24, 39, 0.5) 94.62%)',
                                    backgroundBlendMode: 'multiply',
                                    top: "0%"
                                }}
                            >
                                <p className='mb-0 custom-title text-white' style={{ fontWeight: "400" }}>Welcome To Good Court</p>
                                <h1 className="home-main-heading">Your Game, <br />Your Court,<br />Just a Tap Away.</h1>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container py-4 p-0 rounded-3" style={{ backgroundColor: "#F5F5F569", marginTop: "-100px" }}>
                <div className="row position-relative align-items-stretch">

                    {/* Left Column: Club Name, About, Address, and Timings */}
                    <div className="col-lg-8 d-flex">
                        <div className=" row border pe-3 bg-white  rounded-3 shadow p-2 flex-fill">
                            <div className='col-lg-7 ' style={{
                                borderRight: "1px solid transparent",
                                borderImage: "linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #002DC7 46.63%, rgba(255, 255, 255, 0) 94.23%)",
                                borderImageSlice: 1,
                            }}>
                                <div className="mb-4  d-flex align-items-center justify-content-start gap-3">
                                    <div className='mb-4'>
                                        <Avatar>
                                            {clubData?.clubName ? clubData.clubName.charAt(0).toUpperCase() : "C"}
                                        </Avatar>
                                    </div>
                                    <div>
                                        <h5 className="mb-0">{clubData?.clubName || "The Good Club"}</h5>
                                        <div className="d-flex align-items-center justify-content-center text-nowrap">
                                            <p className="text-success">
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
                                            <p className="ms-2 pt-1" style={{ fontSize: '17.5px', color: '#374151', fontWeight: "500", fontFamily: "Poppins" }}>
                                                {getReviewData?.averageRating || 4.5}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="div border rounded p-2">
                                        <p className="mb-0" style={{ fontSize: "14px", fontWeight: "500", fontFamily: "Poppins" }}>
                                            cc
                                        </p>
                                        <div className="d-flex gap-2 border rounded-pill">
                                            {padelimg.map((img, idx) => (
                                                <img key={idx} src={img.img} alt="" className="rounded-pill" style={{ width: "30px", height: "30px" }} />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-grow-1">
                                    <h4 style={{ fontWeight: "600", fontFamily: "Poppins", fontSize: "24px" }}>About</h4>
                                    <p className='' style={{ fontSize: "16px", fontFamily: "Poppins", fontWeight: "400" }}>
                                        {clubData?.clubName || "The Good Club"} The Good Club, Chandigarh’s premier Padel hub with 5+ indoor courts, Pilates studio, a kid’s play area, and a rich café. It’s where good people meet, play, and build bonds beyond the court. Join the community, feel the energy, and experience the good vibes!
                                    </p>
                                    <p style={{ fontSize: "16px", fontFamily: "Poppins", fontWeight: "400", margin: "0px" }}>Join the Padel community group on WhatsApp</p>
                                    <a href="">https://chat.whatsapp.com/DqKAR0MiI5i8dP2Wqe0srt</a>
                                    <p className='mt-4'><a href="">https://maps.app.goo.gl/hLmCundx4GsjbaiB7?g_st=ic</a></p>
                                </div>
                            </div>

                            <div className=" col-lg-5">
                                <div className="">
                                    <div className="d-flex justify-content-center mb-4">
                                        <strong className='me-2 open-now-time'>
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
                                    <p className="mt-3 text-center" style={{ fontWeight: "500" }}>Time zone (India Standard Time)</p>
                                    <div className='text-center'>
                                        <Link to="/booking" state={{ clubData }} className="court-book-link animate__animated animate__fadeInUp">
                                            Court Book <i className="bi bi-arrow-right"></i>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Upcoming Matches */}
                    <div className="col-lg-4 d-flex">
                        <div className="text-white rounded-3 position-relative flex-fill" style={{ background: 'linear-gradient(180deg, #0034E4 0%, #001B76 100%)' }}>
                            <div className='pt-5 pb-4 px-4' style={{ padding: '2rem' }}>
                                <button className="btn mb-3 rounded-pill text-white px-4 py-1" onClick={() => navigate('/open-matches')}
                                    style={{ border: "3px solid #FFFFFF", fontSize: "14px", fontFamily: "Poppins", fontWeight: "500" }}>
                                    Open Matches
                                </button>
                                <h4 className="home-upcoming-heading">Upcoming Open Matches</h4>
                                <div className='w-75'>
                                    <p className="mb-4 custom-title text-white" style={{ fontWeight: "400" }}>
                                        Join open matches happening around you right now.
                                    </p>
                                </div>
                                <div className='text-start'>
                                    <Link to="/open-matches" className="text-decoration-none bg-white rounded-pill p-2 custom-title d-inline-flex align-items-center"
                                        style={{ color: "#7CBA3D", fontWeight: "500", fontSize: "14px" }}>
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
                        fontWeight: "600",
                        fontFamily: "Poppins",
                        fontSize: "20px",
                        marginBottom: "25px",
                    }}
                >
                    Here’s what our previous players have to say!
                </h4>

                <div className="position-relative">
                    <div className="overflow-hidden">
                        <div
                            className="d-flex"
                            style={{
                                transform: `translateX(-${reviewSlide * 33.333}%)`,
                                transition: reviewSlide === 0 && reviewSlide !== getReviewData?.reviews?.length ? "none" : "transform 0.5s ease"
                            }}
                        >
                            {getReviewData?.reviews?.concat(getReviewData?.reviews?.slice(0, 3))?.map((review, index) => (
                                <div key={index} className="flex-shrink-0" style={{ width: "33.333%", padding: "0 10px" }}>
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
                            <h4 style={{ fontWeight: "600", fontFamily: "Poppins", fontSize: "24px" }}>Address</h4>
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
