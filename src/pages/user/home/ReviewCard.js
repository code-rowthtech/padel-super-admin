import React, { useState } from "react";
import { Card } from "react-bootstrap";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import { IoStar } from "react-icons/io5";
import { MdOutlineStar } from "react-icons/md";

export const ReviewCard = ({ review }) => {
    const rating = review?.reviewRating || 0;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    const [showFullText, setShowFullText] = useState(false);

    const truncateText = (text, wordLimit) => {
        if (!text) return "";
        const words = text.split(' ');
        if (words.length <= wordLimit) return text;
        return words.slice(0, wordLimit).join(' ') + '...';
    };

    const reviewText = review?.reviewComment || "";
    const displayText = showFullText ? reviewText : truncateText(reviewText, 20);

    return (
        <Card
            className="p-4 ms-3 me-3 shadow-sm d-flex flex-column  justify-content-between"
            style={{
                borderRadius: "27px",
                backgroundColor: "#012FCF26",
                border: "none",
                fontFamily: "Poppins",
                height: "300px",
                width: "auto",
                margin: "0"
            }}
        >
            <div className="flex-grow-1 d-flex flex-column" style={{ paddingTop: "30px" }}>
                <p className="text-start d-flex align-items-center justify-content-start mb-0 flex-grow-1"
                    style={{
                        fontSize: "19px",
                        color: "#000000",
                        fontWeight: "500",
                        fontFamily: "Inter",
                        margin: "0",
                        cursor: reviewText.split(' ').length > 20 ? "pointer" : "default",
                        minHeight: "150px",
                        overflow: "hidden",
                        textAlign: "center"
                    }}
                    title={reviewText.split(' ').length > 20 ? reviewText : ""}
                >
                    "{truncateText(reviewText, 20)}"
                </p>
            </div>

            <div className="d-flex align-items-center mb-lg-5 mb-3 justify-content-between gap-3" style={{ marginTop: "5px" }}>
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
                            fontSize: "23px",
                            fontWeight: "600",
                            color: "#111827",
                            fontFamily:"Inter"
                        }}
                    >
                        {review?.userId?.name?.charAt(0).toUpperCase() +
                            review?.userId?.name?.slice(1) || "Anonymous"}
                    </h6>
                    <div className="d-flex align-items-center">
                        {[...Array(fullStars)].map((_, i) => (
                            <StarIcon key={i} style={{ fontSize: "30px", color: "#22C55E" }} />
                        ))}
                        {hasHalfStar && (
                            <StarHalfIcon style={{ fontSize: "30px", color: "#22C55E" }} />
                        )}
                        {[...Array(emptyStars)].map((_, i) => (
                            <MdOutlineStar
                                key={i}
                                style={{ fontSize: "30px", color: "#F5F5F5" }}
                            />
                        ))}
                    </div>
                </div>
        </Card>
    );
};