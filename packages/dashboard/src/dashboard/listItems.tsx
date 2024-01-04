import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ErrorIcon from '@mui/icons-material/Error';

export const mainListItems = (

  <>
    <ListItemButton selected>
      <ListItemIcon>
        <DashboardIcon />
      </ListItemIcon>
      <ListItemText primary="Errors" />
    </ListItemButton>
    <ListItemButton>
      <ListItemIcon>
        <ErrorIcon/>
      </ListItemIcon>
      <ListItemText primary="Error Parse" />
    </ListItemButton>
  </>
);

