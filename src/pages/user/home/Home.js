import React, { useEffect, useState } from 'react';
import { twoball, taness, line } from '../../../assets/files';
import DirectionsIcon from '@mui/icons-material/Directions';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import PhoneIcon from '@mui/icons-material/Phone';
import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import StarBorderIcon from '@mui/icons-material/StarBorder';
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



const Home = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [photoIndex, setPhotoIndex] = useState(0);
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(null);
    const [message, setMessage] = useState("");
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const store = useSelector((state) => state)
    const [activeTab, setActiveTab] = useState('direction');
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
        if (activeTab === 'reviews') {
            dispatch(getReviewClub(id));
        }
    }, [activeTab, clubData?._id]);

    return (
        <>
            <div className='container'>
                <div className="container px-0 ">
                    <div className="row g-4">

                        {/* Left Large Card */}
                        <div className="col-lg-7 ps-md-0">
                            <div className="image-zoom-container position-relative overflow-hidden rounded-3" style={{ height: '100%' }}>
                                <img src={twoball} alt="Paddle" className="img-fluid w-100 h-100 object-fit-cover rounded-3" />
                                <div
                                    className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center text-white p-5"
                                    style={{
                                        background: 'linear-gradient(269.34deg, rgba(255, 255, 255, 0) 0.57%, #111827 94.62%)',
                                        backgroundBlendMode: 'multiply',
                                    }}
                                >
                                    <p className='mb-0 custom-title text-white' style={{ fontWeight: "400" }}>Welcome To Good Court</p>
                                    <h1 className="home-main-heading ">Your Game, <br />Your Court,<br />Just a Tap Away.</h1>
                                </div>
                            </div>
                        </div>


                        {/* Right Top Card */}
                        <div className="col-lg-5 px-1">
                            <div>
                                <div className=" text-white  rounded-3 position-relative" style={{ background: '#374151' }}>
                                    <div className='pt-5 pb-4 px-4'
                                        style={{
                                            backgroundImage: `url(${line})`,
                                            backgroundRepeat: 'no-repeat',
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            padding: '2rem'
                                        }}
                                    >
                                        <button className="btn  mb-3 rounded-pill text-white  px-4 py-1" onClick={() => navigate('/open-matches')}
                                            style={{ border: "3px solid #FFFFFF", fontSize: "14px", fontFamily: "Poppins", fontWeight: "500" }}
                                        >
                                            Open Matches
                                        </button>
                                        <h4 className="home-upcoming-heading">Upcoming Open Matches</h4>
                                        <div className='w-75'>
                                            <p className="mb-4 custom-title text-white" style={{ fontWeight: "400" }}>
                                                Join open matches happening around you right now.
                                            </p>
                                        </div>
                                        <div className='text-end'>
                                            <Link
                                                to="/open-matches"
                                                className="text-decoration-none custom-title  d-inline-flex align-items-center"
                                                style={{ color: "#7CBA3D", fontWeight: "500" }}
                                            >
                                                View all <FaArrowRight className='ms-2' />
                                            </Link>

                                        </div>
                                    </div>
                                </div>
                                <div className="image-zoom-hover rounded-3 overflow-hidden mt-3">
                                    <img src={taness} alt="Match" className="img-fluid w-100 h-100 object-fit-cover" />
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </div >

            <div className="container py-4 px-4 mt-4 mb-5 rounded-3 " style={{ backgroundColor: "#F5F5F569" }}>
                <div className="row g-4">

                    {/* Left Column: About + Contact Info */}
                    <div className="col-lg-8 ">
                        <div className="mb-4 d-flex align-items-center justify-content-start gap-3">
                            <div className='mb-4'>
                                <Avatar>
                                    {clubData?.clubName ? clubData.clubName.charAt(0).toUpperCase() : "C"}
                                </Avatar>
                            </div>
                            <div>
                                <h5 className="mb-0">{clubData?.clubName || "Club Name"}</h5>
                                <div className="d-flex align-items-center justify-content-center text-nowrap" style={{}}>
                                    <p className="text-success ">
                                        {[...Array(5)].map((_, i) => {
                                            const rating = getReviewData?.averageRating || 0;
                                            if (i < Math.floor(rating)) {
                                                return <StarIcon key={i} style={{ color: "#32B768" }} />;
                                            } else if (i < rating && rating % 1 >= 0.5) {
                                                return <StarHalfIcon key={i} style={{ color: "#32B768" }} />;
                                            } else {
                                                return <StarBorderIcon key={i} style={{ color: "#ccc" }} />;
                                            }
                                        })}
                                    </p>
                                    <p className="ms-2 pt-1  " style={{ fontSize: '17.5px', color: '#374151', fontWeight: "500", fontFamily: "Poppins" }}>
                                        {getReviewData?.averageRating}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="w-75">
                            <h4 style={{ fontWeight: "600", fontFamily: "Poppins", fontSize: "24px" }}>About </h4>
                            <p style={{ fontSize: "16px", fontFamily: "Poppins", fontWeight: "400" }}>
                                {clubData?.clubName}  {clubData?.description}
                            </p>
                            <p style={{ fontSize: "16px", fontFamily: "Poppins", fontWeight: "400" }}>
                                Join the community, feel the energy, and experience the good vibes!<br />
                                #theGoodPeople
                            </p>
                            <p style={{ fontSize: "16px", fontFamily: "Poppins", fontWeight: "400", margin: "0px" }}>Join the Padel community group on WhatsApp </p>
                            <a href="">https://chat.whatsapp.com/DqKAR0MiI5i8dP2Wqe0srt</a>
                            <p className='mt-4 '><a className='mt-4' href="">https://maps.app.goo.gl/hLmCundx4GsjbaiB7?g_st=ic</a></p>

                        </div>
                        {/* Tab Buttons */}
                        <div className="d-flex gap-2 gap-md-4 mt-5 mb-1 justify-content-between justify-content-md-start">
                            {/* Direction */}
                            <div
                                onClick={() => setActiveTab('direction')}
                                className={`icon-button text-center text-decoration-none  border-0`}
                            >
                                <div className={`icon-circle mx-auto ${activeTab === 'direction' ? 'active' : ''}`} >
                                    <DirectionsIcon size={20} />
                                </div>
                                <div className="label  mt-2 ">Direction</div>
                            </div>

                            {/* Reviews */}
                            <div
                                onClick={() => setActiveTab('reviews')}
                                className="icon-button text-center text-decoration-none  border-0"
                            >
                                <div className={`icon-circle mx-auto ${activeTab === 'reviews' ? 'active' : ''}`}>
                                    <StarOutlineIcon />
                                </div>
                                <div className="label  mt-2 ">Reviews</div>
                            </div>

                            {/* Photos */}
                            <div
                                onClick={() => setActiveTab('photos')}
                                className="icon-button text-center text-decoration-none  border-0"
                            >
                                <div className={`icon-circle mx-auto ${activeTab === 'photos' ? 'active' : ''}`}>
                                    <PiImagesSquareFill size={30} />
                                </div>
                                <div className="label  mt-2 ">Photos</div>
                            </div>

                            {/* Call */}
                            <div

                                className="icon-button text-center text-decoration-none  border-0"
                            >
                                <div className={`icon-circle mx-auto ${activeTab === 'call' ? 'active' : ''}`}>
                                    <PhoneIcon />
                                </div>
                                <div className="label  mt-2">Call</div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Timings */}
                    <div className="col-lg-4">
                        <div className="bg-white p-4">
                            <div className="d-flex justify-content-center mb-4">
                                <strong className='me-2 open-now-time'  >
                                    <MdWatchLater size={20} />   Open Now  {clubData?.businessHours?.[adjustedIndex]?.time}
                                </strong>
                            </div>

                            {clubData?.businessHours?.map((day, idx) => (
                                <div
                                    key={idx}
                                    className={`d-flex justify-content-between open-now-time mb-3 `}
                                    style={{ fontWeight: idx === adjustedIndex ? "600" : '400' }}
                                >
                                    <span>{day?.day}</span>
                                    <span>{day?.time}</span>
                                </div>
                            ))}

                            <p className="mt-3 text-center " style={{ fontWeight: "500" }}>Time zone (India Standard Time)</p>
                            <div className='text-center'>
                                <Link to="/booking" state={{ clubData }} className="court-book-link animate__animated animate__fadeInUp">
                                    Court Book <i className="bi bi-arrow-right"></i>
                                </Link>

                            </div>
                        </div>
                    </div>
                </div>



                {/* Tab Content */}
                <div className="mt-5 mb-5">
                    {activeTab === 'direction' && (
                        <>
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
                                    .join(', ')}                                </p>
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
                        </>
                    )}

                    {activeTab === 'reviews' && (
                        <div className="container my-5">
                            {/* Rating Overview */}
                            <div className="row g-4">
                                <div className="col-md-12">
                                    <div className="p-4 row rounded-4 bg-white h-100">
                                        <div className="col-5 text-center d-flex align-items-center justify-content-center">
                                            <div className="w-100">
                                                <h4 className='mb-4' style={{ fontSize: "16px", fontWeight: "500", fontFamily: "Poppins" }}>Overall Rating</h4>
                                                <div className="averageRating-count mb-3">{getReviewData?.averageRating || 0}</div>
                                                <div className="text-success mb-3">
                                                    {[...Array(5)].map((_, i) => {
                                                        const rating = getReviewData?.averageRating || 0;
                                                        if (i < Math.floor(rating)) {
                                                            return <StarIcon key={i} style={{ color: "#32B768" }} />;
                                                        } else if (i < rating && rating % 1 >= 0.5) {
                                                            return <StarHalfIcon key={i} style={{ color: "#32B768" }} />;
                                                        } else {
                                                            return <StarBorderIcon key={i} style={{ color: "#ccc" }} />;
                                                        }
                                                    })}
                                                </div>
                                                <div className="text-muted mt-2" style={{ fontSize: "12px", fontFamily: "Poppins" }}>
                                                    based on {getReviewData?.totalReviews || 0} reviews
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-7 border-start ps-4 d-flex align-items-center">
                                            <div className="w-100">
                                                {["Excellent", "Very Good", "Good", "Average", "Poor"].map((label, idx) => {
                                                    const ratingCounts = getReviewData?.ratingCounts || {};
                                                    const count = ratingCounts[label] || 0; // get count, 0 if not exists
                                                    const totalReviews = getReviewData?.totalReviews || 0;

                                                    // Calculate percentage only if count > 0
                                                    const percent = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

                                                    return (
                                                        <div className="d-flex align-items-center justify-content-between mb-3 w-100" key={idx}>
                                                            <div
                                                                className="me-2"
                                                                style={{
                                                                    width: "150px",
                                                                    fontWeight: "500",
                                                                    fontSize: "16px",
                                                                    fontFamily: "Poppins",
                                                                    color: "#636364",
                                                                }}
                                                            >
                                                                {label}
                                                            </div>
                                                            <div className="progress me-3 w-100" style={{ height: "12px", position: "relative" }}>
                                                                <div
                                                                    className="progress-bar"
                                                                    style={{
                                                                        width: `${percent}%`,
                                                                        backgroundColor:
                                                                            idx === 0 ? "#3DBE64" :
                                                                                idx === 1 ? "#7CBA3D" :
                                                                                    idx === 2 ? "#ECD844" :
                                                                                        idx === 3 ? "#FC702B" :
                                                                                            "#E9341F",
                                                                    }}
                                                                ></div>
                                                            </div>
                                                            <div
                                                                style={{
                                                                    color: "#000",
                                                                    fontSize: "12px",
                                                                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                                                                }}
                                                            >
                                                                {count > 0 ? `${percent}%` : ""}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Rate This Court */}
                                <div className="col-md-6">
                                    {/* <div className="p-4 bg-white rounded-4 h-100">
                                            <h5 style={{ fontSize: "20px", fontWeight: "600" }}>Rate this Court</h5>

                                            <div className="d-flex align-items-center gap-2 mt-2 fs-5">
                                                {[...Array(5)].map((_, i) => {
                                                    const fullValue = i + 1;
                                                    const halfValue = i + 0.5;

                                                    return (
                                                        <span key={i} style={{ position: "relative", cursor: "pointer" }}>
                                                            <span
                                                                onClick={() => handleClick(halfValue)}
                                                                onMouseEnter={() => setHover(halfValue)}
                                                                onMouseLeave={() => setHover(null)}
                                                                style={{
                                                                    position: "absolute",
                                                                    left: 0,
                                                                    width: "50%",
                                                                    height: "100%",
                                                                    zIndex: 2,
                                                                }}
                                                            />
                                                            <span
                                                                onClick={() => handleClick(fullValue)}
                                                                onMouseEnter={() => setHover(fullValue)}
                                                                onMouseLeave={() => setHover(null)}
                                                                style={{
                                                                    position: "absolute",
                                                                    right: 0,
                                                                    width: "50%",
                                                                    height: "100%",
                                                                    zIndex: 1,
                                                                }}
                                                            />
                                                            {rating >= fullValue || (hover && hover >= fullValue) ? (
                                                                <StarIcon style={{ color: "#32B768" }} />
                                                            ) : rating >= halfValue || (hover && hover >= halfValue) ? (
                                                                <StarHalfIcon style={{ color: "#32B768" }} />
                                                            ) : (
                                                                <StarBorderIcon style={{ color: "#ccc" }} />
                                                            )}
                                                        </span>
                                                    );
                                                })}
                                                <span className="ms-2">{rating} {getRatingLabel(rating)}</span>
                                            </div>

                                            <div className="form-group mt-3">
                                                <p style={{ fontWeight: "600", fontSize: "14px" }}>Write a message</p>
                                                <textarea
                                                    className="form-control rounded-3"
                                                    rows="4"
                                                    placeholder="Write Here"
                                                    value={message}
                                                    onChange={(e) => setMessage(e.target.value)}
                                                />
                                            </div>

                                            <div className="text-end">
                                                <button
                                                    className="btn mt-3 px-5 rounded-pill text-white"
                                                    style={{ backgroundColor: "#3DBE64" }}
                                                    onClick={handleSubmit}
                                                >
                                                    {addReviewLoading ? <ButtonLoading /> : "Submit"}
                                                </button>
                                            </div>
                                        </div> */}
                                </div>
                            </div>

                            {/* Customer Reviews */}
                            <div className="mt-2">
                                <h4 className=" mb-3" style={{ fontSize: "22px", fontWeight: "600" }}>Customer reviews</h4>
                                <div className='  rounded-3 '
                                    style={{
                                        maxHeight: getReviewData?.reviews?.length >= 4 ? "500px" : "auto",
                                        overflowY: getReviewData?.reviews?.length >= 4 ? "auto" : "visible"
                                    }}
                                >

                                    {getReviewData?.reviews?.map((review, i) => (
                                        <div div className='p-3 bg-white mb-2 ps-4 d-flex justify-content-between align-items-start flex-wrap'>
                                            <div className='col-9' >
                                                <div key={i} className="d-flex mb-3 align-items-start">
                                                    <img
                                                        src={review.avatar || 'https://t4.ftcdn.net/jpg/15/13/35/75/360_F_1513357508_F3lTOCrYHHjBB8Lb3K9IBfS4IPLyNcrJ.jpg'}
                                                        alt={review?.userId?.name}
                                                        className="rounded-circle me-3"
                                                        width="60"
                                                        height="60"
                                                    />
                                                    <div>
                                                        <h6 className="mb-1 " style={{ fontSize: "16px", fontWeight: "500", fontFamily: "Poppins" }}>{review?.userId?.name?.charAt(0).toUpperCase() + review?.userId?.name?.slice(1) || review?.userId?.email}</h6>
                                                        <div className=" mb-2">
                                                            {[...Array(Math.floor(review?.reviewRating || 0))].map((_, i) => (
                                                                <StarIcon key={i} style={{ fontSize: "15px", color: "#32B768" }} />
                                                            ))}
                                                            {review?.reviewRating % 1 !== 0 && review?.reviewRating <= 5 && (
                                                                <StarHalfIcon key="half" style={{ fontSize: "15px", color: "#32B768" }} />
                                                            )}
                                                            {[...Array(Math.floor(5 - (review?.reviewRating || 0)))].map((_, i) => (
                                                                <StarBorderIcon key={`empty-${i}`} style={{ fontSize: "15px", color: '#ccc' }} />
                                                            ))}
                                                            <span className="ms-1 pt-3" style={{ fontSize: "10px", fontFamily: "Poppins", fontWeight: "500" }}>{review?.reviewRating || 0}</span>
                                                        </div>

                                                    </div>
                                                </div>


                                            </div>
                                            <div className=" mt-3 col-3 mt-md-0 text-end" style={{ fontSize: "16px", fontFamily: "Poppins", fontWeight: "500", color: "#374151" }}>
                                                Post Date : <strong>{formatDate(review?.createdAt)}</strong>
                                            </div>
                                            <div className="col-12">
                                                <p className="mb-0 " style={{ fontWeight: "400", fontFamily: "Poppins", fontSize: "14px", color: "#626262" }}>
                                                    {review?.reviewComment}
                                                </p>
                                            </div>
                                        </div>

                                    ))}

                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'photos' && (
                        <div className="container my-5">
                            <div className="custom-gallery">
                                {clubData?.courtImage?.length > 0 ? (
                                    galleryImages?.map((image, index) => (
                                        <div
                                            key={index}
                                            className={`gallery-item item${index + 1}`}
                                            onClick={() => {
                                                setPhotoIndex(index);
                                                setIsOpen(true);
                                            }}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {!loadedImages[index] && (
                                                <div className="image-loader youtube-style">
                                                    <div className="youtube-spinner"></div>
                                                </div>
                                            )}
                                            <img
                                                src={image}
                                                alt={`Gallery ${index + 1}`}
                                                onLoad={() => handleImageLoad(index)}
                                                onError={() => handleImageLoad(index)}
                                                style={{ display: loadedImages[index] ? 'block' : 'none' }}
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <p>{store?.userClub?.clubData?.data?.courts?.length === 0 ? 'No images yet!' : 'No images available'}</p>
                                )}
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
                                    imagePadding={0} // Remove padding for edge-to-edge image
                                    wrapperClassName="full-screen-lightbox" // Custom class for full-screen styling
                                />
                            )}
                        </div>

                    )}

                    {activeTab === 'call' && (
                        <div>
                            <h4 style={{ fontWeight: '600' }}>Call Us</h4>
                            <a href="tel:+919999999999" className="btn btn-outline-dark px-4 py-2 rounded-pill">
                                📞 +91 99999 99999
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Home;
