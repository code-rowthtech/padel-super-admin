import PropTypes from 'prop-types';
import React from 'react';
import { Table } from 'react-bootstrap';
import { FaEye } from 'react-icons/fa';

const CustomTable = ({ headers, cancellations, scroll, setShowCancellation = () => { }, }) => {
    return (
        <>
            <style>
                {`
                    .custom-scroll-container {
                        scrollbar-width: thin;
                        scrollbar-color: #b0b0b0 transparent;
                    }

                    .custom-scroll-container::-webkit-scrollbar {
                        width: 6px;
                    }

                    .custom-scroll-container::-webkit-scrollbar-track {
                        background: transparent;
                    }

                    .custom-scroll-container::-webkit-scrollbar-thumb {
                        background-color: #b0b0b0;
                        border-radius: 8px;
                    }

                    .custom-scroll-container::-webkit-scrollbar-thumb:hover {
                        background-color: #888;
                    }
                `}
            </style>

            <div
                className="custom-scroll-container"
                style={{
                    maxHeight: scroll ? '290px' : '100vh',
                    overflowY: scroll ? 'auto' : 'auto',
                }}
            >
                <Table responsive borderless size="sm">
                    <thead>
                        <tr>
                            {headers?.map((header, index) => (
                                <th
                                    key={index}
                                    className="py-2 ps-4"
                                    style={{
                                        backgroundColor: "#D0D6EA",
                                        fontWeight: "400"
                                    }}
                                >
                                    {header?.name}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {cancellations?.map((item, index) => (
                            <tr key={index}>
                                <td className="py-2 ps-4 table-data border-bottom">{item.name}</td>
                                <td className="py-2 ps-4 table-data border-bottom"><b>{item.date}</b>{item.time}</td>
                                <td className="py-2 ps-4 table-data border-bottom">{item.courtNo}</td>
                                <td className="py-2 ps-4 table-data border-bottom" style={{ cursor: 'pointer' }} onClick={() => {
                                    if (typeof setShowCancellation === 'function') {
                                        setShowCancellation(true);
                                    }
                                }}>
                                    <FaEye className="text-primary" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        </>
    );
};

CustomTable.propTypes = {
    headers: PropTypes.array.isRequired,
    cancellations: PropTypes.array.isRequired,
    scroll: PropTypes.bool,
    setShowCancellation: PropTypes.func,
    type: PropTypes.string,
};

export default CustomTable;
