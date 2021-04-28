import React from 'react';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import { observer } from 'mobx-react-lite';
import { useMst } from 'models/Root';
import withWidth from '@material-ui/core/withWidth';

const ChartOptions = observer(({ width }) => {
  const timeframes = ['Daily', 'Weekly', 'Monthly'];
  const xs = width === 'xs';

  const { chartOptions } = useMst((store) => ({
    chartOptions: store.chartOptions,
  }));

  const handleChange = (event) => {
    if (chartOptions[event.target.name]) {
      chartOptions[event.target.name](event.target.checked);
    }
  };

  return (
    <>
      <FormGroup row={xs ? false : true}>
        {timeframes.map((q) => {
          return (
            <FormGroup column={xs ? false : true} key={q}>
              <FormControlLabel
                control={
                  <Switch
                    checked={chartOptions[`${q.toLowerCase()}CPR`]}
                    onChange={handleChange}
                    name={`set${q}CPR`} // Function name on chartOptions to be called on change
                    color='primary'
                  />
                }
                label={`${q} CPR`}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={chartOptions[`${q.toLowerCase()}Cam`]}
                    onChange={handleChange}
                    name={`set${q}Cam`} // Function name on chartOptions to be called on change
                    color='primary'
                  />
                }
                label={`${q} Camarilla`}
              />
            </FormGroup>
          );
        })}
      </FormGroup>
      <FormControlLabel
        control={
          <Switch
            checked={chartOptions.futureMode}
            onChange={handleChange}
            name='setFutureMode' // Function name on chartOptions to be called on change
            color='primary'
          />
        }
        label='Show developing pivots'
      />
    </>
  );
});

export default withWidth()(ChartOptions);