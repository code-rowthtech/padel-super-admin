import React, { useState } from "react";
import { Card, OverlayTrigger, Tooltip } from "react-bootstrap";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import { IoStar } from "react-icons/io5";
import { MdOutlineStar } from "react-icons/md";

export const ReviewCard = ({ review, reviews = [] }) => {
    // Static fake reviews
    const staticReviews = [
        {
            _id: 'static1',
            reviewRating: 5,
            reviewComment: 'Amazing padel experience! The courts are well-maintained and the booking system is super easy to use.',
            userId: { name: 'Rajesh Kumar' },
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
        },
        {
            _id: 'static2', 
            reviewRating: 4.5,
            reviewComment: 'Great facilities and friendly staff. Love playing here with my friends every weekend.',
            userId: { name: 'Priya Sharma' },
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
        },
        {
            _id: 'static3',
            reviewRating: 4,
            reviewComment: 'Good courts and equipment. The online booking makes it very convenient to reserve slots.',
            userId: { name: 'Amit Patel' },
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
        },
        {
            _id: 'static4',
            reviewRating: 5,
            reviewComment: 'Excellent padel club! Clean facilities, professional courts, and great community of players.',
            userId: { name: 'Sneha Gupta' },
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
        }
    ];

    // If review prop is passed, use it; otherwise use combined reviews
    const allReviews = review ? [review] : [...reviews, ...staticReviews];
    const currentReview = review || allReviews[0];
    
    const rating = currentReview?.reviewRating || 0;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    const [showFullText, setShowFullText] = useState(false);

    const truncateText = (text, charLimit = 120) => {
        if (!text) return "";
        if (text.length <= charLimit) return text;
        return text.substring(0, charLimit) + '...';
    };

    const reviewText = currentReview?.reviewComment || "";
    const isLongText = reviewText.length > 120;
    const displayText = truncateText(reviewText, 120);

    return (
        <Card
            className="p-md-4 p-4 mx-md-2 h-100 mx-0 shadow-sm d-flex flex-column  justify-content-between height_mention"
            style={{
                borderRadius: "27px",
                backgroundColor: "#012FCF26",
                border: "none",
                fontFamily: "Poppins",
                // height: "230px",
                width: "auto",
                margin: "0"
            }}
        >
            <div className="flex-grow-1 d-flex flex-column padding_top_none"
            //  style={{ paddingTop: "30px" }}
             >
                {isLongText ? (
                    <OverlayTrigger
                        placement="top"
                        overlay={
                            <Tooltip id={`tooltip-${currentReview?._id}`} style={{ maxWidth: '300px' }}>
                                {reviewText}
                            </Tooltip>
                        }
                    >
                        <p className="text-start d-flex align-items-start justify-content-start mb-md-3 mb-2 flex-grow-1 home-upcoming-heading-mobile"
                            style={{
                                fontSize: "19px",
                                color: "#000000",
                                fontWeight: "500",
                                fontFamily: "Inter",
                                margin: "0",
                                cursor: "pointer",
                                minHeight: "120px",
                                overflow: "hidden",
                                textAlign: "center",
                                display: "flex",
                                alignItems: "center"
                            }}
                        >
                            "{displayText}"
                        </p>
                    </OverlayTrigger>
                ) : (
                    <p className="text-start d-flex align-items-start justify-content-start mb-md-3 mb-2 flex-grow-1 home-upcoming-heading-mobile"
                        style={{
                            fontSize: "19px",
                            color: "#000000",
                            fontWeight: "500",
                            fontFamily: "Inter",
                            margin: "0",
                            minHeight: "74px",
                            overflow: "hidden",
                            textAlign: "center",
                            display: "flex",
                            alignItems: "center"
                        }}
                    >
                        "{reviewText}"
                    </p>
                )}
            </div>

            <div className="d-flex align-items-center mb-lg-0 mb-0 justify-content-between gap-3" style={{ marginTop: "5px" }}>
                <div className="d-flex align-items-center gap-2">
                    <img
                        src={
                            currentReview?.avatar ||
                            "https://t4.ftcdn.net/jpg/15/13/35/75/360_F_1513357508_F3lTOCrYHHjBB8Lb3K9IBfS4IPLyNcrJ.jpg"
                        }
                        alt={currentReview?.userId?.name}
                        className="rounded-circle"
                        width="35"
                        height="35"
                    />
                    <h6
                        style={{
                            margin: 0,
                            fontSize: "20px",
                            fontWeight: "600",
                            color: "#111827",
                            fontFamily: "Inter"
                        }}
                        className="step-heading-data"
                    >
                        {currentReview?.userId?.name?.charAt(0).toUpperCase() +
                            currentReview?.userId?.name?.slice(1) || "Anonymous"}
                    </h6>
                </div>
                <div className="d-flex align-items-center">
                    {[...Array(fullStars)].map((_, i) => (
                        <StarIcon key={i} style={{ fontSize: "30px", color: "#22C55E" }} className="add_font_star" />
                    ))}
                    {hasHalfStar && (
                        <StarHalfIcon style={{ fontSize: "30px", color: "#22C55E" }} className="add_font_star" />
                    )}
                    {[...Array(emptyStars)].map((_, i) => (
                        <MdOutlineStar
                            key={i}
                            style={{ fontSize: "30px", color: "#F5F5F5" }}
                            className="add_font_star"
                        />
                    ))}
                </div>
            </div>
        </Card>
    );
};

// Export function to get all reviews (API + static)
export const getAllReviews = (apiReviews = []) => {
    const staticReviews = [
        {
            _id: 'static1',
            reviewRating: 5,
            reviewComment: 'Amazing padel experience! The courts are well-maintained and the booking system is super easy to use.',
            userId: { name: 'Rajesh Kumar' },
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
        },
        {
            _id: 'static2', 
            reviewRating: 4.5,
            reviewComment: 'Great facilities and friendly staff. Love playing here with my friends every weekend.',
            userId: { name: 'Priya Sharma' },
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
        },
        {
            _id: 'static3',
            reviewRating: 4,
            reviewComment: 'Good courts and equipment. The online booking makes it very convenient to reserve slots.',
            userId: { name: 'Amit Patel' },
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
        },
        {
            _id: 'static4',
            reviewRating: 5,
            reviewComment: 'Excellent padel club! Clean facilities, professional courts, and great community of players.',
            userId: { name: 'Sneha Gupta' },
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
        }
    ];
    
    return [...apiReviews, ...staticReviews];
};