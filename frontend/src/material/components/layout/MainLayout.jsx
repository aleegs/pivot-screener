import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import MaterialDrawer, { menuWidth } from 'material/components/layout/Drawer';
import Header, { headerSafePadding } from 'material/components/layout/Header';
import Footer from 'material/components/layout/Footer';
import Paper from '@material-ui/core/Paper';
import TelegramGroupPromo from 'material/components/misc/TelegramGroupPromo';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',

    flexDirection: 'column',
  },
  content: {
    paddingTop: headerSafePadding,
    display: 'flex',
    flexDirection: 'column',
    justifyItems: 'center',
    height: '100%',
    [theme.breakpoints.up('md')]: {
      paddingLeft: menuWidth,
    },
    [theme.breakpoints.down('sm')]: {
      marginTop: '-5px',
    },
    [theme.breakpoints.down('xs')]: {
      marginTop: '-15px',
    },
  },
  paperContent: {
    display: 'flex',
    boxShadow: '0 12px 12px -6px rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    minHeight: '500px',
    flexDirection: 'column',
    marginTop: theme.spacing(3),
    gap: theme.spacing(3),
    padding: theme.spacing(3),
    height: '100%',
  },
}));

function MainLayout({ Content }) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Header />
      <MaterialDrawer />
      <main className={classes.content}>
        <TelegramGroupPromo />
        {/* Content container */}
        <Paper elevation={0} className={classes.paperContent}>
          <Content />
        </Paper>
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
