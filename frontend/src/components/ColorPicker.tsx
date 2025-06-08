import React from 'react';
import { Box, Typography, Radio, RadioGroup, FormControlLabel } from '@mui/material';

const EVENT_COLORS = [
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'red', label: 'Red' },
  { value: 'orange', label: 'Orange' },
  { value: 'purple', label: 'Purple' },
  { value: 'teal', label: 'Teal' },
];

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

const ColorPicker = ({ selectedColor, onColorChange }: ColorPickerProps) => {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Event Color
      </Typography>
      <RadioGroup
        row
        value={selectedColor}
        onChange={(e) => onColorChange(e.target.value)}
      >
        {EVENT_COLORS.map((color) => (
          <FormControlLabel
            key={color.value}
            value={color.value}
            control={
              <Radio
                sx={{
                  color: color.value,
                  '&.Mui-checked': {
                    color: color.value,
                  },
                }}
              />
            }
            label=""
          />
        ))}
      </RadioGroup>
    </Box>
  );
};

export default ColorPicker;