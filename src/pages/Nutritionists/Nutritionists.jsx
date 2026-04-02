import { useState, useEffect } from "react"
import { getFilteredCards } from "../../api/nutritionist"
import Navbar from '../../component/Navigationbar/Navbar'
import FilterBar from '../../component/FilterBar/FilterBar'
import LoadingOverlay from "../../component/LoadingOverlay/LoadingOverlay"
import NutritionistPageCards from "../../component/NutritionistCard/NutritionistPageCard"
import BookingModal from '../../component/Bookingmodal/Bookingmodal';
import './Nutritionists.css'

const Nutritionists = () => {
  const [nutritionists, setNutritionists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sort, setSort] = useState('rating')
  const [filters, setFilters] = useState({
    specialization: '',
    maxPrice: '',
    yearsOfExperience: '',
    languages: '',
    search: ''
  })


  const [selectedId, setSelectedId] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false);


  useEffect(() => {
    const fetchExperts = async () => {
      try {
        setLoading(true);
        setError(null);
        const queryParams = { ...filters, sortBy: sort };
        const data = await getFilteredCards(queryParams);
        setNutritionists(data.cards || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // If the user is typing (search filter exists), wait 500ms
    const timer = setTimeout(() => {
      fetchExperts();
    }, 500); // 500ms delay

    return () => clearTimeout(timer); // Cleanup: Cancels the fetch if user types again
  }, [filters, sort]);

  const handleFilterChange = (newFilterData) => {
    setFilters((prev) => ({ ...prev, ...newFilterData }))
  }

  const SORT_OPTIONS = [
    { label: "Most reviews", key: "reviewCount" },
    { label: "Lowest price", key: "price" },
    { label: "Top rated", key: "rating" },
  ]

  return (
    <div className="nutritionists-page">
      <Navbar />

      <div className="results-container">
        <LoadingOverlay message="Searching for experts..." isActive={loading} />

        {/* Hero — always visible */}
        <div className={`list-wrapper ${loading ? 'is-loading' : ''}`}>
          <div className="hero-header">
            <h1 className="hero-header-tag">Certified Experts</h1>
            <h1 className="hero-header-title">
              Find your <em>perfect</em> nutritionist
            </h1>
            <h1 className="hero-header-sub">Real sessions. Real results. Book in minutes</h1>
          </div>

          {/* FilterBar — always mounted so its local state never resets */}
          <FilterBar onFilterChange={handleFilterChange} filters={filters} />

          {/* Sort + count — always visible */}
          <div className="body-header">
            <div className="left-info">
              <p className="nutritionist-count">{nutritionists.length} Nutritionists</p>
              <p className="status">available now</p>
            </div>
            <div className="right-info">
              {SORT_OPTIONS.map((o) => (
                <button
                  type="button"
                  key={o.key}
                  className={`sort-btn ${sort === o.key ? 'active' : ''}`}
                  onClick={() => setSort(o.key)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Loader, error, and cards swap in/out */}
          {error && <div className="error-msg">{error}</div>}


          <div className="cards">
            {nutritionists.length === 0 && !loading ? (
              <p className="no-results">No nutritionists found. Try adjusting your filters.</p>
            ) : (
              nutritionists.map((n) => (
                <NutritionistPageCards
                  key={n._id}
                  nutritionist={n}
                  onClick={() => {
                    setSelectedId(n.user._id)
                    setIsModalOpen(true)
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <BookingModal
        nutritionistId = {selectedId}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedId(null)
        }} />
      )}
    </div >
  )
}

export default Nutritionists
