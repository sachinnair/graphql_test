import React from "react";
import Plot from "react-plotly.js";

export default function ChartArea({data}) {
  return (
    <div>
{/*       <Plot
        data={[
          {
            x: ['red', 'blue', 'green'],
            y: [3, 6, 3],
            type: "scatter",
            marker: { color: "red" },
          },
          { type: "bar", x: ['red', 'blue', 'green'], y: [3, 5, 3] },
        ]}
        layout={{ width: 321, height: 240, title: "A Fancy Plot" }}
      /> */}

      <Plot
        data={data}
        layout={{ width: 621, height: 640, title: "Keyword Dominance" }}
      />
    </div>
  );
}
