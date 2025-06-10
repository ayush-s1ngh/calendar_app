import React from 'react';
import { Box, Button, Popover, Typography } from '@mui/material';

interface ColorOption {
  name: string;
  value: string;
}

// Color options based on Material UI palette
// Note: Backend stores color names, so we must map these correctly
const colorOptions: ColorOption[] = [
  { name: 'Blue', value: '#1976d2' },
  { name: 'Red', value: '#d32f2f' },
  { name: 'Green', value: '#388e3c' },
  { name: 'Purple', value: '#7b1fa2' },
  { name: 'Orange', value: '#f57c00' },
  { name: 'Teal', value: '#00796b' },
  { name: 'Pink', value: '#c2185b' },
  { name: 'Indigo', value: '#3f51b5' },
  { name: 'Cyan', value: '#0097a7' },
  { name: 'Amber', value: '#ffa000' },
];

// Map color names to hex values and vice versa
export const colorNameToHex = (name: string): string => {
  const color = colorOptions.find(c => c.name.toLowerCase() === name.toLowerCase());
  return color ? color.value : '#1976d2'; // Default to blue
};

export const colorHexToName = (hex: string): string => {
  const color = colorOptions.find(c => c.value === hex);
  return color ? color.name.toLowerCase() : 'blue';
};

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onColorChange }) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleColorSelect = (colorOption: ColorOption) => {
    // Send the color name to the backend, not the hex value
    onColorChange(colorOption.name.toLowerCase());
    handleClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? 'color-popover' : undefined;

  // Convert color name to hex for display
  const colorHex = selectedColor.startsWith('#')
    ? selectedColor
    : colorNameToHex(selectedColor);

  // Find the name of the selected color for display
  const selectedColorName = selectedColor.startsWith('#')
    ? colorOptions.find(option => option.value === colorHex)?.name || 'Custom'
    : selectedColor.charAt(0).toUpperCase() + selectedColor.slice(1);

  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 1 }}>Event Color</Typography>
      <Button
        aria-describedby={id}
        variant="outlined"
        onClick={handleClick}
        sx={{
          minWidth: 120,
          backgroundColor: colorHex,
          color: '#ffffff',
          '&:hover': {
            backgroundColor: colorHex,
            opacity: 0.9,
          },
        }}
      >
        {selectedColorName}
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box sx={{
          p: 2,
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 1
        }}>
          {colorOptions.map((colorOption) => (
            <Box
              key={colorOption.value}
              onClick={() => handleColorSelect(colorOption)}
              sx={{
                width: 30,
                height: 30,
                bgcolor: colorOption.value,
                borderRadius: '50%',
                cursor: 'pointer',
                border: colorHex === colorOption.value ? '2px solid #000' : 'none',
                '&:hover': {
                  opacity: 0.8,
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s',
              }}
              title={colorOption.name}
            />
          ))}
        </Box>
      </Popover>
    </Box>
  );
};

export default ColorPicker;