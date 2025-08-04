import React from "react";
import { FaStar, FaStarHalf } from "react-icons/fa";

const CustomerReviews = () => {
    // Sample data for reviews
    const reviews = [
        {
            id: 1,
            name: "Eleanor Pena",
            rating: 4.5,
            review: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            postDate: "22/07/2025",
        },
        {
            id: 2,
            name: "Leslie Alexander",
            rating: 4.5,
            review: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
            postDate: "22/07/2025",
        },
        {
            id: 3,
            name: "Courtney Henry",
            rating: 4.5,
            review: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
            postDate: "22/07/2025",
        },
        {
            id: 4,
            name: "Devon Lane",
            rating: 4.5,
            review: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
            postDate: "22/07/2025",
        },
    ];

    // Function to render star icons
    const renderStars = (rating, custom) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        const stars = [];
        for (let i = 0; i < fullStars; i++) {
            stars.push(<FaStar key={i} className={custom} />);
        }
        if (hasHalfStar) {
            stars.push(
                <FaStarHalf key={'half'} className={custom} />
            );
        }
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<FaStar key={i + fullStars} className={custom} />);
        }
        return stars;
    };

    return (
        <div className="container py-4">
            {/* Overall Rating Section */}
            <div className="card mb-4">
                <div className="card-body">
                    <div className="row p-4">
                        <div className="col-5 border-end">
                            <h6 className="text-center fw-medium text-muted">Overall Rating</h6>
                            <div className="d-flex flex-column align-items-center">
                                <h1 className="display-4 fw-bold">4.0</h1>
                                <div className="mb-2">
                                    {renderStars(4.0, 'text-success fs-2 mx-2')}
                                </div>
                                <small className="text-muted mt-2">based on 40 reviews</small>
                            </div>
                        </div>

                        {/* Rating Breakdown */}
                        <div className="col-7 px-5">
                            <div className="">
                                <div className="d-flex justify-content-between mb-1">
                                    <span>Excellent</span>
                                    <span>1000</span>
                                </div>
                                <div className="progress" style={{ height: "10px" }}>
                                    <div
                                        className="progress-bar bg-success"
                                        role="progressbar"
                                        style={{ width: "100%" }}
                                        aria-valuenow="100"
                                        aria-valuemin="0"
                                        aria-valuemax="100"
                                    ></div>
                                </div>

                                <div className="d-flex justify-content-between mb-1">
                                    <span>Good</span>
                                    <span>800</span>
                                </div>
                                <div className="progress" style={{ height: "10px" }}>
                                    <div
                                        className="progress-bar bg-success"
                                        role="progressbar"
                                        style={{ width: "80%" }}
                                        aria-valuenow="80"
                                        aria-valuemin="0"
                                        aria-valuemax="100"
                                    ></div>
                                </div>

                                <div className="d-flex justify-content-between mb-1">
                                    <span>Average</span>
                                    <span>600</span>
                                </div>
                                <div className="progress" style={{ height: "10px" }}>
                                    <div
                                        className="progress-bar bg-warning"
                                        role="progressbar"
                                        style={{ width: "60%" }}
                                        aria-valuenow="60"
                                        aria-valuemin="0"
                                        aria-valuemax="100"
                                    ></div>
                                </div>

                                <div className="d-flex justify-content-between mb-1">
                                    <span>Below Average</span>
                                    <span>100</span>
                                </div>
                                <div className="progress" style={{ height: "10px" }}>
                                    <div
                                        className="progress-bar bg-danger"
                                        role="progressbar"
                                        style={{ width: "10%" }}
                                        aria-valuenow="10"
                                        aria-valuemin="0"
                                        aria-valuemax="100"
                                    ></div>
                                </div>

                                <div className="d-flex justify-content-between mb-1">
                                    <span>Poor</span>
                                    <span>50</span>
                                </div>
                                <div className="progress" style={{ height: "10px" }}>
                                    <div
                                        className="progress-bar bg-danger"
                                        role="progressbar"
                                        style={{ width: "5%" }}
                                        aria-valuenow="5"
                                        aria-valuemin="0"
                                        aria-valuemax="100"
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Customer Reviews Section */}
            <h5 className="fw-bold mb-3">Customer reviews</h5>
            {reviews.map((review) => (
                <div key={review.id} className="card mb-3 p-3">
                    <div className="d-flex justify-content-between align-items-start">
                        <div className="d-flex gap-3 align-items-center">
                            <img
                                src="https://randomuser.me/api/portraits/men/75.jpg"
                                alt={review.name}
                                className="rounded-circle"
                                style={{ width: "40px", height: "40px" }}
                            />
                            <div>
                                <h6 className="mb-1">{review.name}</h6>
                                <div className="d-flex align-items-center">
                                    {renderStars(review.rating, 'text-warning')}
                                    <span className="ms-1 text-muted">{review.rating}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-muted">
                            Post Date: {review.postDate}
                        </div>
                    </div>
                    <p className="card-text mt-2">{review.review}</p>
                </div>
            ))}
        </div>
    );
};

export default CustomerReviews;