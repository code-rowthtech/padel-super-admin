import React from "react";
import { Modal } from "react-bootstrap";
import CreateMatches from "./CreateMatch";

const CreateMatchModal = ({ show, onHide, clubId }) => {
    return (
        <Modal
            show={show}
            onHide={onHide}
            size="xl"
            centered
            backdrop="static"
            keyboard={false}
            dialogClassName="modal-90w"
            style={{ zIndex: 1055 }}
        >
            <style>
                {`
          .modal-90w {
            max-width: 72vw !important;
            width: 72vw !important;
          }
          .modal-90w .modal-content {
            height: 90vh;
          }
        `}
            </style>
            <Modal.Header closeButton style={{ borderBottom: "1px solid #dee2e6" }}>
                <Modal.Title style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: "18px" }}>
                    Create Open Match
                </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ padding: 0, maxHeight: "calc(90vh - 60px)", overflowY: "auto" }}>
                <CreateMatches isModal={true} onClose={onHide} initialClubId={clubId} />
            </Modal.Body>
        </Modal>
    );
};

export default CreateMatchModal;

// Made with Bob
