import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

import data from '../data/revenues.json';

/* https://www.udemy.com/course/masteringd3js/learn/lecture/9441110#overview */
const BarChart = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    console.log(data);

    const margin = {
      left: 100,
      right: 10,
      top: 10,
      bottom: 100,
    };
    const width = 600 - (margin.left + margin.right);
    const height = 400 - (margin.top + margin.bottom);

    const g = d3
      .select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // x label
    g.append('text')
      .attr('class', 'x axis-label')
      .attr('x', width / 2)
      .attr('y', height + 50)
      .attr('font-size', '20px')
      .attr('text-anchor', 'middle')
      .text('Month');

    // y label
    g.append('text')
      .attr('class', 'y axis-label')
      .attr('x', -(height / 2))
      .attr('y', -60)
      .attr('font-size', '20px')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .text('Revenues');

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.month))
      .range([0, width])
      .paddingInner(0.3)
      .paddingOuter(0.3);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => +d.revenue) as number])
      .range([height, 0]);

    // x-axis
    const xAxisCall = d3.axisBottom(x);
    g.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxisCall)
      .selectAll('text')
      .attr('y', '10');

    // y-axis
    const yAxisCall = d3.axisLeft(y);
    g.append('g').attr('class', 'y axis').call(yAxisCall);

    const rects = g.selectAll('rect').data(data);
    rects
      .enter()
      .append('rect')
      .attr('y', (d) => y(+d.revenue))
      .attr('x', (d) => x(d.month) as number)
      .attr('width', x.bandwidth)
      .attr('height', (d) => (height - y(+d.revenue)) as number)
      .attr('fill', 'gray');

    const yProfit = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => +d.revenue) as number])
      .range([height, 0]);
    rects
      .enter()
      .append('rect')
      .attr('y', (d) => yProfit(+d.profit))
      .attr('x', (d) => x(d.month) as number)
      .attr('width', x.bandwidth)
      .attr('height', (d) => (height - yProfit(+d.profit)) as number)
      .attr('fill', 'blue');
  }, []);

  return (
    <div className="bar-chart">
      <svg ref={svgRef}></svg>
    </div>
  );
}

export default BarChart