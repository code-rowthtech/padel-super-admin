import React, { useEffect, useState } from 'react';
import { twoball, taness, logo, line } from '../../../assets/files';
import DirectionsIcon from '@mui/icons-material/Directions';
import PhotoSizeSelectActualIcon from '@mui/icons-material/PhotoSizeSelectActual';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import PhoneIcon from '@mui/icons-material/Phone';
import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { FaStar } from "react-icons/fa";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";
import { Link } from 'react-router-dom';
import 'animate.css';
import { useDispatch, useSelector } from 'react-redux';
import { getUserClub } from '../../../redux/user/club/thunk';


const photos = [
    'gallery1.png', 'gallery2.png',
    'taness.png', 'gallery4.png', 'gallery5.png',
    'gallery6.png', 'gallery7.png',
    'gallery8.png', 'gallery9.png', 'gallery10.png'
];



const reviews = [
    {
        name: "Eleanor Pena",
        rating: 4.5,
        date: "22/07/2025",
        message:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...",
        avatar: "https://i.pravatar.cc/100?img=1",
    },
    {
        name: "Leslie Alexander",
        rating: 4.5,
        date: "22/07/2025",
        message:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...",
        avatar: "https://i.pravatar.cc/100?img=2",
    },
    {
        name: "Courtney Henry",
        rating: 4.5,
        date: "22/07/2025",
        message:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...",
        avatar: "https://i.pravatar.cc/100?img=3",
    },
    {
        name: "Devon Lane",
        rating: 4.5,
        date: "22/07/2025",
        message:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...",
        avatar: "https://i.pravatar.cc/100?img=4",
    },
];

const Home = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [photoIndex, setPhotoIndex] = useState(0);
    const dispatch = useDispatch()
    const store = useSelector((state) => state)
    const allImages = photos.map(photo => require(`../../../assets/images/${photo}`));
    const [activeTab, setActiveTab] = useState('direction');
    const clubData = store?.userClub?.clubData?.data?.courts[0]
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
        }
    }, [clubData]);

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
                                            backgroundSize: 'cover', // or 'contain', depending on your design
                                            backgroundPosition: 'center',
                                            padding: '2rem' // optional: space inside the div
                                        }}
                                    >
                                        <button type="button" className="btn btn-outline-light mb-3 rounded-pill px-4 py-1">
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

            <div className="container py-4 px-4 mt-4 rounded-3 bg-light">
                <div className="row g-4">

                    {/* Left Column: About + Contact Info */}
                    <div className="col-lg-8">
                        <div className="mb-3 d-flex align-items-center gap-3">
                            <div className='bg-white rounded-circle py-4 px-2'>
                                <img src={logo} alt="logo" style={{ width: "76px" }} />
                            </div>
                            <div>
                                <h5 className="mb-0">{clubData?.clubName || "Club Name"}</h5>
                                <div className="d-flex align-items-center">

                                    {[...Array(4)].map((_, i) => (
                                        <StarIcon key={i} style={{ color: '#32B768' }} />
                                    ))}
                                    <StarBorderIcon style={{ color: '#ccc' }} />
                                    <span className="ms-2 " style={{ fontSize: '17px', color: '#374151', fontWeight: "500" }}>
                                        4.5
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




                    </div>

                    {/* Right Column: Timings */}
                    <div className="col-lg-4">
                        <div className="bg-white p-4">
                            <div className="d-flex justify-content-center mb-4">
                                <strong className='me-2'>
                                    <i className="bi bi-alarm-fill"></i> Close now
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

                            <p className="mt-3 text-center fw-bold">Time zone (India Standard Time)</p>
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
                    <div className="mt-5">
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
                                    <div className="col-md-6">
                                        <div className="p-4 row rounded-4 bg-white h-100">
                                            <div className='col-5 text-center d-flex align-items-center justify-contant-center'>
                                                <div className='w-100'>
                                                    <h4 className="" style={{ fontSize: "16px", fontWeight: "500" }}>Overall Rating</h4>
                                                    <div className="display-4 fw-bold">4.0</div>
                                                    <div className="text-success">

                                                        {[...Array(4)].map((_, i) => (
                                                            <StarIcon key={i} style={{ color: '#32B768' }} />
                                                        ))}
                                                        <StarBorderIcon style={{ color: '#ccc' }} />
                                                    </div>
                                                    <div className="text-muted mt-2">based on 40 reviews</div>
                                                </div>
                                            </div>

                                            <div className=" col-7 px-4 border-start d-flex align-items-center">
                                                <div className='w-100'>
                                                    {["Excellent", "Good", "Average", "Below Average", "Poor"].map(
                                                        (label, idx) => (
                                                            <div className="d-flex align-items-center mb-1 w-100" key={idx}>
                                                                <div className="me-2" style={{ width: "100px" }}>
                                                                    {label}
                                                                </div>
                                                                <div className="progress w-100" style={{ height: "8px" }}>
                                                                    <div
                                                                        className={`progress-bar bg-${idx === 0
                                                                            ? "success"
                                                                            : idx === 1
                                                                                ? "info"
                                                                                : idx === 2
                                                                                    ? "warning"
                                                                                    : idx === 3
                                                                                        ? "danger"
                                                                                        : "dark"
                                                                            }`}
                                                                        style={{ width: `${100 - idx * 15}%` }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Rate This Court */}
                                    <div className="col-md-6">
                                        <div className="p-4 bg-white rounded-4 h-100">
                                            <h5 className="" style={{ fontSize: "20px", fontWeight: "600" }}>Rate this Court</h5>
                                            <div className="d-flex align-items-center gap-2 mt-2 text-success fs-5">

                                                {[...Array(4)].map((_, i) => (
                                                    <StarIcon key={i} style={{ color: '#32B768' }} />
                                                ))}
                                                <StarBorderIcon style={{ color: '#ccc' }} />
                                                <span className="ms-2">4.5</span>
                                            </div>
                                            <div className="form-group mt-3">
                                                <p className='' style={{ fontWeight: "600", fontSize: "14px" }}>Write a message</p>
                                                <textarea
                                                    className="form-control rounded-3"
                                                    rows="4"
                                                    placeholder="Write Here"
                                                ></textarea>
                                            </div>
                                            <div className='text-end'>
                                                <button className="btn  mt-3 px-5 rounded-pill text-white" style={{ backgroundColor: "#3DBE64" }} >
                                                    Submit
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Customer Reviews */}
                                <div className="mt-5">
                                    <h4 className=" mb-4" style={{ fontSize: "22px", fontWeight: "600" }}>Customer reviews</h4>
                                    {reviews.map((review, i) => (
                                        <div
                                            className="border bg-white rounded-3 p-3 mb-4 d-flex justify-content-between align-items-start flex-wrap"
                                            key={i}
                                        >
                                            <div className="d-flex align-items-start">
                                                <img
                                                    src={review.avatar}
                                                    alt={review.name}
                                                    className="rounded-circle me-3"
                                                    width="60"
                                                    height="60"
                                                />
                                                <div>
                                                    <h6 className="mb-1 " style={{ fontSize: "16px", fontWeight: "500" }}>{review.name}</h6>
                                                    <div className="text-success mb-2">
                                                        {[...Array(4)].map((_, i) => (
                                                            <FaStar key={i} size={14} />
                                                        ))}
                                                        <FaStar size={14} style={{ opacity: 0.3 }} />
                                                        <span className="ms-1">{review.rating}</span>
                                                    </div>
                                                    <p className="mb-0 text-muted" style={{ maxWidth: "700px" }}>
                                                        {review.message}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-muted small mt-3 mt-md-0">
                                                Post Date : <strong>{review.date}</strong>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'photos' && (
                            <div className="container my-5">
                                <div className="custom-gallery">
                                    {clubData?.courtImage?.slice(0, 10).map((image, index) => (
                                        <div
                                            key={index}
                                            className={`gallery-item item${index + 1}`}
                                            onClick={() => {
                                                setPhotoIndex(index);
                                                setIsOpen(true);
                                            }}
                                        >
                                            <img src={image} alt={`Gallery ${index + 1}`} />
                                        </div>
                                    ))}
                                </div>

                                {/* Lightbox */}
                                {isOpen && (
                                    <Lightbox
                                        mainSrc={allImages[photoIndex]}
                                        nextSrc={allImages[(photoIndex + 1) % allImages.length]}
                                        prevSrc={allImages[(photoIndex + allImages.length - 1) % allImages.length]}
                                        onCloseRequest={() => setIsOpen(false)}
                                        onMovePrevRequest={() =>
                                            setPhotoIndex((photoIndex + allImages.length - 1) % allImages.length)
                                        }
                                        onMoveNextRequest={() =>
                                            setPhotoIndex((photoIndex + 1) % allImages.length)
                                        }
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
