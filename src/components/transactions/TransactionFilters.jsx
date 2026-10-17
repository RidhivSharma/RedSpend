import { Button, SearchIcon, Select } from "../ui";
import {
  DATE_PRESETS,
  DEFAULT_FILTERS,
  SORT_OPTIONS,
} from "../../utils/transactionFilters";

export function TransactionFilters({ filters, categories, onChange, onReset }) {
  const isDefault = Object.keys(DEFAULT_FILTERS).every(
    (key) => filters[key] === DEFAULT_FILTERS[key]
  );

  const expenseCategories = categories.filter((category) => category.type === "expense");
  const incomeCategories = categories.filter((category) => category.type === "income");

  const customRangeInvalid =
    filters.preset === "custom" &&
    Boolean(filters.startDate) &&
    Boolean(filters.endDate) &&
    filters.startDate > filters.endDate;

  return (
    <section className="card tx-filters" aria-label="Transaction filters">
      <div className="tx-filters-row">
        <div className="tx-search">
          <SearchIcon size={16} className="tx-search-icon" />
          <input
            type="search"
            className="input tx-search-input"
            placeholder="Search notes or categories"
            aria-label="Search transactions"
            value={filters.search}
            onChange={(event) => onChange({ search: event.target.value })}
          />
        </div>
        <Select
          className="tx-filter-control"
          aria-label="Date range"
          value={filters.preset}
          onChange={(event) => onChange({ preset: event.target.value })}
          options={DATE_PRESETS}
        />
        <Select
          className="tx-filter-control"
          aria-label="Filter by type"
          value={filters.type}
          onChange={(event) => onChange({ type: event.target.value })}
          options={[
            { value: "all", label: "All types" },
            { value: "income", label: "Income" },
            { value: "expense", label: "Expense" },
          ]}
        />
        <Select
          className="tx-filter-control"
          aria-label="Filter by category"
          value={filters.categoryId}
          onChange={(event) => onChange({ categoryId: event.target.value })}
        >
          <option value="all">All categories</option>
          {expenseCategories.length > 0 ? (
            <optgroup label="Expense">
              {expenseCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </optgroup>
          ) : null}
          {incomeCategories.length > 0 ? (
            <optgroup label="Income">
              {incomeCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </optgroup>
          ) : null}
        </Select>
        <Select
          className="tx-filter-control"
          aria-label="Sort by"
          value={filters.sort}
          onChange={(event) => onChange({ sort: event.target.value })}
          options={SORT_OPTIONS}
        />
        {!isDefault ? (
          <Button variant="ghost" onClick={onReset}>
            Clear filters
          </Button>
        ) : null}
      </div>

      {filters.preset === "custom" ? (
        <div className="tx-custom-range">
          <label className="tx-custom-label" htmlFor="tx-start-date">
            From
          </label>
          <input
            id="tx-start-date"
            type="date"
            className="input tx-date-input"
            value={filters.startDate}
            max={filters.endDate || undefined}
            onChange={(event) => onChange({ startDate: event.target.value })}
          />
          <label className="tx-custom-label" htmlFor="tx-end-date">
            To
          </label>
          <input
            id="tx-end-date"
            type="date"
            className="input tx-date-input"
            value={filters.endDate}
            min={filters.startDate || undefined}
            onChange={(event) => onChange({ endDate: event.target.value })}
          />
          {customRangeInvalid ? (
            <p className="field-error tx-custom-error">
              Start date is after the end date.
            </p>
          ) : (
            <p className="field-hint tx-custom-hint">
              Leave a date empty for all time.
            </p>
          )}
        </div>
      ) : null}
    </section>
  );
}
