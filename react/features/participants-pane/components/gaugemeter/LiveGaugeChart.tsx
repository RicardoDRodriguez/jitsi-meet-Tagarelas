import React, { useState, useEffect } from "react";
import GaugeChart from "react-gauge-chart";

import DataBaseForGauge from '././DataBaseForGauge';
import { withPixelLineHeight } from "../../../base/styles/functions.web";
import { makeStyles } from "tss-react/mui";


const database = new DataBaseForGauge();

const chartStyle: React.CSSProperties = {
  height: 10
};

const useStyles = makeStyles ()(theme => {
  return {
      container: {
          margin: `${theme.spacing(3)} 0`
      },
      headingW: {
          color: theme.palette.warning02
      },
      drawerActions: {
          listStyleType: 'none',
          margin: 0,
          padding: 0
      },
      drawerItem: {
          alignItems: 'center',
          color: theme.palette.text01,
          display: 'flex',
          padding: '12px 16px',
          ...withPixelLineHeight(theme.typography.bodyShortRegularLarge),

          '&:first-child': {
              marginTop: '15px'
          },

          '&:hover': {
              cursor: 'pointer',
              background: theme.palette.action02
          }
      },
      icon: {
          marginRight: 16
      },
      headingContainer: {
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'space-between'
      },
      heading: {
          ...withPixelLineHeight(theme.typography.bodyShortBold),
          color: theme.palette.text02
      },
      link: {
          ...withPixelLineHeight(theme.typography.labelBold),
          color: theme.palette.link01,
          cursor: 'pointer'
      }
  };
});

const LiveGaugeChart: React.FC = () => {
  const [value, setValue] = useState<number>(0.0); // Initial value

  
  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(async () => {
      let newValue = 0;

      newValue = await database.calcularGini();
      console.log("***** New Value: *****", newValue);

      if (newValue < 0) {
        newValue = 0;
      } else if (newValue > 1) {
        newValue = 1;
      }

      setValue(newValue);

    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div className = { classes.headingContainer } style={{ position: 'absolute', top: '17.5%', left: '44%', transform: 'translate(-50%, -50%)', color: '#E4080A' }}>
        <span style={{ color: '#E4080A' }}><b>CONCENTRADA</b></span>
      </div>
      <div style={{ position: 'absolute', top: '6.5%', left: '50%', transform: 'translate(-50%, -50%)', color: '#7DDA58' }}>
        <span><b>MODERADA</b></span>
      </div>
      <div style={{ position: 'absolute', top: '17.5%', left: '56.5%', transform: 'translate(-50%, -50%)', color: '#5DE2E7' }}>
        <span><b>IGUALITÁRIA</b></span>
      </div>
      <GaugeChart
        id="gauge-chart1"
        style={chartStyle}
        arcsLength={[0.1, 0.1, 0.1, 0.4, 0.3]}
        colors={["#E4080A", "#FF9101", "#FFDE59", "#7DDA58", "#5DE2E7"]}
        percent={value}
        arcPadding={0.00}
        textColor="#000000"
        //formatTextValue={(value: number): string => `${value.toFixed(1)}%`}
      />
    </div>
  );
};

export default LiveGaugeChart;

