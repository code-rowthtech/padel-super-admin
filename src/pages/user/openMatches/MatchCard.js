import React from 'react'
import { DataLoading } from '../../../helpers/loading/Loaders';

const MatchCard = ({ 
  matchLoading,
  filteredMatches,
  matchCardRefs,
  setSelectedMatch,
  setShowViewMatch,
  showShareDropdown,
  shareDropdownRef,
  copyMatchCardWithScreenshot,
  formatMatchDate,
  formatTimes,
  calculateMatchPrice,
  showSuccess,
  showError,
  setShowShareDropdown,
  FaMapMarkerAlt,
  AvailableTag,
  PlayerAvatar,
  IoIosArrowForward,
  setShowModal,
  setMatchId,
  setTeamName,
  getInitials,
  tabs,
  activeTab,
  selectedLevel,FirstPlayerTag
}) => {
    return (
        <>
            <div
                style={{
                    minHeight: window.innerWidth <= 768 ? (filteredMatches?.length <= 2 ? "auto" : "500px") : "400px",
                    height: window.innerWidth <= 768 ? (filteredMatches?.length <= 2 ? "auto" : "500px") : "400px",
                    maxHeight: window.innerWidth <= 768 ? (filteredMatches?.length > 2 ? "500px" : "auto") : (filteredMatches?.length > 4 ? "380px" : "auto"),
                    overflowY: window.innerWidth <= 768 ? (filteredMatches?.length > 2 ? "auto" : "visible") : (filteredMatches?.length > 4 ? "auto" : "auto"),
                    scrollBehavior: "smooth",
                    paddingBottom: window.innerWidth <= 768 ? "400px" : "0px",
                }}
                className="no-scrollbar"
            >
                {matchLoading ? (
                    <DataLoading height={380} />
                ) : filteredMatches?.length > 0 ? (
                    <div className="row mx-auto">
                        {filteredMatches?.map((match, index) => (
                            <div
                                className="col-lg-6 col-12 ps-0  pe-0 gap-2"
                                key={index}
                            >
                                <div className="row px-1">
                                    <div className="col">
                                        <div
                                            ref={(el) => (matchCardRefs.current[`desktop-${index}`] = el)}
                                            className="card  mb-2 py-3 p-0 pb-3 shadow-0 rounded-2 d-md-block d-none"
                                            style={{
                                                backgroundColor: "#CBD6FF1A",
                                                border: "0.45px solid #0000001A",
                                                boxShadow: "none",
                                                height: "11rem",
                                                cursor: "pointer"
                                            }}
                                            onClick={() => {
                                                setSelectedMatch(match);
                                                setShowViewMatch(true);
                                                if (window.innerWidth <= 768) {
                                                    localStorage.setItem('mobileViewMatch', 'true');
                                                    localStorage.setItem('mobileSelectedMatch', JSON.stringify(match));
                                                    window.location.hash = 'viewmatch';
                                                }
                                            }}
                                        >
                                            <div className="position-absolute top-0 end-0 p-2 pb-2 pt-0  d-flex gap-1 position-relative" ref={showShareDropdown === `desktop-${index}` ? shareDropdownRef : null}>
                                                <button
                                                    className="btn rounded-circle p-1 mb-2 d-flex align-items-center justify-content-center"
                                                    style={{ width: 24, height: 24, backgroundColor: "transparent", border: "none" }}
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        const matchCardElement = matchCardRefs.current[`desktop-${index}`];

                                                        if (matchCardElement) {
                                                            await copyMatchCardWithScreenshot(matchCardElement, match);
                                                        } else {
                                                            const matchData = `Match: ${formatMatchDate(match.matchDate)} | ${formatTimes(match.slot)}
                                        Club: ${match?.clubId?.clubName}
                                        Level: ${match?.skillLevel}
                                        Price: ₹${calculateMatchPrice(match?.slot)}`;

                                                            if (navigator.clipboard?.writeText) {
                                                                navigator.clipboard.writeText(matchData)
                                                                    .then(() => showSuccess("Match details copied to clipboard!"))
                                                                    .catch(() => showError("Could not copy to clipboard"));
                                                            } else {
                                                                showError("Clipboard not supported on this device");
                                                            }
                                                        }
                                                    }}
                                                >
                                                    <i className="bi bi-copy" style={{ fontSize: "12px", color: "#1F41BB" }} />
                                                </button>

                                                {showShareDropdown === `desktop-${index}` && (
                                                    <div className="position-absolute bg-white border rounded shadow-sm" style={{ top: "30px", right: 0, zIndex: 1000, minWidth: "120px" }}>
                                                        <button className="btn btn-light w-100 d-flex align-items-center gap-2 border-0 rounded-0" onClick={(e) => { e.stopPropagation(); const url = window.location.href; const text = `Check out this Padel match on ${formatMatchDate(match.matchDate)} at ${formatTimes(match.slot)}`; window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, "_blank"); setShowShareDropdown(null); }}>
                                                            <i className="bi bi-facebook" style={{ color: "#1877F2" }} />Facebook
                                                        </button>
                                                        <button className="btn btn-light w-100 d-flex align-items-center gap-2 border-0 rounded-0" onClick={(e) => { e.stopPropagation(); const url = window.location.href; const text = `Check out this Padel match on ${formatMatchDate(match.matchDate)} at ${formatTimes(match.slot)}`; window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank"); setShowShareDropdown(null); }}>
                                                            <i className="bi bi-twitter-x" style={{ color: "#000000" }} />X
                                                        </button>
                                                        <button className="btn btn-light w-100 d-flex align-items-center gap-2 border-0 rounded-0" onClick={(e) => { e.stopPropagation(); const url = window.location.href; const text = `Check out this Padel match on ${formatMatchDate(match.matchDate)} at ${formatTimes(match.slot)}`; if (navigator.share) { navigator.share({ url, text }); } setShowShareDropdown(null); }}>
                                                            <i className="bi bi-instagram" style={{ color: "#E4405F" }} />Instagram
                                                        </button>
                                                        <button className="btn btn-light w-100 d-flex align-items-center gap-2 border-0 rounded-0" onClick={(e) => { e.stopPropagation(); const url = window.location.href; const text = `Check out this Padel match on ${formatMatchDate(match.matchDate)} at ${formatTimes(match.slot)}`; window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, "_blank"); setShowShareDropdown(null); }}>
                                                            <i className="bi bi-whatsapp" style={{ color: "#25D366" }} />WhatsApp
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="row px-2 mx-auto px-md-0 py-2 d-flex justify-content-between align-items- flex-wrap">
                                                <div className="col-lg-7 pb-0 col-6">
                                                    <p
                                                        className="mb-0 all-match-time text-nowrap"
                                                        style={{ fontWeight: "600" }}
                                                    >
                                                        {formatMatchDate(match?.matchDate)} |{" "}
                                                        {match?.formattedMatchTime || formatTimes(match?.slot)}
                                                        <i className="bi bi-share ms-2" onClick={(e) => { e.stopPropagation(); setShowShareDropdown(showShareDropdown === `desktop-${index}` ? null : `desktop-${index}`); }} style={{ fontSize: "12px", color: "#1F41BB", cursor: "pointer" }} />
                                                    </p>
                                                    <span className="text-muted all-match-name-level ms-0 d-none d-md-inline">
                                                        {match?.skillLevel
                                                            ? match?.skillLevel.charAt(0).toUpperCase() +
                                                            match?.skillLevel.slice(1)
                                                            : "N/A"} | {match?.gender}
                                                    </span>
                                                    <p className="all-match-time   mb-0 d-md-none d-lg-none">
                                                        {match?.skillLevel
                                                            ? match?.skillLevel.charAt(0).toUpperCase() +
                                                            match?.skillLevel.slice(1)
                                                            : "N/A"} | {match?.gender}
                                                    </p>

                                                    <div
                                                        className="d-flex align-items-start mt-lg-4 pb-0 flex-column justify-content-start"
                                                        style={{ width: "100%", maxWidth: "100%" }}
                                                    >
                                                        <p
                                                            className="mb-1 all-match-name-level mt-2"
                                                            style={{
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis",
                                                                whiteSpace: "nowrap",
                                                                maxWidth: "100%"
                                                            }}
                                                        >
                                                            {match?.clubId?.clubName || "Unknown Club"}
                                                        </p>
                                                        <p
                                                            className="mb-3 text-muted all-match-name-level"
                                                            style={{
                                                                fontSize: "10px",
                                                                fontWeight: "400",
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis",
                                                                whiteSpace: "nowrap",
                                                                maxWidth: "100%"
                                                            }}
                                                        >
                                                            <FaMapMarkerAlt
                                                                className="me-1"
                                                                style={{ fontSize: "10px" }}
                                                            />
                                                            {match?.clubId?.city
                                                                ?.charAt(0)
                                                                ?.toUpperCase() +
                                                                match?.clubId?.city?.slice(1) || "N/A"}{" "}
                                                            {match?.clubId?.zipCode || ""}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="col-6 col-lg-5 d-flex justify-content-end align-items-center">
                                                    <div className="d-flex flex-column align-items-end">
                                                        <div className="d-flex align-items-center mb-4">
                                                            {match?.teamA?.length === 1 ||
                                                                match?.teamA?.length === 0 ? (
                                                                <AvailableTag
                                                                    team="Team A"
                                                                    match={match}
                                                                    name="teamA"
                                                                />
                                                            ) : match?.teamB?.length === 1 ||
                                                                match?.teamB?.length === 0 ? (
                                                                <AvailableTag
                                                                    team="Team B"
                                                                    match={match}
                                                                    name="teamB"
                                                                />
                                                            ) : match?.teamA?.length === 2 &&
                                                                match?.teamB?.length === 2 ? (
                                                                <FirstPlayerTag
                                                                    player={match?.teamA[0]?.userId}
                                                                />
                                                            ) : null}

                                                            <div className="d-flex align-items-center ms-2">
                                                                {[
                                                                    ...(match?.teamA?.filter((_, idx) =>
                                                                        match?.teamA?.length === 2 &&
                                                                            match?.teamB?.length === 2
                                                                            ? idx !== 0
                                                                            : true
                                                                    ) || []),
                                                                    ...(match?.teamB || []),
                                                                ]?.map((player, idx, arr) => (
                                                                    <PlayerAvatar
                                                                        key={`player-${idx}`}
                                                                        player={player}
                                                                        idx={idx}
                                                                        total={arr?.length}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div
                                                            className="d-flex align-items-center mt-lg-4 justify-content-end"
                                                            style={{ width: "100%" }}
                                                        >
                                                            <div
                                                                className="d-flex align-items-center gap-1"
                                                                style={{
                                                                    fontWeight: 500,
                                                                    fontSize: "20px",
                                                                    fontFamily: "none",
                                                                    color: "#1F41BB",
                                                                }}
                                                            >
                                                                ₹
                                                                <span
                                                                    style={{
                                                                        fontSize: "28px",
                                                                        fontWeight: 600,
                                                                        fontFamily: "Poppins",
                                                                        color: "#1F41BB",
                                                                    }}
                                                                >
                                                                    {Number(calculateMatchPrice(match?.slot) || 0).toLocaleString('en-IN')}
                                                                </span>
                                                                <button
                                                                    className="btn rounded-pill d-flex justify-content-center align-items-center text-dark p-0 border-0"
                                                                    onClick={() => {
                                                                        setSelectedMatch(match);
                                                                        setShowViewMatch(true);
                                                                        if (window.innerWidth <= 768) {
                                                                            localStorage.setItem('mobileViewMatch', 'true');
                                                                            localStorage.setItem('mobileSelectedMatch', JSON.stringify(match));
                                                                            window.location.hash = 'viewmatch';
                                                                        }
                                                                    }}
                                                                    aria-label={`View match on ${formatMatchDate(
                                                                        match?.matchDate
                                                                    )}`}
                                                                >
                                                                    <IoIosArrowForward />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    ref={(el) => (matchCardRefs.current[`mobile-${index}`] = el)}
                                    className="card  mb-2 py-2 p-0 shadow-0 rounded-3 d-block d-md-none"
                                    style={{
                                        backgroundColor: "#CBD6FF1A",
                                        border: "0.45px solid #0000001A",
                                        boxShadow: "none",
                                    }}
                                    onClick={() => {
                                        setSelectedMatch(match);
                                        setShowViewMatch(true);
                                        if (window.innerWidth <= 768) {
                                            localStorage.setItem('mobileViewMatch', 'true');
                                            localStorage.setItem('mobileSelectedMatch', JSON.stringify(match));
                                            window.location.hash = 'viewmatch';
                                        }
                                    }}
                                >
                                    <div className="position-absolute top-0 end-0 p-2 d-flex gap-1 position-relative" ref={showShareDropdown === `mobile-${index}` ? shareDropdownRef : null}>
                                        <button className="btn rounded-circle p-1 d-flex align-items-center justify-content-center" style={{ width: 24, height: 24, backgroundColor: "transparent", border: "none" }} onClick={(e) => { e.stopPropagation(); setShowShareDropdown(showShareDropdown === `mobile-${index}` ? null : `mobile-${index}`); }}>
                                            <i className="bi bi-share" style={{ fontSize: "12px", color: "#1F41BB" }} />
                                        </button>

                                        <button className="btn rounded-circle p-1 d-flex align-items-center justify-content-center" style={{ width: 24, height: 24, backgroundColor: "transparent", border: "none" }} onClick={async (e) => { e.stopPropagation(); const matchCardElement = matchCardRefs.current[`mobile-${index}`]; if (matchCardElement) { await copyMatchCardWithScreenshot(matchCardElement, match); } else { const matchData = `Match: ${formatMatchDate(match.matchDate)} | ${formatTimes(match.slot)}\nClub: ${match?.clubId?.clubName}\nLevel: ${match?.skillLevel}\nPrice: ₹${calculateMatchPrice(match?.slot)}`; if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(matchData).then(() => showSuccess("Match details copied to clipboard!")).catch(() => showError("Could not copy to clipboard")); } else { showError("Clipboard not supported on this device"); } } }}>
                                            <i className="bi bi-copy" style={{ fontSize: "12px", color: "#1F41BB" }} />
                                        </button>
                                        {showShareDropdown === `mobile-${index}` && (
                                            <div className="position-absolute mt-3 bg-white border rounded shadow-sm" style={{ top: "30px", right: 0, zIndex: 1000, minWidth: "120px" }}>
                                                <button className="btn btn-light w-100 d-flex align-items-center gap-2 border-0 rounded-0" onClick={(e) => { e.stopPropagation(); const url = window.location.href; const text = `Check out this Padel match on ${formatMatchDate(match.matchDate)} at ${formatTimes(match.slot)}`; window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, "_blank"); setShowShareDropdown(null); }}>
                                                    <i className="bi bi-facebook" style={{ color: "#1877F2" }} />Facebook
                                                </button>
                                                <button className="btn btn-light w-100 d-flex align-items-center gap-2 border-0 rounded-0" onClick={(e) => { e.stopPropagation(); const url = window.location.href; const text = `Check out this Padel match on ${formatMatchDate(match.matchDate)} at ${formatTimes(match.slot)}`; window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank"); setShowShareDropdown(null); }}>
                                                    <i className="bi bi-twitter-x" style={{ color: "#000000" }} />X
                                                </button>
                                                <button className="btn btn-light w-100 d-flex align-items-center gap-2 border-0 rounded-0" onClick={(e) => { e.stopPropagation(); const url = window.location.href; const text = `Check out this Padel match on ${formatMatchDate(match.matchDate)} at ${formatTimes(match.slot)}`; if (navigator.share) { navigator.share({ url, text }); } setShowShareDropdown(null); }}>
                                                    <i className="bi bi-instagram" style={{ color: "#E4405F" }} />Instagram
                                                </button>
                                                <button className="btn btn-light w-100 d-flex align-items-center gap-2 border-0 rounded-0" onClick={(e) => { e.stopPropagation(); const url = window.location.href; const text = `Check out this Padel match on ${formatMatchDate(match.matchDate)} at ${formatTimes(match.slot)}`; window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, "_blank"); setShowShareDropdown(null); }}>
                                                    <i className="bi bi-whatsapp" style={{ color: "#25D366" }} />WhatsApp
                                                </button>
                                            </div>
                                        )}

                                    </div>
                                    <div className="row px-0 px-md-3 pt-0 pb-0 d-flex justify-content-between align-items- flex-wrap mx-auto">
                                        <div className="col-12">
                                            <p
                                                className="mb-1 all-match-time text-nowrap"
                                                style={{ fontWeight: "600" }}
                                            >
                                                {formatMatchDate(match?.matchDate)} |{" "}
                                                {formatTimes(match?.slot)}
                                            </p>
                                        </div>
                                        <div className="col-12">
                                            <span className="text-muted all-match-name-level ms-3 d-none d-md-inline">
                                                {match?.skillLevel
                                                    ? match?.skillLevel.charAt(0).toUpperCase() +
                                                    match?.skillLevel.slice(1)
                                                    : "N/A"}
                                            </span>
                                        </div>
                                        <div className="col-12 mb-2">
                                            <p className="all-match-time mb-0 d-md-none d-lg-none">
                                                {match?.skillLevel
                                                    ? match?.skillLevel.charAt(0).toUpperCase() +
                                                    match?.skillLevel.slice(1)
                                                    : "N/A"}
                                            </p>
                                        </div>
                                        <div className="row mx-auto">
                                            <div className="col-6 px-0 d-flex justify-content-between align-items-start flex-wrap d-md-flex d-md-align-items-center">
                                                {[0, 1]?.map((playerIndex) => {
                                                    const player = match?.teamA?.[playerIndex];
                                                    const isAvailable = !player;
                                                    return (
                                                        <div
                                                            key={`teamA-${playerIndex}`}
                                                            className="text-center d-flex justify-content-center align-items-center flex-column mb-2 position-relative col-6"
                                                        >
                                                            <div
                                                                className="rounded-circle border d-flex align-items-center justify-content-center"
                                                                style={{
                                                                    width: "68px",
                                                                    height: "68px",
                                                                    backgroundColor: isAvailable
                                                                        ? "#f0f0f0"
                                                                        : "rgb(31, 65, 187)",
                                                                    overflow: "hidden",
                                                                    cursor: isAvailable
                                                                        ? "pointer"
                                                                        : "default",
                                                                }}
                                                                onClick={() => {
                                                                    if (isAvailable) {
                                                                        setShowModal(true);
                                                                        setMatchId(match);
                                                                        setTeamName("teamA");
                                                                    }
                                                                }}
                                                            >
                                                                {isAvailable ? (
                                                                    <span
                                                                        style={{
                                                                            color: "#1F41BB",
                                                                            fontWeight: 600,
                                                                            fontSize: "24px",
                                                                        }}
                                                                    >
                                                                        +
                                                                    </span>
                                                                ) : player?.userId?.profilePic ? (
                                                                    <img
                                                                        src={player?.userId?.profilePic}
                                                                        alt={player?.userId?.name}
                                                                        style={{
                                                                            width: "100%",
                                                                            height: "100%",
                                                                            objectFit: "cover",
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <span
                                                                        style={{
                                                                            color: "white",
                                                                            fontWeight: 600,
                                                                            fontSize: "24px",
                                                                        }}
                                                                    >
                                                                        {getInitials(player?.userId?.name) || "A"}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span
                                                                className="mb-0 mt-2"
                                                                style={{
                                                                    maxWidth: "60px",
                                                                    overflow: "hidden",
                                                                    textOverflow: "clip",
                                                                    whiteSpace: "normal",
                                                                    display: "inline-block",
                                                                    fontSize: "10px",
                                                                    fontWeight: 600,
                                                                    fontFamily: "Poppins",
                                                                    color: isAvailable ? "#1F41BB" : "#000",
                                                                    wordBreak: "break-word",
                                                                    lineHeight: "1.2",
                                                                }}
                                                            >
                                                                {isAvailable
                                                                    ? "Available"
                                                                    : player?.userId?.name || "Player"}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <div className="col-6 px-0 d-flex justify-content-between align-items-start flex-wrap border-start border-0 border-lg-start d-md-flex d-md-align-items-center">
                                                {[0, 1].map((playerIndex) => {
                                                    const player = match?.teamB?.[playerIndex];
                                                    const isAvailable = !player;
                                                    return (
                                                        <div
                                                            key={`teamB-${playerIndex}`}
                                                            className="text-center d-flex justify-content-center align-items-center flex-column mb-2 position-relative col-6"
                                                        >
                                                            <div
                                                                className="rounded-circle border d-flex align-items-center justify-content-center"
                                                                style={{
                                                                    width: "68px",
                                                                    height: "68px",
                                                                    backgroundColor: isAvailable
                                                                        ? "#f0f0f0"
                                                                        : "rgb(31, 65, 187)",
                                                                    overflow: "hidden",
                                                                    cursor: isAvailable
                                                                        ? "pointer"
                                                                        : "default",
                                                                }}
                                                                onClick={() => {
                                                                    if (isAvailable) {
                                                                        setShowModal(true);
                                                                        setMatchId(match);
                                                                        setTeamName("teamB");
                                                                    }
                                                                }}
                                                            >
                                                                {isAvailable ? (
                                                                    <span
                                                                        style={{
                                                                            color: "#1F41BB",
                                                                            fontWeight: 600,
                                                                            fontSize: "24px",
                                                                        }}
                                                                    >
                                                                        +
                                                                    </span>
                                                                ) : player?.userId?.profilePic ? (
                                                                    <img
                                                                        src={player?.userId?.profilePic}
                                                                        alt={player?.userId?.name}
                                                                        style={{
                                                                            width: "100%",
                                                                            height: "100%",
                                                                            objectFit: "cover",
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <span
                                                                        style={{
                                                                            color: "white",
                                                                            fontWeight: 600,
                                                                            fontSize: "24px",
                                                                        }}
                                                                    >
                                                                        {getInitials(player?.userId?.name) || "B"}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span
                                                                className="mb-0 mt-2"
                                                                style={{
                                                                    maxWidth: "60px",
                                                                    overflow: "hidden",
                                                                    textOverflow: "clip",
                                                                    whiteSpace: "normal",
                                                                    display: "inline-block",
                                                                    fontSize: "10px",
                                                                    fontWeight: 600,
                                                                    fontFamily: "Poppins",
                                                                    color: isAvailable ? "#1F41BB" : "#000",
                                                                    wordBreak: "break-word",
                                                                    lineHeight: "1.2",
                                                                }}
                                                            >
                                                                {isAvailable
                                                                    ? "Available"
                                                                    : player?.userId?.name || "Player"}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div className="row mx-auto  border-top pt-1">
                                            <div className="col-6 ps-0">
                                                <p className="mb-1 all-match-name-level">
                                                    {match?.clubId?.clubName || "Unknown Club"}
                                                </p>
                                                <p
                                                    className="mb-0 text-muted all-match-name-level"
                                                    style={{ fontSize: "10px", fontWeight: "400" }}
                                                >
                                                    <FaMapMarkerAlt
                                                        className="me-1"
                                                        style={{ fontSize: "10px" }}
                                                    />
                                                    {match?.clubId?.city.charAt(0)?.toUpperCase() +
                                                        match?.clubId?.city.slice(1) || "N/A"}{" "}
                                                    {match?.clubId?.zipCode || ""}
                                                </p>
                                            </div>
                                            {/* <div className="col-6 pe-0 d-flex align-items-center justify-content-end">
                                                                <div
                                                                    className=" all-matches"
                                                                    style={{ fontWeight: "500", fontSize: "20px", fontFamily: "none", color: "#1F41BB" }}
                                                                >
                                                                    ₹ <span className="all-matches" style={{ fontWeight: "500", fontSize: "25px", fontWeight: "600", fontFamily: "Poppins", color: "#1F41BB" }}>{calculateMatchPrice(match?.slot) || 0}</span>
                                                                </div>
                                                                <button
                                                                    className="btn  rounded-pill d-flex justify-content-end align-items-center text-end view-match-btn text-dark p-0 border-0"
                                                                    onClick={() => {
                                                                        setSelectedMatch(match);
                                                                        setShowViewMatch(true);
                                                                    }}
                                                                    aria-label={`View match on ${formatMatchDate(match.matchDate)}`}
                                                                >
                                                                    View
                                                                </button>
                                                            </div> */}
                                            <div
                                                className="col-6 pe-0 d-flex align-items-center justify-content-end"
                                            >
                                                <div
                                                    className="d-flex align-items-center gap-1"
                                                    style={{
                                                        fontWeight: 500,
                                                        fontSize: "20px",
                                                        fontFamily: "none",
                                                        color: "#1F41BB",
                                                    }}
                                                >
                                                    ₹
                                                    <span
                                                        style={{
                                                            fontSize: "25px",
                                                            fontWeight: 600,
                                                            fontFamily: "Poppins",
                                                            color: "#1F41BB",
                                                        }}
                                                    >
                                                        {calculateMatchPrice(match?.slot) || 0}
                                                    </span>
                                                    <button
                                                        className="btn rounded-pill d-flex justify-content-center align-items-center text-dark p-0 border-0"
                                                        onClick={() => {
                                                            setSelectedMatch(match);
                                                            setShowViewMatch(true);
                                                            if (window.innerWidth <= 768) {
                                                                localStorage.setItem('mobileViewMatch', 'true');
                                                                localStorage.setItem('mobileSelectedMatch', JSON.stringify(match));
                                                                window.location.hash = 'viewmatch';
                                                            }
                                                        }}
                                                        aria-label={`View match on ${formatMatchDate(
                                                            match?.matchDate
                                                        )}`}
                                                    >
                                                        <IoIosArrowForward />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div
                        className="d-flex flex-column justify-content-center align-items-center text-muted fw-medium text-center mt-5"
                        style={{
                            // minHeight: "250px",
                            // height:"250px",
                            fontSize: "16px",
                            fontFamily: "Poppins",
                        }}
                    >
                        <p className="mb-2 label_font text-danger">No Open match are available for this date and {tabs[activeTab]?.label}{selectedLevel && selectedLevel !== "All" ? ` for ${selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1)} level` : ""}.</p>
                        <p className="mb-0 label_font text-danger">Please choose another date</p>
                    </div>
                )}
            </div>
        </>
    )
}

export default MatchCard