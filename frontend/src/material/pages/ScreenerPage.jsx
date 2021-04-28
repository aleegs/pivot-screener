import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { PropTypes } from 'prop-types';
import { useMst } from 'models/Root';
import { capitalizeFirstLetter } from 'lib/Helpers';
import { isValidMarket } from 'lib/Markets';
import PageContainer from 'material/components/layout/PageContainer';
import { useHistory } from 'react-router';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import CPRTable from 'components/tables/CPRTable';
import CamTable from 'components/tables/CamTable';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}>
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(label) {
  return {
    id: `simple-tab-${label}`,
    'aria-controls': `simple-tabpanel-${label}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
  tabsBar: {
    borderBottom: '1px rgb(0,0,0,0.1) solid',
  },
}));

function ScreenerPage({ match }) {
  // Path params
  const { market, screenerType } = match.params;
  const validMarket = market && isValidMarket(market);

  // Tab state
  const TAB_ITEMS = [
    { timeframe: 'Daily' },
    { timeframe: 'Weekly' },
    { timeframe: 'Monthly' },
    { timeframe: 'Tomorrow', futureMode: true },
    { timeframe: 'Next Week', futureMode: true },
    { timeframe: 'Next Month', futureMode: true },
  ];
  const [activeTab, setActiveTab] = React.useState(0);
  const handleTabChange = (event, newTab) => {
    setActiveTab(newTab);
  };

  const classes = useStyles();

  // Get TableComponent and breadcrumb depending on path params
  let TableComponent;
  let breadcrumbStr;

  switch (screenerType.toLowerCase()) {
    case 'cpr':
      TableComponent = CPRTable;
      breadcrumbStr = 'CPR Screener';
      break;
    case 'camarilla':
      TableComponent = CamTable;
      breadcrumbStr = 'Camarilla Screener';
      break;
    default:
      TableComponent = null;
      breadcrumbStr = 'Error';
  }

  // Request data from API
  const { startReceivingData, stopReceivingData } = useMst((store) => ({
    startReceivingData: store.startReceivingData,
    stopReceivingData: store.stopReceivingData,
  }));

  React.useEffect(() => {
    if (validMarket) {
      startReceivingData('daily, weekly, monthly', market);
    }

    return () => {
      stopReceivingData();
    };
  }, [market]);

  // Render
  return (
    <PageContainer breadcrumbsItems={[breadcrumbStr, capitalizeFirstLetter(market)]}>
      {!validMarket || !TableComponent ? (
        <b>Invalid market</b>
      ) : (
        <>
          <div className={classes.tabsBar}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label='timeframe tabs'
              indicatorColor='primary'
              textColor='primary'
              centered>
              {TAB_ITEMS.map(({ timeframe }) => (
                <Tab key={timeframe} label={timeframe} {...a11yProps(timeframe)} />
              ))}
            </Tabs>
          </div>
          {TAB_ITEMS.map(({ timeframe, futureMode }) => {
            <TabPanel value={activeTab} index={'timeframe'}>
              <TableComponent
                screenerType={screenerType}
                timeframe={timeframe.toLowerCase()}
                market={market}
                futureMode={futureMode || false}
              />
            </TabPanel>;
          })}
        </>
      )}
    </PageContainer>
  );
}

ScreenerPage.propTypes = {
  match: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default observer(ScreenerPage);
