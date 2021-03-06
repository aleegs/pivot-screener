import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { autorun } from 'mobx';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import { PropTypes } from 'prop-types';
import { useMst } from 'models/Root';
import './Table.css';
import CPRStats from 'components/stats/CPRStats';
import FiltersMenu from 'components/tables/FiltersMenu';
import { exchangeRenderer, symbolRenderer, CustomLoadingOverlay } from 'components/tables/CommonTableComponents';
import {
  situationCellStyle,
  situationGetter,
  magnetSideCellStyle,
  magnetSideGetter,
  cprStatusCellStyle,
  cprStatusCellRenderer,
  cprStatusGetter,
  cprWidthGetter,
  cprWidthRenderer,
  distanceFormatter,
  distanceGetter,
} from 'components/tables/CPRTableComponents';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import MultilineSkeleton from 'components/misc/MultilineSkeleton';

// TODO: Implementar tooltip en las distancias de pivote para mostrar precio del pivote

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    gap: theme.spacing(1),
    flexDirection: 'column',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

const CPRTable = ({ screenerType, timeframe, market, futureMode }) => {
  const classes = useStyles();
  const [gridApi, setGridApi] = useState(null);
  const [loading, setLoading] = useState(false);

  const { tickers } = useMst((store) => ({
    tickers: store.tickers,
  }));

  const isValidTickers = () => tickers && tickers.length > 0 && tickers[0].market.toLowerCase() === market;

  // Update grid row data on tickers update
  useEffect(() => {
    const dispose = autorun(() => {
      if (gridApi && isValidTickers()) {
        gridApi.setRowData(tickers);
        setLoading(false);
      }
    });

    return () => {
      dispose();
    };
  });

  // Destroy grid on component unmount
  useEffect(
    () => () => {
      if (gridApi) {
        gridApi.destroy();
      }
    },
    []
  );

  // Remove current grid data on market prop change
  useEffect(() => {
    if (gridApi) {
      setLoading(true);
      gridApi.setRowData([]);
    }
  }, [market]);

  // Initialize grid state
  const onGridReady = (params) => {
    setGridApi(params.api);

    if (isValidTickers()) {
      params.api.setRowData(tickers);
    } else {
      params.api.showLoadingOverlay();
    }
  };

  const onFirstDataRendered = (params) => {
    params.api.hideOverlay();
  };

  const InfoRenderer = () => (
    <>
      <Typography>
        The percentage shown above the <i>Untested</i> label is the closest approximation to the CPR. <i>Example:</i>{' '}
        Untested <sup>0.1%</sup> means that there was a candle that came within 0.1% of the CPR.
      </Typography>

      <Typography>P Distance is the distance between the current price and the pivot level.</Typography>
      <Typography>TC Distance is the distance between the current price and the top pivot level.</Typography>
      <Typography>BC Distance is the distance between the current price and the bottom pivot level.</Typography>
    </>
  );

  return (
    <div className={classes.root}>
      {!gridApi || loading || tickers.length <= 1 ? (
        <MultilineSkeleton lines={5} style={{ width: '100%', height: 20 }} />
      ) : (
        <CPRStats timeframe={timeframe} futureMode={futureMode} />
      )}

      {gridApi && (
        <FiltersMenu
          screenerType={screenerType}
          gridApi={gridApi}
          timeframe={timeframe}
          market={market}
          tickersCount={tickers.length}
        />
      )}

      <div className='ag-theme-material ag-main'>
        <AgGridReact
          onGridReady={onGridReady}
          animateRows
          onFirstDataRendered={onFirstDataRendered}
          immutableData
          tooltipShowDelay={0}
          frameworkComponents={{
            customLoadingOverlay: CustomLoadingOverlay,
          }}
          defaultColDef={{
            enableCellChangeFlash: true,
            editable: false,
            sortable: true,
            filter: true,
            resizable: true,
          }}
          loadingOverlayComponent='customLoadingOverlay'
          noRowsOverlayComponent='customLoadingOverlay'
          enableBrowserTooltips
          getRowNodeId={(data) => data.symbol}>
          <AgGridColumn width={150} headerName='Symbol' field='symbol' cellRenderer={symbolRenderer} />

          <AgGridColumn width={150} headerName='Exchange' field='exchange' cellRenderer={exchangeRenderer} />

          <AgGridColumn width={150} headerName='Price' field='price' filter='agNumberColumnFilter' />

          <AgGridColumn
            width={185}
            cellStyle={cprStatusCellStyle}
            cellRenderer={(params) => cprStatusCellRenderer(params, timeframe, futureMode)}
            headerName='CPR Status'
            valueGetter={(params) => cprStatusGetter(params, timeframe, futureMode)}
          />

          <AgGridColumn
            width={150}
            headerName='Magnet Side'
            valueGetter={(params) => magnetSideGetter(params, timeframe, futureMode)}
            cellStyle={magnetSideCellStyle}
          />

          <AgGridColumn
            width={150}
            headerName='Situation'
            valueGetter={(params) => situationGetter(params, timeframe, futureMode)}
            cellStyle={situationCellStyle}
          />

          {['p', 'tc', 'bc'].map((q) => (
            <AgGridColumn
              key={q}
              width={150}
              headerName={`${q.toUpperCase()} Distance`}
              valueFormatter={distanceFormatter}
              valueGetter={(params) => distanceGetter(params, q, timeframe, futureMode)}
              filter='agNumberColumnFilter'
            />
          ))}

          <AgGridColumn
            width={150}
            headerName='CPR Width'
            cellRenderer={cprWidthRenderer}
            valueGetter={(params) => cprWidthGetter(params, timeframe, futureMode)}
          />
        </AgGridReact>
      </div>

      {!gridApi || loading || tickers.length <= 1 ? (
        <MultilineSkeleton lines={5} style={{ width: '100%', height: 20 }} />
      ) : (
        <InfoRenderer />
      )}
    </div>
  );
};

CPRTable.propTypes = {
  futureMode: PropTypes.bool.isRequired,
  market: PropTypes.string.isRequired,
  timeframe: PropTypes.string.isRequired,
  screenerType: PropTypes.string.isRequired,
};

export default observer(CPRTable);
