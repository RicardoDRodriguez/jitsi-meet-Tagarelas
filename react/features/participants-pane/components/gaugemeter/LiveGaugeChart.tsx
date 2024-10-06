import React, { useState, useEffect } from "react";
import GaugeChart from "react-gauge-chart";

import DataBaseForGauge from '././DataBaseForGauge';
import { withPixelLineHeight } from "../../../base/styles/functions.web";
import { makeStyles } from 'tss-react/mui'


const chartStyle: React.CSSProperties = {
  height: 10
};

interface LiveGaugeChartProps {
  database: DataBaseForGauge;
}

const LiveGaugeChart: React.FC<LiveGaugeChartProps> = ({ database }) => {
  const [value, setValue] = useState<number>(0.0); // Initial value


  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(async () => {
      let newValue = 0;

      newValue = await database.calcularGini();
      console.log("=== New Value: ", newValue);

      if (!Number.isNaN(newValue)) {
        console.log('=== newValue é um número ===');
      } else {
        newValue = 0.35 ;
      }
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

      <div  style={{ position: 'absolute', top: '17.5%', left: '24%', transform: 'translate(-50%, -50%)', color: '#E4080A' }}>
        <span style={{ color: '#E4080A' }}><b>CONCENTRADA</b></span>
      </div>
      <div  style={{ position: 'absolute', top: '6.5%', left: '50%', transform: 'translate(-50%, -50%)', color: '#7DDA58' }}>
        <span><b>MODERADA</b></span>
      </div>
      <div style={{ position: 'absolute', top: '17.5%', left: '76.5%', transform: 'translate(-50%, -50%)', color: '#5DE2E7' }}>
        <span><b>IGUALITÁRIA</b></span>
      </div>
      <div>
        <GaugeChart
          id="gauge-chart1"
          style={chartStyle}
          arcsLength={[0.1, 0.1, 0.1, 0.4, 0.3]}
          colors={["#E4080A", "#FF9101", "#FFDE59", "#7DDA58", "#5DE2E7"]}
          percent={value}
          arcPadding={0.00}
          textColor="#FFFFFF"
          formatTextValue={(value: number): string => `${value.toFixed(1)}%`}
        />
      </div>
    </div>
  );
};

export default LiveGaugeChart;

