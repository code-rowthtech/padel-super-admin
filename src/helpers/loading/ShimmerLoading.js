import React from 'react';

export const ViewmatchShimmer = () => {
    return (
        <>
            {/* Match Card Shimmer */}
            <div className="rounded-4 border h-25 px-3 pt-2 pb-0 mb-2" style={{ backgroundColor: "#CBD6FF1A" }}>
                <div className="d-flex justify-content-between align-items-start py-2 px-2">
                    <div className="d-flex align-items-center gap-2">
                        <div className="shimmer" style={{ width: 24, height: 24, borderRadius: 4 }} />
                        <div className="shimmer" style={{ width: 100, height: 20, borderRadius: 6 }} />
                    </div>
                    <div className="shimmer d-none d-lg-block" style={{ width: 180, height: 16, borderRadius: 6 }} />
                    <div className="shimmer d-lg-none" style={{ width: 140, height: 16, borderRadius: 6 }} />
                </div>

                <div className="row text-center border-top">
                    <div className="col py-3">
                        <div className="shimmer mx-auto mb-2" style={{ width: 60, height: 12, borderRadius: 4 }} />
                        <div className="shimmer mx-auto" style={{ width: 80, height: 18, borderRadius: 6 }} />
                    </div>
                    <div className="col border-start border-end py-3">
                        <div className="shimmer mx-auto mb-2" style={{ width: 50, height: 12, borderRadius: 4 }} />
                        <div className="shimmer mx-auto" style={{ width: 90, height: 18, borderRadius: 6 }} />
                    </div>
                    <div className="col py-3">
                        <div className="shimmer mx-auto mb-2" style={{ width: 70, height: 12, borderRadius: 4 }} />
                        <div className="shimmer mx-auto" style={{ width: 100, height: 28, borderRadius: 8 }} />
                    </div>
                </div>
            </div>

            {/* Players Section Shimmer */}
            <div className="p-md-3 px-3  pt-2 pb-1 rounded-3 mb-2 border" style={{ backgroundColor: "#CBD6FF1A" }}>
                <div className="shimmer mb-3" style={{ width: 80, height: 20, borderRadius: 6 }} />

                <div className="row mx-auto">
                    {/* Team A */}
                    <div className="col-6 d-flex justify-content-between align-items-start flex-wrap px-0">
                        {[1, 2].map((i) => (
                            <div key={i} className="mb-3 text-center">
                                <div className="shimmer mx-auto mb-2" style={{ width: 60, height: 60, borderRadius: '50%' }} />
                                <div className="shimmer mx-auto" style={{ width: 70, height: 12, borderRadius: 4 }} />
                            </div>
                        ))}
                    </div>

                    {/* Team B */}
                    <div className="col-6 d-flex justify-content-between align-items-start flex-wrap px-0 border-start border-0 border-lg-start">
                        {[1, 2].map((i) => (
                            <div key={i} className="mb-3 text-center">
                                <div className="shimmer mx-auto mb-2" style={{ width: 60, height: 60, borderRadius: '50%' }} />
                                <div className="shimmer mx-auto" style={{ width: 70, height: 12, borderRadius: 4 }} />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="d-flex justify-content-between mt-3">
                    <div className="shimmer" style={{ width: 60, height: 14, borderRadius: 4 }} />
                    <div className="shimmer" style={{ width: 60, height: 14, borderRadius: 4 }} />
                </div>
            </div>
        </>
    );
};

export const MatchplayerShimmer = () => {
    return (
        <>
            <div className="rounded-4 border h-50 px-3 pt-2 mt-lg-4 pb-0 mb-2" style={{ backgroundColor: "#CBD6FF1A" }}>
                <div className="d-flex justify-content-between align-items-start py-2 px-2">
                    <div className="d-flex align-items-center gap-2">
                        <div className="shimmer" style={{ width: 24, height: 24, borderRadius: 4 }} />
                        <div className="shimmer" style={{ width: 100, height: 20, borderRadius: 6 }} />
                    </div>
                    <div className="shimmer d-none d-lg-block" style={{ width: 180, height: 16, borderRadius: 6 }} />
                    <div className="shimmer d-lg-none" style={{ width: 140, height: 16, borderRadius: 6 }} />
                </div>

                <div className="row text-center h-100 border-top">
                    <div className="col py-3">
                        <div className="shimmer mx-auto mb-2" style={{ width: 60, height: 12, borderRadius: 4 }} />
                        <div className="shimmer mx-auto" style={{ width: 80, height: 18, borderRadius: 6 }} />
                    </div>
                    <div className="col border-start border-end py-3">
                        <div className="shimmer mx-auto mb-2" style={{ width: 50, height: 12, borderRadius: 4 }} />
                        <div className="shimmer mx-auto" style={{ width: 90, height: 18, borderRadius: 6 }} />
                    </div>
                    <div className="col py-3">
                        <div className="shimmer mx-auto mb-2" style={{ width: 70, height: 12, borderRadius: 4 }} />
                        <div className="shimmer mx-auto" style={{ width: 100, height: 28, borderRadius: 8 }} />
                    </div>
                </div>
            </div>

            <div className="p-md-3 px-3 pt-2 pb-1 h-50 rounded-3 mb-2 border" style={{ backgroundColor: "#CBD6FF1A" }}>
                <div className="shimmer mb-3" style={{ width: 80, height: 20, borderRadius: 6 }} />

                <div className="row mx-auto">
                    <div className="col-6 d-flex justify-content-between align-items-start flex-wrap px-0">
                        {[1, 2].map((i) => (
                            <div key={i} className="mb-3 text-center">
                                <div className="shimmer mx-auto mb-2" style={{ width: 60, height: 60, borderRadius: '50%' }} />
                                <div className="shimmer mx-auto" style={{ width: 70, height: 12, borderRadius: 4 }} />
                            </div>
                        ))}
                    </div>

                    <div className="col-6 d-flex justify-content-between align-items-start flex-wrap px-0 border-start border-0 border-lg-start">
                        {[1, 2].map((i) => (
                            <div key={i} className="mb-3 text-center">
                                <div className="shimmer mx-auto mb-2" style={{ width: 60, height: 60, borderRadius: '50%' }} />
                                <div className="shimmer mx-auto" style={{ width: 70, height: 12, borderRadius: 4 }} />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="d-flex justify-content-between mt-3">
                    <div className="shimmer" style={{ width: 60, height: 14, borderRadius: 4 }} />
                    <div className="shimmer" style={{ width: 60, height: 14, borderRadius: 4 }} />
                </div>
            </div>
        </>
    )
}