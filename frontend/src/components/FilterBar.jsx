import './FilterBar.css';

const CATEGORIES = [
  'All',
  'Music',
  'Gaming',
  'News',
  'Sports',
  'Technology',
  'Education',
  'Entertainment',
  'Travel',
  'Cooking',
];

export default function FilterBar({ active, onSelect }) {
  return (
    <div className="filter-bar">
      <div className="filter-scroll">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`filter-chip ${active === cat ? 'filter-chip--active' : ''}`}
            onClick={() => onSelect(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
