// ===== Rakta-Seva Connect — Design System =====
export const COLORS = {
  bg: '#0A0A14',
  bg2: '#11111E',
  bg3: '#1A1A2E',
  surface: 'rgba(255,255,255,0.05)',
  surface2: 'rgba(255,255,255,0.08)',
  red: '#DC143C',
  redGlow: 'rgba(220,20,60,0.35)',
  redDark: '#8B0000',
  redLight: 'rgba(220,20,60,0.12)',
  green: '#00C853',
  greenLight: 'rgba(0,200,83,0.12)',
  amber: '#FFB300',
  amberLight: 'rgba(255,179,0,0.12)',
  blue: '#448AFF',
  blueLight: 'rgba(68,138,255,0.12)',
  text: '#F0F0F5',
  text2: '#A0A0B8',
  text3: '#606078',
  white: '#FFFFFF',
  border: 'rgba(255,255,255,0.06)',
  cardBg: '#151525',
};

export const FONTS = {
  regular: { fontSize: 14, color: COLORS.text },
  medium: { fontSize: 14, fontWeight: '500', color: COLORS.text },
  semibold: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  bold: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  h1: { fontSize: 26, fontWeight: '800', color: COLORS.text },
  h2: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  h3: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  caption: { fontSize: 12, color: COLORS.text2 },
  tiny: { fontSize: 10, fontWeight: '600', color: COLORS.text3 },
};

export const SPACING = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32,
};

export const RADIUS = {
  sm: 10, md: 14, lg: 18, xl: 24, full: 50,
};
