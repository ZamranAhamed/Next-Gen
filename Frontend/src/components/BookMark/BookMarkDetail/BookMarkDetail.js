import React from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './BookMarkDetail.css';

function BookMarkDetail({ bookmark, index }) {
  const { _id, name, originalText, translatedText, dateCreated } = bookmark;
  const navigate = useNavigate();

  const deleteHandler = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this bookmark?");
    if (confirmed) {
      try {
        await axios.delete(`http://localhost:4000/BookMark/${_id}`);
        alert("Bookmark Deleted Successfully");
        navigate("/bookmarkdetails");
        window.location.reload();
      } catch (error) {
        console.error("Error deleting bookmark:", error);
      }
    }
  };

  return (
    <div className="bookmark-card">
      <div className="card-body">
        <h2 className="card-title">Bookmark Details {index + 1}</h2>

        <div className="detail-line">
          <span className="label">Name:</span>
          <span className="value">{name}</span>
        </div>
        <div className="detail-line">
          <span className="label">Original Text:</span>
          <span className="value">{originalText}</span>
        </div>
        <div className="detail-line">
          <span className="label">Translated Text:</span>
          <span className="value">{translatedText}</span>
        </div>
        <div className="detail-line">
          <span className="label">Date Created:</span>
          <span className="value">{new Date(dateCreated).toLocaleDateString()}</span>
        </div>

        {/* ✅ NO background color wrapper here */}
        <div className="button-group no-print">
          <Link to={`/updatebookmark/${_id}`} className="btn btn-primary">Update</Link>
          <button onClick={deleteHandler} className="btn btn-danger">Delete</button>
        </div>
      </div>
    </div>
  );
}

export default BookMarkDetail;
