import React from "react";
import "./ListHeader.css";

export default function ListHeader({ title, placeholder, onSearch }) {
  return (
    <div className="clist-head">
      <h2 className="clist-title">{title}</h2>
      <form
        className="clist-search"
        onSubmit={(e) => {
          e.preventDefault();
          const text = new FormData(e.currentTarget).get("q") || "";
          onSearch(String(text));
        }}
      >
        <input
          name="q"
          type="text"
          placeholder={placeholder || "검색…"}
          aria-label="검색어"
        />
        <button type="submit">검색</button>
      </form>
    </div>
  );
}
