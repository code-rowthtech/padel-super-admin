import React from "react";
import { Card } from "react-bootstrap";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarHalfIcon from "@mui/icons-material/StarHalf";

export const ReviewCard = ({ review }) => {
    const rating = review?.reviewRating || 0;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <Card
            className="p-4 text-center shadow-sm d-flex  justify-content-center align-items-start"
            style={{
                borderRadius: "20px",
                backgroundColor: "#012FCF26",
                border: "none",
                fontFamily: "Poppins",
                height: "300px",
                width: "400px"
            }}
        >
            <div>
                <p className="text-start mb-3"
                    style={{
                        fontSize: "14px",
                        color: "#4B5563",
                        fontWeight: "400",
                        margin: "0",
                    }}
                >
                    "{review?.reviewComment}"
                </p>

                <div className="d-flex align-items-center justify-content-between gap-5">
                    <img
                        src={
                            review?.avatar ||
                            "https://t4.ftcdn.net/jpg/15/13/35/75/360_F_1513357508_F3lTOCrYHHjBB8Lb3K9IBfS4IPLyNcrJ.jpg"
                        }
                        alt={review?.userId?.name}
                        className="rounded-circle"
                        width="35"
                        height="35"
                    />
                    <h6
                        style={{
                            margin: 0,
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#111827",
                        }}
                    >
                        {review?.userId?.name?.charAt(0).toUpperCase() +
                            review?.userId?.name?.slice(1) || "Anonymous"}
                    </h6>
                    <div className="d-flex align-items-center">
                        {[...Array(fullStars)].map((_, i) => (
                            <StarIcon key={i} style={{ fontSize: "16px", color: "#22C55E" }} />
                        ))}
                        {hasHalfStar && (
                            <StarHalfIcon style={{ fontSize: "16px", color: "#22C55E" }} />
                        )}
                        {[...Array(emptyStars)].map((_, i) => (
                            <StarBorderIcon
                                key={i}
                                style={{ fontSize: "16px", color: "#9CA3AF" }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
};