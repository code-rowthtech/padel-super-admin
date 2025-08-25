import React, { useEffect, useState } from 'react';
import { twoball, taness, logo, line } from '../../../assets/files';
import DirectionsIcon from '@mui/icons-material/Directions';
import PhotoSizeSelectActualIcon from '@mui/icons-material/PhotoSizeSelectActual';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import PhoneIcon from '@mui/icons-material/Phone';
import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { FaStar, FaStarHalfAlt } from "react-icons/fa";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";
import { Link, useNavigate } from 'react-router-dom';
import 'animate.css';
import { useDispatch, useSelector } from 'react-redux';
import { addReviewClub, getReviewClub, getUserClub } from '../../../redux/user/club/thunk';
import { ButtonLoading } from '../../../helpers/loading/Loaders';
import { formatDate } from '../../../helpers/Formatting';
import { Avatar } from '@mui/material';
import { getLogo } from '../../../redux/user/auth/authThunk';




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
    const mapSrc =
        'https://www.google.com/maps/embed?pb=...'; // your map iframe src\

    const todayIndex = new Date().getDay(); // JS: Sunday = 0, Monday = 1, ...
    const adjustedIndex = todayIndex === 0 ? 6 : todayIndex - 1;

    useEffect(() => {
        dispatch(getUserClub({ search: "" }))
    }, [])

    useEffect(() => {
        if (clubData && clubData._id) {
            localStorage.setItem("register_club_id", clubData._id);
            dispatch(getLogo(clubData?.ownerId))
        }
    }, [clubData]);

    const handleClick = (value) => {
        setRating(value);
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
                        <div className="col-lg-7 ps-0">
                            <div className="image-zoom-container position-relative overflow-hidden rounded-3" style={{ height: '100%' }}>
                                <img src={twoball} alt="Paddle" className="img-fluid w-100 h-100 object-fit-cover rounded-3" />
                                <div
                                    className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center text-white p-5"
                                    style={{
                                        background: 'linear-gradient(to right, rgba(17, 20, 39, 1) 3%, rgba(255, 255, 255, 0) 100%)'
                                    }}
                                >
                                    <p className='mb-0' style={{ fontSize: "20px" }}>Welcome To Good Court</p>
                                    <h1 className="fw-bold display-5">Your Game, <br />Your Court,<br />Just a Tap Away.</h1>
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
                                        <button type="button" className="btn btn-outline-light mb-3 rounded-pill px-4 py-1" onClick={() => navigate('/open-matches')}>
                                            Open Matches
                                        </button>
                                        <h4 className="fw-bold">Upcoming Open Matches</h4>
                                        <div className='w-75'>
                                            <p className="mb-4" style={{ fontSize: "20px", fontWeight: "400" }}>
                                                Join open matches happening around you right now.
                                            </p>
                                        </div>
                                        <div className='text-end'>
                                            <Link
                                                to="/open-matches"
                                                className="text-decoration-none fw-bold d-inline-flex align-items-center"
                                                style={{ color: "#7CBA3D" }}
                                            >
                                                View all <i className="bi bi-arrow-right fs-5 ms-2"></i>
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
            </div>

            <div className="container py-4 px-4 mt-4 mb-5 rounded-3 bg-light">
                <div className="row g-4">

                    {/* Left Column: About + Contact Info */}
                    <div className="col-lg-8">
                        <div className="mb-3 d-flex align-items-center gap-3">
                            <div className=''>
                                <Avatar>
                                    {clubData?.clubName ? clubData.clubName.charAt(0).toUpperCase() : "C"}
                                </Avatar>
                            </div>
                            <div>
                                <h5 className="mb-0">{clubData?.clubName || "Club Name"}</h5>
                                <div className="d-flex align-items-center">
                                    <div className="text-success">
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
                                    <span className="ms-2 " style={{ fontSize: '17px', color: '#374151', fontWeight: "500" }}>
                                        {getReviewData?.averageRating}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <h4 style={{ fontWeight: "600" }}>About </h4>
                        <p style={{ fontSize: "16px", fontFamily: "600" }}>
                            {clubData?.clubName}  {clubData?.description}
                        </p>
                        <p style={{ fontSize: "16px", fontFamily: "600" }}>
                            Join the community, feel the energy, and experience the good vibes!<br />
                            #theGoodPeople
                        </p>
                        <p style={{ fontSize: "16px", fontFamily: "600" ,margin:"0px"}}>Join the Padel community group on WhatsApp </p>
                       <a href="">https://chat.whatsapp.com/DqKAR0MiI5i8dP2Wqe0srt</a>
                       <p className='mt-4'><a className='mt-4'  href="">https://maps.app.goo.gl/hLmCundx4GsjbaiB7?g_st=ic</a></p>



                    </div>

                    {/* Right Column: Timings */}
                    <div className="col-lg-4">
                        <div className="bg-white p-4">
                            <div className="d-flex justify-content-center mb-4">
                                <strong className='me-2'style={{fontWeight:"500"}} >
                                    <i className="bi bi-alarm-fill"></i> Close Now
                                </strong>
                                <span>{clubData?.businessHours?.[adjustedIndex]?.time}</span>
                            </div>

                            {clubData?.businessHours?.map((day, idx) => (
                                <div
                                    key={idx}
                                    className={`d-flex justify-content-between mb-2 ${idx === adjustedIndex ? ' fw-bold rounded  py-1' : ''}`}
                                >
                                    <span>{day?.day}</span>
                                    <span>{day?.time}</span>
                                </div>
                            ))}

                            <p className="mt-3 text-center " style={{fontWeight:"500"}}>Time zone (India Standard Time)</p>
                            <div className='text-center'>
                                <Link to="/booking" state={{ clubData }} className="court-book-link animate__animated animate__fadeInUp">
                                    Court Book <i className="bi bi-arrow-right"></i>
                                </Link>

                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    {/* Tab Buttons */}
                    <div className="d-flex gap-4 mt-4 flex-wrap">
                        {/* Direction */}
                        <button
                            onClick={() => setActiveTab('direction')}
                            className={`icon-button text-center text-decoration-none bg-transparent border-0`}
                        >
                            <div className={`icon-circle mx-auto ${activeTab === 'direction' ? 'active' : ''}`}>
                                <DirectionsIcon />
                            </div>
                            <div className="label text-dark mt-2 fw-medium">Direction</div>
                        </button>

                        {/* Reviews */}
                        <button
                            onClick={() => setActiveTab('reviews')}
                            className="icon-button text-center text-decoration-none bg-transparent border-0"
                        >
                            <div className={`icon-circle mx-auto ${activeTab === 'reviews' ? 'active' : ''}`}>
                                <StarOutlineIcon />
                            </div>
                            <div className="label text-dark mt-2 fw-medium">Reviews</div>
                        </button>

                        {/* Photos */}
                        <button
                            onClick={() => setActiveTab('photos')}
                            className="icon-button text-center text-decoration-none bg-transparent border-0"
                        >
                            <div className={`icon-circle mx-auto ${activeTab === 'photos' ? 'active' : ''}`}>
                                <PhotoSizeSelectActualIcon />
                            </div>
                            <div className="label text-dark mt-2 fw-medium">Photos</div>
                        </button>

                        {/* Call */}
                        <button

                            className="icon-button text-center text-decoration-none bg-transparent border-0"
                        >
                            <div className={`icon-circle mx-auto`}>
                                <PhoneIcon />
                            </div>
                            <div className="label text-dark mt-2 fw-medium">Call</div>
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="mt-5 mb-5">
                        {activeTab === 'direction' && (
                            <>
                                <h4 style={{ fontWeight: '600' }}>Address</h4>
                                <p
                                    style={{
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        textDecoration: 'underline',
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
                                            <div className='col-5 text-center d-flex align-items-center justify-contant-center'>
                                                <div className="w-100">
                                                    <h4 className="" style={{ fontSize: "16px", fontWeight: "500" }}>Overall Rating</h4>
                                                    <div className="display-4 fw-bold">{getReviewData?.averageRating}</div>
                                                    <div className="text-success">
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
                                                    <div className="text-muted mt-2">based on {getReviewData?.totalReviews} reviews</div>
                                                </div>

                                            </div>

                                            <div className="col-7 px-4 border-start d-flex align-items-center">
                                                <div className="w-100">
                                                    {["Excellent", "Very Good", "Good", "Average", "Poor"].map((label, idx) => {
                                                        let width = "0%";
                                                        let percent = 0;

                                                        if (label === getReviewData?.ratingCategory) {
                                                            const rating = getReviewData?.averageRating || 0;
                                                            percent = Math.round(rating * 20); // Convert 0-5 rating to percentage
                                                            width = `${percent}%`;
                                                        }

                                                        return (
                                                            <div className="d-flex align-items-center justify-content-between mb-1 w-100" key={idx}>
                                                                <div className="me-2" style={{ width: "100px" }}>
                                                                    {label}
                                                                </div>
                                                                <div className="progress me-3 w-100" style={{ height: "8px", position: "relative" }}>
                                                                    <div
                                                                        className={`progress-bar bg-${idx === 0 ? "success" : idx === 1 ? "info" : idx === 2 ? "warning" : idx === 3 ? "danger" : "dark"
                                                                            }`}
                                                                        style={{ width }}
                                                                    ></div>
                                                                </div>
                                                                <div className=''
                                                                    style={{
                                                                        color: "#000",
                                                                        fontSize: "12px",
                                                                        backgroundColor: "rgba(255, 255, 255, 0.7)",
                                                                    }}
                                                                >
                                                                    {percent}%
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
                                            <div div className='p-3 bg-white mb-2 d-flex justify-content-between align-items-start flex-wrap'>
                                                <div key={i} className="d-flex align-items-start">
                                                    <img
                                                        src={review.avatar || 'https://t4.ftcdn.net/jpg/15/13/35/75/360_F_1513357508_F3lTOCrYHHjBB8Lb3K9IBfS4IPLyNcrJ.jpg'}
                                                        alt={review?.userId?.name}
                                                        className="rounded-circle me-3"
                                                        width="60"
                                                        height="60"
                                                    />
                                                    <div>
                                                        <h6 className="mb-1 " style={{ fontSize: "16px", fontWeight: "500" }}>{review?.userId?.name || review?.userId?.email}</h6>
                                                        <div className=" mb-2">
                                                            {[...Array(Math.floor(review?.reviewRating || 0))].map((_, i) => (
                                                                <StarIcon key={i} size={5} style={{ color: "#32B768" }} />
                                                            ))}
                                                            {review?.reviewRating % 1 !== 0 && review?.reviewRating <= 5 && (
                                                                <StarHalfIcon key="half" size={5} style={{ color: "#32B768" }} />
                                                            )}
                                                            {[...Array(Math.floor(5 - (review?.reviewRating || 0)))].map((_, i) => (
                                                                <StarBorderIcon key={`empty-${i}`} size={5} style={{ color: '#ccc' }} />
                                                            ))}
                                                            <span className="ms-1 pt-3">{review?.reviewRating || 0}</span>
                                                        </div>
                                                        <p className="mb-0 text-muted" style={{ maxWidth: "700px" }}>
                                                            {review?.reviewComment}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-muted small mt-3 mt-md-0">
                                                    Post Date : <strong>{formatDate(review?.createdAt)}</strong>
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
                                        galleryImages.map((image, index) => (
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
                                                    onError={() => handleImageLoad(index)} // Handle broken images
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
            </div>
        </>
    );
};

export default Home;
