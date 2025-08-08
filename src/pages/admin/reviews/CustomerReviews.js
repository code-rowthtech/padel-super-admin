import React from "react";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";

const CustomerReviews = () => {
  // Sample data for reviews
  const reviews = [
    {
      id: 1,
      name: "Eleanor Pena",
      rating: 4.5,
      review:
        "The service was exceptional! The team went above and beyond to ensure my needs were met. I particularly appreciated the attention to detail and quick response times.",
      postDate: "July 22, 2025",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      id: 2,
      name: "Leslie Alexander",
      rating: 5,
      review:
        "Absolutely outstanding experience from start to finish. The quality of service exceeded my expectations and I'll definitely be recommending to friends and colleagues.",
      postDate: "July 21, 2025",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      id: 3,
      name: "Courtney Henry",
      rating: 4,
      review:
        "Very satisfied with the overall experience. There were a couple minor hiccups but the team resolved them quickly and professionally.",
      postDate: "July 20, 2025",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    },
    {
      id: 4,
      name: "Devon Lane",
      rating: 4.5,
      review:
        "Consistently great service. I've been a customer for several years now and they continue to impress with their reliability and quality.",
      postDate: "July 18, 2025",
      avatar: "https://randomuser.me/api/portraits/men/75.jpg",
    },
  ];

  // Rating distribution data
  const ratingDistribution = [
    { label: "Excellent", count: 1000, percentage: 100, color: "#4CAF50" },
    { label: "Good", count: 800, percentage: 80, color: "#8BC34A" },
    { label: "Average", count: 600, percentage: 60, color: "#FFC107" },
    { label: "Below Average", count: 100, percentage: 10, color: "#FF9800" },
    { label: "Poor", count: 50, percentage: 5, color: "#F44336" },
  ];

  // Function to render star icons
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-warning" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-warning" />);
      } else {
        stars.push(<FaStar key={i} className="text-secondary opacity-25" />);
      }
    }

    return stars;
  };

  return (
    <div className="container py-4" style={{ maxWidth: "1200px" }}>
      {/* Overall Rating Section */}
      <div className="card mb-4 border-0 shadow-sm">
        <div className="card-body p-4">
          <div className="row align-items-center">
            <div className="col-md-5 text-center border-end pe-md-4">
              <h2 className="display-4 fw-bold mb-1 text-dark">4.8</h2>
              <div className="d-flex justify-content-center mb-2 fs-1">
                {renderStars(4.8)}
              </div>
              <p className="text-muted mb-0">
                Based on <span className="fw-semibold">2,550</span> reviews
              </p>
            </div>

            {/* Rating Breakdown */}
            <div className="col-md-7 ps-md-4 mt-3 mt-md-0">
              <h5 className="fw-semibold mb-3">Rating Breakdown</h5>
              {ratingDistribution.map((item, index) => (
                <div key={index} className="mb-2">
                  <div className="d-flex justify-content-between mb-1">
                    <div className="d-flex align-items-center">
                      <span className="me-2" style={{ minWidth: "100px" }}>
                        {item.label}
                      </span>
                      <span className="text-muted">{item.count}</span>
                    </div>
                    <span className="text-muted">{item.percentage}%</span>
                  </div>
                  <div
                    className="progress"
                    style={{ height: "8px", borderRadius: "4px" }}
                  >
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                        borderRadius: "4px",
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Customer Reviews</h4>
        {/* <button className="btn btn-link text-primary p-0 fw-semibold d-flex align-items-center">
          View all <IoIosArrowForward className="ms-1" />
        </button> */}
      </div>

      <div className="row g-4">
        {reviews.map((review) => (
          <div key={review.id} className="col-md-6">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between mb-3">
                  <div className="d-flex align-items-center">
                    <img
                      src={review.avatar}
                      alt={review.name}
                      className="rounded-circle me-3"
                      style={{
                        width: "48px",
                        height: "48px",
                        objectFit: "cover",
                      }}
                    />
                    <div>
                      <h6 className="mb-0 fw-semibold">{review.name}</h6>
                      <div className="d-flex align-items-center">
                        {renderStars(review.rating)}
                        <span className="ms-2 text-muted small">
                          {review.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-muted small">{review.postDate}</span>
                </div>
                <p className="card-text text-dark mt-3">{review.review}</p>
                {/* <div className="mt-3 pt-2 border-top">
                  <button className="btn btn-sm btn-outline-primary me-2">
                    Helpful
                  </button>
                  <button className="btn btn-sm btn-outline-secondary">
                    Comment
                  </button>
                </div> */}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {/* <div className="text-center mt-5">
        <button className="btn btn-primary px-4 py-2 fw-semibold">
          Load More Reviews
        </button>
      </div> */}
    </div>
  );
};

export default CustomerReviews;
