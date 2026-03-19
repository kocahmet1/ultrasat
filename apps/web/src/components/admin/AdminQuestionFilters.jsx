import React from 'react';

function AdminQuestionFilters({
  difficultyFilter,
  onDifficultyFilterChange,
  onSearchTermChange,
  onSubcategoryFilterChange,
  searchTerm,
  subcategories,
  subcategoriesLoading,
  subcategoryFilter
}) {
  return (
    <div className="filters">
      <div className="search-box">
        <input
          type="text"
          placeholder="Search questions..."
          value={searchTerm}
          onChange={(event) => onSearchTermChange(event.target.value)}
        />
      </div>

      <div className="filter-selects">
        <select
          value={subcategoryFilter}
          onChange={(event) => onSubcategoryFilterChange(event.target.value)}
          disabled={subcategoriesLoading}
        >
          <option value="all">All Subcategories</option>
          {subcategories.map(subcategory => (
            <option key={subcategory.id} value={subcategory.id}>
              {subcategory.name}
            </option>
          ))}
        </select>

        <select
          value={difficultyFilter}
          onChange={(event) => onDifficultyFilterChange(event.target.value)}
        >
          <option value="all">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
    </div>
  );
}

export default AdminQuestionFilters;
