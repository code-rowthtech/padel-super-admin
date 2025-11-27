import React, { useEffect } from 'react'

const Sitemap = () => {

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    return (
        <div className="container py-5" style={{ marginTop: '20px', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <div>Sitemap</div>
        </div>
    )
}

export default Sitemap
