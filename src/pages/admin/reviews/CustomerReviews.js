import { useEffect, useState } from "react";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";
import {
  getOwnerRegisteredClub,
  getReviewsForOwner,
} from "../../../redux/thunks";
import { useSelector, useDispatch } from "react-redux";
import { getOwnerFromSession } from "../../../helpers/api/apiCore";
import { format } from "date-fns";
import { FaCircleUser } from "react-icons/fa6";
import { DataLoading } from "../../../helpers/loading/Loaders";

const CustomerReviews = () => {
  const dispatch = useDispatch();
  const Owner = getOwnerFromSession();
  const ownerId = Owner?.generatedBy || Owner?._id;
  const { reviewsData, reviewsLoading } = useSelector(
    (state) => state?.reviews
  );
  const { ownerClubLoading } = useSelector((s) => s.manualBooking);
  // State for pagination
  const [visibleReviews, setVisibleReviews] = useState(10);
  const [allReviews, setAllReviews] = useState([]);

  // Update allReviews when reviewsData changes
  useEffect(() => {
    if (reviewsData?.reviews) {
      setAllReviews(reviewsData.reviews);
    }
  }, [reviewsData]);

  // Function to load more reviews
  const loadMoreReviews = () => {
    setVisibleReviews((prevVisibleReviews) => prevVisibleReviews + 10);
  };

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

  useEffect(() => {
    dispatch(getOwnerRegisteredClub({ ownerId }))
      .unwrap()
      .then((res) => {
        dispatch(getReviewsForOwner({ clubId: res?.[0]?._id }));
      });
  }, [dispatch]);

  return (
    <div className="container py-4" style={{ maxWidth: "1200px" }}>
      {reviewsLoading || ownerClubLoading ? (
        <DataLoading height="70vh" size={90} />
      ) : (
        <>
          {/* Overall Rating Section */}
          <div className="card mb-4 border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="row align-items-center">
                <div className="col-md-5 text-center border-end pe-md-4">
                  <h2 className="display-4 fw-bold mb-1 text-dark">
                    {reviewsData?.averageRating}
                  </h2>
                  <div className="d-flex justify-content-center mb-2 fs-1">
                    {renderStars(reviewsData?.averageRating)}
                  </div>
                  <p className="text-muted mb-0">
                    Based on
                    <span className="fw-semibold">
                      {reviewsData?.totalReviews}
                    </span>
                    reviews
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
          </div>

          <div className="row g-4">
            {allReviews.slice(0, visibleReviews).map((review) => (
              <div key={review.id} className="col-md-6">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between mb-3">
                      <div className="d-flex align-items-center">
                        <FaCircleUser size={48} className="me-3" />
                        <div>
                          <h6 className="mb-0 fw-semibold">
                            {review.userId?.name}
                          </h6>
                          <div className="d-flex align-items-center">
                            {renderStars(review.reviewRating)}
                            <span className="ms-2 text-muted small">
                              {review.reviewRating?.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="text-muted small">
                        {format(
                          new Date(review?.createdAt),
                          "dd/MM/yyyy | hh:mm a"
                        )}
                      </span>
                    </div>
                    <p className="card-text text-dark mt-3">
                      {review.reviewComment}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button - Only show if there are more reviews to load */}
          {allReviews.length > visibleReviews && (
            <div className="text-center mt-5">
              <button
                className="btn px-4 py-2 fw-semibold text-white"
                style={{
                  backgroundColor: "#22c55e",
                }}
                onClick={loadMoreReviews}
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CustomerReviews;
