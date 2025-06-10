import React, { useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button,
  Paper,
  Typography,
  Divider,
  Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import { colorNameToHex } from './ColorPicker';

export interface EventFilters {
  search: string;
  startDate: Date | null;
  endDate: Date | null;
  colors: string[];
  showAllDay: boolean;
}

interface EventFilterProps {
  onFilterChange: (filters: EventFilters) => void;
}

// Define color options - these should match backend color options
const availableColors = [
  { name: 'Blue', value: 'blue' },
  { name: 'Red', value: 'red' },
  { name: 'Green', value: 'green' },
  { name: 'Purple', value: 'purple' },
  { name: 'Orange', value: 'orange' },
  { name: 'Teal', value: 'teal' },
  { name: 'Pink', value: 'pink' },
];

const defaultFilters: EventFilters = {
  search: '',
  startDate: null,
  endDate: null,
  colors: [],
  showAllDay: true
};

const EventFilter: React.FC<EventFilterProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<EventFilters>(defaultFilters);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...filters, search: e.target.value };
    setFilters(newFilters);
    onFilterChange(newFilters);
    updateActiveFiltersCount(newFilters);
  };

  const handleDateChange = (field: 'startDate' | 'endDate', date: Date | null) => {
    const newFilters = { ...filters, [field]: date };
    setFilters(newFilters);
    onFilterChange(newFilters);
    updateActiveFiltersCount(newFilters);
  };

  const handleColorToggle = (colorValue: string) => {
    const newColors = filters.colors.includes(colorValue)
      ? filters.colors.filter(c => c !== colorValue)
      : [...filters.colors, colorValue];

    const newFilters = { ...filters, colors: newColors };
    setFilters(newFilters);
    onFilterChange(newFilters);
    updateActiveFiltersCount(newFilters);
  };

  const handleShowAllDayChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...filters, showAllDay: event.target.checked };
    setFilters(newFilters);
    onFilterChange(newFilters);
    updateActiveFiltersCount(newFilters);
  };

  const updateActiveFiltersCount = (currentFilters: EventFilters) => {
    let count = 0;
    if (currentFilters.search) count++;
    if (currentFilters.startDate) count++;
    if (currentFilters.endDate) count++;
    if (currentFilters.colors.length > 0) count++;
    if (!currentFilters.showAllDay) count++;
    setActiveFiltersCount(count);
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
    setActiveFiltersCount(0);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search events..."
          value={filters.search}
          onChange={handleSearchChange}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />

        <IconButton
          color={activeFiltersCount > 0 ? "primary" : "default"}
          onClick={handleFilterClick}
          sx={{ ml: 1 }}
          aria-label="Filter events"
        >
          <FilterListIcon />
          {activeFiltersCount > 0 && (
            <Box
              sx={{
                position: 'absolute',
                top: -2,
                right: -2,
                bgcolor: 'primary.main',
                borderRadius: '50%',
                width: 16,
                height: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 10,
              }}
            >
              {activeFiltersCount}
            </Box>
          )}
        </IconButton>

        <Button
          variant="outlined"
          size="small"
          sx={{ ml: 1 }}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Simple' : 'Advanced'}
        </Button>
      </Box>

      {expanded && (
        <Paper sx={{ p: 2, mb: 2, mt: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle1">Advanced Filters</Typography>
            <Button size="small" onClick={resetFilters}>Reset All</Button>
          </Box>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <DatePicker
                label="From Date"
                value={filters.startDate}
                onChange={(date) => handleDateChange('startDate', date)}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
              <DatePicker
                label="To Date"
                value={filters.endDate}
                onChange={(date) => handleDateChange('endDate', date)}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Box>
          </LocalizationProvider>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom>Event Colors</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {availableColors.map(color => {
              // Get hex color for display
              const colorHex = colorNameToHex(color.value);
              const isSelected = filters.colors.includes(color.value);

              return (
                <Chip
                  key={color.value}
                  label={color.name}
                  sx={{
                    bgcolor: colorHex,
                    color: '#ffffff',
                    borderColor: isSelected ? 'black' : 'transparent',
                    borderWidth: 2,
                    borderStyle: 'solid',
                  }}
                  onClick={() => handleColorToggle(color.value)}
                />
              );
            })}
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                checked={filters.showAllDay}
                onChange={handleShowAllDayChange}
              />
            }
            label="Show All-Day Events"
          />
        </Paper>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleFilterClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <MenuItem disabled sx={{ opacity: 1, fontWeight: 'bold' }}>
          Quick Filters
        </MenuItem>
        <Divider />

        <MenuItem onClick={() => {
          const today = new Date();
          const newFilters = {
            ...filters,
            startDate: today,
            endDate: today
          };
          setFilters(newFilters);
          onFilterChange(newFilters);
          updateActiveFiltersCount(newFilters);
          handleFilterClose();
        }}>
          Today's Events
        </MenuItem>

        <MenuItem onClick={() => {
          const today = new Date();
          const nextWeek = new Date();
          nextWeek.setDate(today.getDate() + 7);

          const newFilters = {
            ...filters,
            startDate: today,
            endDate: nextWeek
          };
          setFilters(newFilters);
          onFilterChange(newFilters);
          updateActiveFiltersCount(newFilters);
          handleFilterClose();
        }}>
          Next 7 Days
        </MenuItem>

        <MenuItem onClick={() => {
          const newFilters = {
            ...filters,
            showAllDay: true,
            colors: []
          };
          setFilters(newFilters);
          onFilterChange(newFilters);
          updateActiveFiltersCount(newFilters);
          handleFilterClose();
        }}>
          Reset Color Filters
        </MenuItem>

        <MenuItem onClick={resetFilters}>
          Reset All Filters
        </MenuItem>
      </Menu>

      {activeFiltersCount > 0 && (
        <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {filters.search && (
            <Chip
              label={`Search: ${filters.search}`}
              size="small"
              onDelete={() => {
                const newFilters = { ...filters, search: '' };
                setFilters(newFilters);
                onFilterChange(newFilters);
                updateActiveFiltersCount(newFilters);
              }}
            />
          )}

          {filters.startDate && (
            <Chip
              label={`From: ${filters.startDate.toLocaleDateString()}`}
              size="small"
              onDelete={() => {
                const newFilters = { ...filters, startDate: null };
                setFilters(newFilters);
                onFilterChange(newFilters);
                updateActiveFiltersCount(newFilters);
              }}
            />
          )}

          {filters.endDate && (
            <Chip
              label={`To: ${filters.endDate.toLocaleDateString()}`}
              size="small"
              onDelete={() => {
                const newFilters = { ...filters, endDate: null };
                setFilters(newFilters);
                onFilterChange(newFilters);
                updateActiveFiltersCount(newFilters);
              }}
            />
          )}

          {filters.colors.length > 0 && (
            <Chip
              label={`Colors: ${filters.colors.length}`}
              size="small"
              onDelete={() => {
                const newFilters = { ...filters, colors: [] };
                setFilters(newFilters);
                onFilterChange(newFilters);
                updateActiveFiltersCount(newFilters);
              }}
            />
          )}

          {!filters.showAllDay && (
            <Chip
              label="No all-day events"
              size="small"
              onDelete={() => {
                const newFilters = { ...filters, showAllDay: true };
                setFilters(newFilters);
                onFilterChange(newFilters);
                updateActiveFiltersCount(newFilters);
              }}
            />
          )}

          <Button size="small" onClick={resetFilters} startIcon={<CloseIcon />}>
            Clear All
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default EventFilter;