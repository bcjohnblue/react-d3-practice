import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';

import countryDataJSON, { CountryData, Country } from '../data/country';

/* https://www.udemy.com/course/masteringd3js/learn/lecture/9441110#overview */
const ScatterPlot = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const textRef = useRef<SVGTextElement>(null);

  const countryData = countryDataJSON as CountryData;
  const filteredCountryData = countryData.map((item) => ({
    countries: item.countries.filter(
      (country) => country.income && country.life_exp
    ),
    year: item.year,
  }));
  // console.log(filteredCountryData);

  // const data = filteredCountryData[0].countries;

  const [year, setYear] = useState(1874);

  const [data, setData] = useState<Country[]>();

  useEffect(() => {
    const timer = setInterval(() => {
      const data = filteredCountryData.find(
        (item) => item.year === year.toString()
      )?.countries;
      setData(data);
      setYear((year) => year + 1);

      clearInterval(timer);
    }, 200);
    return () => {
      clearInterval(timer);
    };
  }, [filteredCountryData, year]);

  const render = useCallback(
    (data: Country[]) => {
      const margin = {
        left: 100,
        right: 10,
        top: 10,
        bottom: 100,
      };
      const width = 600 - (margin.left + margin.right);
      const height = 400 - (margin.top + margin.bottom);

      d3.select(svgRef.current)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)

      const g = d3
        .select(gRef.current)
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

      // x label
      g.append('text')
        .attr('class', 'x axis-label')
        .attr('x', width / 2)
        .attr('y', height + 50)
        .attr('font-size', '20px')
        .attr('text-anchor', 'middle')
        .text('GDP Per Capita ($)');

      // y label
      g.append('text')
        .attr('class', 'y axis-label')
        .attr('x', -(height / 2))
        .attr('y', -60)
        .attr('font-size', '20px')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .text('Life Expectancy (Years)');

      // year label
      const text = d3.select(textRef.current);

      // const text = g.selectAll(textRef.current)
      // const text = g.append('text')
      text
        .attr('class', 'year label')
        .attr('x', width - 40)
        .attr('y', height - 20)
        .attr('font-size', '30px')
        .attr('text-anchor', 'middle')
        .text(year);

      text.exit().remove();

      const x = d3
        .scaleLog()
        .domain([300, 150000])
        // .domain([300, d3.max(data, (d) => d.income) as number])
        // .domain(data.map((d) => d.income))
        .range([0, width])
        .base(10);

      const y = d3
        .scaleLinear()
        .domain([0, 90])
        // .domain([0, d3.max(data, (d) => d.life_exp) as number])
        .range([height, 0]);

      const area = d3
        .scaleLinear()
        // .domain(d3.extent(data.map((d) => d.population)) as [number, number])
        .domain([2000, 1400000000])
        .range([25 * Math.PI, 1500 * Math.PI]);
      // const r = d3
      //   .scaleLog()
      //   .domain([1, d3.max(data, (d) => d.population) as number])
      //   .range([1, 7])
      //   .base(10);

      const color = d3
        .scaleOrdinal(d3.schemeCategory10)
        .domain(['asia', 'americas', 'africa', 'europe']);
      // .domain(data.map((d) => d.continent));

      // console.log(d3.schemeCategory10);
      // console.log(data.map((d) => d.continent));

      // x-axis
      const xAxisCall = d3
        .axisBottom(x)
        .tickFormat(d3.format('0'))
        .tickValues([400, 4000, 40000]);
      g.append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(0, ${height})`)
        // .attr('transform', `translate(0, ${height})`)
        .call(xAxisCall);
      // .selectAll('text')
      // .attr('y', '10');

      // y-axis
      const yAxisCall = d3.axisLeft(y);
      g.append('g').attr('class', 'y axis').call(yAxisCall);

      const circle: d3.Selection<
        SVGCircleElement,
        any,
        SVGGElement | null,
        unknown
      > = g.selectAll<SVGCircleElement, any>('circle').data<any>(data, (d) => {
        return d.country;
      });

      // update()
      circle
        .attr('cy', (d) => y(d.life_exp))
        .attr('cx', (d) => x(d.income))
        .attr('r', (d) => Math.sqrt(area(d.population) / Math.PI))
        // .attr('height', (d) => (height - y(+d.life_exp)))
        // .attr('fill', 'gray');
        .attr('fill', (d) => color(d.continent));

      // enter()
      circle
        .enter()
        .append('circle')
        .attr('cy', (d) => y(d.life_exp))
        .attr('cx', (d) => x(d.income))
        .attr('r', (d) => Math.sqrt(area(d.population) / Math.PI))
        // .attr('height', (d) => (height - y(+d.life_exp)))
        // .attr('fill', 'gray');
        .attr('fill', (d) => color(d.continent));
      // .merge(circle);

      // exit()
      circle.exit().remove();
    },
    [year]
  );

  useEffect(() => {
    if (!data) return;
    render(data);
  }, [data, render]);

  // useEffect(() => {
  //   effect
  //   return () => {
  //     cleanup
  //   }
  // }, [input])

  return (
    <div className="bar-chart">
      <svg ref={svgRef}>
        <g ref={gRef}>
          <text ref={textRef}></text>
        </g>
      </svg>
    </div>
  );
};

export default ScatterPlot;
