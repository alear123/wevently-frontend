export default function SearchSection({ icon, text }) {
  return (
    <div className="search-section">
      <i className={`fas ${icon}`}></i>
      <span className="search-text">{text}</span>
    </div>
  );
}
