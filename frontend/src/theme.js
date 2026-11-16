import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: { main: '#1f3a5f' },
    secondary: { main: '#8a6d00' },
    background: { default: '#f4f6f9' },
  },
  shape: { borderRadius: 8 },
})

export default theme
