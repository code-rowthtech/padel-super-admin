import React from 'react'
import { DataLoading } from '../../../helpers/loading/Loaders';
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import { player2 } from "../../../assets/files";

const MatchRightBar = ({ 
  showCreateButton, 
  setShowCreateButton, 
  createMatchesHandle, 
  reviewLoading, 
  reviewData 
}) => {
    return (
        <>
            <div className="ms-0 ms-lg-2 mt-md-3 mt-2">
                {showCreateButton && (
                    <div
                        className="row align-items-center text-white rounded-4 py-0 ps-md-4 ps-3 add_height_mobile_banner mx-auto d-flex d-md-none"
                        style={{
                            backgroundImage: `linear-gradient(269.34deg, rgba(255, 255, 255, 0) 0.57%, rgba(17, 24, 39, 0.6) 94.62%), url(${player2})`,
                            position: "relative",
                            backgroundSize: "cover",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "right center",
                            height: "312px",
                            borderRadius: "20px",
                            overflow: "hidden",
                            marginTop: "-10px",
                        }}
                    >
                        <div className="col-12 col-md-6 mb-1 text-start mb-md-0">
                            <h4 className="open-match-img-heading text-nowrap">
                                Got a score to <br /> settle?
                            </h4>
                            <p className="text-light font_small_size">
                                Great for competitive vibes.
                            </p>
                            <button
                                className="btn shadow border-0 create-match-btn mt-lg-2 rounded-pill mb-md-3 mb-0 ps-3 pe-3 font_size_data"
                                onClick={() => {
                                    localStorage.setItem('hideCreateButton', 'true');
                                    setShowCreateButton(false);
                                    createMatchesHandle();
                                }}
                                style={{
                                    background: "#fff",
                                    fontSize: "14px",
                                    fontFamily: "Poppins",
                                    fontWeight: "500",
                                    color: "#0034E4"
                                }}
                                aria-label="Create open matches"
                            >
                                Create Open Matches
                            </button>

                        </div>
                    </div>
                )}
                <div
                    className="row align-items-center text-white rounded-4 py-0 ps-md-4 ps-3 add_height_mobile_banner d-none d-md-flex"
                    style={{
                        backgroundImage: `linear-gradient(269.34deg, rgba(255, 255, 255, 0) 0.57%, rgba(17, 24, 39, 0.6) 94.62%), url(${player2})`,
                        position: "relative",
                        backgroundSize: "cover",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right center",
                        height: "312px",
                        borderRadius: "20px",
                        overflow: "hidden",
                        marginTop: "-20px",
                    }}
                >
                    <div className="col-12 col-md-6 mb-1 text-start mb-md-0">
                        <h4 className="open-match-img-heading text-nowrap">
                            Got a score to <br /> settle?
                        </h4>
                        <p className="text-light font_small_size">
                            Great for competitive vibes.
                        </p>
                        <button
                            className="btn shadow border-0 create-match-btn mt-lg-3 text-white rounded-pill mb-md-2 mb-0 py-3 ps-3 pe-3 font_size_data"
                            onClick={createMatchesHandle}
                            style={{
                                background:
                                    "linear-gradient(180deg, #0034E4 0%, #001B76 100%)",
                                fontSize: "15px",
                                fontFamily: "Poppins",
                                fontWeight: "500",
                            }}
                            aria-label="Create open matches"
                        >
                            Create Open Matches
                        </button>
                    </div>
                </div>
                <div
                    className="px-4 py-4 row rounded-4 border mt-3 mb-5 h-100 d-none d-md-flex"
                    style={{ backgroundColor: "#F6F7FB" }}
                >
                    {reviewLoading ? (
                        <DataLoading />
                    ) : (
                        <>
                            <div className="col-12 border-end col-lg-4 pe-lg-3 text-center d-lg-flex align-items-center justify-content-center mb-4 mb-md-0 ps-0">
                                <div className="w-100">
                                    <p
                                        className="mb-0"
                                        style={{
                                            fontSize: "16px",
                                            fontWeight: "500",
                                            color: "#111",
                                            fontFamily: "Poppins",
                                        }}
                                    >
                                        Overall Rating
                                    </p>
                                    <div className="d-flex flex-lg-column align-items-center justify-content-center">
                                        <div
                                            className="mb-2"
                                            style={{
                                                fontFamily: "Poppins",
                                                fontWeight: "600",
                                                fontSize: "40px",
                                                color: "#111",
                                            }}
                                        >
                                            {reviewData?.averageRating?.toFixed(1) || "0.0"}
                                        </div>
                                        <div className="mb-2 d-flex gap-lg-0">
                                            {[...Array(5)].map((_, i) => {
                                                const rating = reviewData?.averageRating || 0;
                                                if (i < Math.floor(rating)) {
                                                    return (
                                                        <StarIcon
                                                            key={i}
                                                            style={{
                                                                color: "#32B768",
                                                                fontSize: "25px",
                                                            }}
                                                        />
                                                    );
                                                } else if (i < rating && rating % 1 >= 0.5) {
                                                    return (
                                                        <StarHalfIcon
                                                            key={i}
                                                            style={{
                                                                color: "#32B768",
                                                                fontSize: "25px",
                                                            }}
                                                        />
                                                    );
                                                } else {
                                                    return (
                                                        <StarBorderIcon
                                                            key={i}
                                                            style={{ color: "#ccc", fontSize: "25px" }}
                                                        />
                                                    );
                                                }
                                            })}
                                        </div>
                                        <div
                                            className="text-muted ps-0 pb-2"
                                            style={{
                                                fontSize: "12px",
                                                fontWeight: "400",
                                                fontFamily: "Poppins",
                                            }}
                                        >
                                            Based on {reviewData?.totalReviews || 0} reviews
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 col-lg-8 ps-lg-4 pe-0">
                                <div className="w-100">
                                    {[5, 4, 3, 2, 1].map((star, idx) => {
                                        const total = reviewData?.totalReviews || 1;
                                        let count = 0;
                                        if (star === 5)
                                            count = reviewData?.ratingCounts?.Excellent || 0;
                                        else if (star === 4)
                                            count = reviewData?.ratingCounts?.Good || 0;
                                        else if (star === 3)
                                            count = reviewData?.ratingCounts?.Average || 0;
                                        else if (star <= 2)
                                            count = reviewData?.ratingCounts?.Below || 0;

                                        const percent = Math.round((count / total) * 100);

                                        return (
                                            <div
                                                key={star}
                                                className="d-flex align-items-center mb-3 gap-3"
                                                style={{ width: "100%" }}
                                            >
                                                <div
                                                    className="text-nowrap"
                                                    style={{
                                                        width: "110px",
                                                        minWidth: "110px",
                                                        fontSize: "14px",
                                                        fontWeight: "500",
                                                        fontFamily: "Poppins",
                                                        color: "#111",
                                                    }}
                                                >
                                                    {star === 5
                                                        ? "Excellent"
                                                        : star === 4
                                                            ? "Good"
                                                            : star === 3
                                                                ? "Average"
                                                                : star === 2
                                                                    ? "Below Average"
                                                                    : "Poor"}
                                                </div>

                                                <div
                                                    className="progress flex-grow-1 border"
                                                    style={{
                                                        height: "10px",
                                                        backgroundColor: "#eee",
                                                        minWidth: 0,
                                                    }}
                                                >
                                                    <div
                                                        className="progress-bar"
                                                        style={{
                                                            width: `${percent}%`,
                                                            backgroundColor:
                                                                star === 5
                                                                    ? "#3DBE64"
                                                                    : star === 4
                                                                        ? "#7CBA3D"
                                                                        : star === 3
                                                                            ? "#ECD844"
                                                                            : star === 2
                                                                                ? "#FC702B"
                                                                                : "#E9341F",
                                                            transition: "width 0.4s ease",
                                                        }}
                                                    />
                                                </div>

                                                {/* <small className="text-muted ms-2" style={{ fontSize: "12px" }}>
                      {count}
                    </small> */}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    )
}

export default MatchRightBar