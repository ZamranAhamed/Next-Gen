
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import BookMarkDetail from '../BookMarkDetail/BookMarkDetail';
import Header from '../../../Header/Header';
import './BookMarkDetails.css';

const BookMarkDetails = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [allBookmarks, setAllBookmarks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [noResult, setNoResult] = useState(false);

  const printRef = useRef();

  const fetchBookmarks = async () => {
    try {
      const res = await axios.get('http://localhost:4000/BookMark');
      setBookmarks(res.data.bookmarks || []);
      setAllBookmarks(res.data.bookmarks || []);
    } catch (err) {
      console.error("Fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleSearch = () => {
    const filtered = allBookmarks.filter((bookmark) =>
      Object.values(bookmark).some((field) =>
        field.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
    setBookmarks(filtered);
    setNoResult(filtered.length === 0);
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: 'Bookmark Report',
    onAfterPrint: () => alert('PDF Downloaded'),
  });

  return (
    <div className="bookmark-container">
      <Header />
      <div className="content">
        <h1 className="heading">BookMark Details</h1>

        <div className="search-container">
          <div className="search-area">
            <input
              onChange={(e) => setSearchQuery(e.target.value)}
              type="text"
              placeholder="Search Bookmark Details"
              className="search-bar"
            />
            <button className="btn-search" onClick={handleSearch}>Search</button>
          </div>
          <button className="btn no-print" onClick={handlePrint}>Download Report</button>
        </div>

        <div ref={printRef}>
          {noResult ? (
            <p>No Bookmark Found</p>
          ) : (
            <div className="bookmark-list">
              {bookmarks.map((bookmark, index) => (
                <BookMarkDetail key={bookmark._id || index} bookmark={bookmark} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookMarkDetails;
