import { useState } from 'react';
import { Backpack, Close } from '@mui/icons-material';
import { Box, Chip, Divider, Grid, IconButton, Paper, Stack, Typography } from '@mui/material';

type EquipmentItem = {
  name: string;
  details?: string;
  bonus?: string;
};

type InventoryItem = {
  name: string;
  quantity?: number;
  type: string;
};

const equippedSlots: Record<string, EquipmentItem> = {
  head: { name: 'Iron Visor', details: 'Sturdy steel lining', bonus: '+4 defense' },
  body: { name: 'Lamellar Cuirass', details: 'Layered leather plates', bonus: '+6 defense' },
  legs: { name: 'Rider Greaves', details: 'Lightweight maneuverability', bonus: '+3 defense' },
  weapon: { name: 'Ashen Longsword', details: 'Balanced for quick strikes', bonus: '+8 attack' },
  backpack: { name: 'Traveler Pack', details: 'Canvas straps & pockets', bonus: '12 slots' },
};

const backpackItems: InventoryItem[] = [
  { name: 'Health Draught', quantity: 3, type: 'Consumable' },
  { name: 'Torch Bundle', quantity: 2, type: 'Utility' },
  { name: 'Iron Ingot', quantity: 6, type: 'Material' },
  { name: 'Map Fragment', type: 'Quest' },
  { name: 'Hunter\'s Trap', quantity: 1, type: 'Utility' },
  { name: 'Feather Token', quantity: 4, type: 'Crafting' },
];

const EquipmentSlot = ({ label, item }: { label: string; item: EquipmentItem }) => (
  <Box
    sx={{
      border: '1px dashed rgba(255, 255, 255, 0.2)',
      borderRadius: 2,
      p: 1.5,
      minHeight: 96,
      background: 'linear-gradient(145deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
    }}
  >
    <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 0.8 }}>
      {label}
    </Typography>
    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
      {item.name}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {item.details}
    </Typography>
    {item.bonus && (
      <Chip
        size="small"
        label={item.bonus}
        sx={{ mt: 1, color: 'success.light', borderColor: 'success.main' }}
        variant="outlined"
      />
    )}
  </Box>
);

const BackpackSlot = ({ item }: { item: InventoryItem }) => (
  <Paper
    variant="outlined"
    sx={{
      p: 1.25,
      borderRadius: 2,
      backgroundColor: 'rgba(255,255,255,0.02)',
      borderColor: 'rgba(255,255,255,0.08)',
    }}
  >
    <Stack spacing={0.5}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {item.name}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {item.type}
      </Typography>
      {item.quantity && (
        <Chip size="small" label={`x${item.quantity}`} color="primary" variant="outlined" sx={{ alignSelf: 'flex-start' }} />
      )}
    </Stack>
  </Paper>
);

const InventoryOverlay = () => {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <IconButton
        aria-label="Open inventory"
        onClick={() => setOpen(true)}
        size="large"
        sx={{
          backgroundColor: 'rgba(15,23,42,0.85)',
          color: '#e5e7eb',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
          '&:hover': {
            backgroundColor: 'rgba(79,70,229,0.2)',
          },
        }}
      >
        <Backpack />
      </IconButton>
    );
  }

  return (
    <Paper
      elevation={8}
      sx={{
        width: { xs: '100%', md: 360 },
        maxWidth: 420,
        p: 2.5,
        borderRadius: 3,
        background: 'radial-gradient(circle at 20% 20%, rgba(79,70,229,0.08), rgba(15,23,42,0.9))',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
      }}
    >
      <Stack spacing={2}>
        <Box display="flex" justifyContent="space-between" alignItems="baseline">
          <div>
            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1 }}>
              Inventory Overlay
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Vanguard of Hollowmarch
            </Typography>
          </div>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label="Equipped" color="secondary" variant="outlined" />
            <IconButton aria-label="Close inventory" size="small" onClick={() => setOpen(false)}>
              <Close fontSize="small" />
            </IconButton>
          </Stack>
        </Box>

        <Divider textAlign="left">Equipment</Divider>
        <Grid container spacing={1.5}>
          <Grid item xs={12} sm={6}>
            <EquipmentSlot label="Head Armor" item={equippedSlots.head} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <EquipmentSlot label="Body Armor" item={equippedSlots.body} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <EquipmentSlot label="Leg Armor" item={equippedSlots.legs} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <EquipmentSlot label="Weapon" item={equippedSlots.weapon} />
          </Grid>
          <Grid item xs={12}>
            <EquipmentSlot label="Backpack" item={equippedSlots.backpack} />
          </Grid>
        </Grid>

        <Divider textAlign="left">Backpack Slots</Divider>
        <Grid container spacing={1.25}>
          {backpackItems.map((item) => (
            <Grid item xs={12} sm={6} key={item.name}>
              <BackpackSlot item={item} />
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Paper>
  );
};

export default InventoryOverlay;
