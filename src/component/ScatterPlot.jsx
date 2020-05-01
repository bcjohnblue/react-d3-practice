import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import styled from 'styled-components';
import useInterval from '../hooks/useInterval';

import countryData from '../data/country';
const formatedData = countryData.map((item) => ({
  countries: item.countries.filter(
    (country) => country.income && country.life_exp
  ),
  year: item.year,
}));

const SVG = styled.svg({
  display: 'block',
  margin: '50px auto',
  width: (props) => props.width,
  height: (props) => props.height,
});

const BtnContainer = styled.div({
  marginTop: '20px',
  marginLeft: '20px',
});

const Button = styled.button({
  color: '#fff',
  backgroundColor: '#3294F0',
  fontSize: '1.02rem',
  borderRadius: '5px',
  padding: '7px 15px',
  cursor: 'pointer',
});

const PlayBtn = styled(Button)({
  backgroundColor: (props) => (props.type === 'Pause' ? 'red' : '#3294F0'),
});

const ResetBtn = styled(Button)({
  marginLeft: '5px',
});

/* https://www.udemy.com/course/masteringd3js/learn/lecture/9441110#overview */
const ScatterPlot = () => {
  // Set width, height
  const margin = {
    left: 100,
    right: 10,
    top: 10,
    bottom: 100,
  };
  const width = 600 - (margin.left + margin.right);
  const height = 400 - (margin.top + margin.bottom);

  // scale
  const x = d3.scaleLog().domain([300, 150000]).range([0, width]).base(10);
  const y = d3.scaleLinear().domain([0, 90]).range([height, 0]);
  const area = d3
    .scaleLinear()
    .domain([2000, 1400000000])
    .range([25 * Math.PI, 1500 * Math.PI]);

  // continents
  const continents = (() => {
    const continents = formatedData[0].countries.map((item) => item.continent);
    const set = new Set(continents);
    return Array.from(set.values());
  })();
  const color = d3.scaleOrdinal(d3.schemeCategory10).domain(continents);

  // Data setting
  const INIT_YEAR = 1874;
  const MAX_YEAR = 2014;
  const getData = (year) =>
    formatedData.find((item) => item.year === year.toString())?.countries;

  const [data, setData] = useState({
    value: getData(INIT_YEAR),
    year: INIT_YEAR,
  });

  // Render data
  const gRef = useRef();
  const renderData = useCallback(
    (data) => {
      const g = d3.select(gRef.current);
      const circle = g.selectAll('circle').data(data, (d) => d.country);

      // join()
      circle
        .join('circle')
        // .enter()
        // .append('circle')
        .attr('cy', (d) => y(d.life_exp))
        .attr('cx', (d) => x(d.income))
        .attr('r', (d) => Math.sqrt(area(d.population) / Math.PI))
        .attr('fill', (d) => color(d.continent));

      // circle.exit().remove();

      // update()
      // circle
      //   .attr('cy', (d) => y(d.life_exp))
      //   .attr('cx', (d) => x(d.income))
      //   .attr('r', (d) => Math.sqrt(area(d.population) / Math.PI))
      //   .attr('fill', (d) => color(d.continent));
      // .merge(circle);
    },
    [area, color, x, y]
  );

  useEffect(() => {
    if(data.value) renderData(data.value);
  }, [renderData, data.value]);


  // Run useInterval
  const [run, setRun] = useState({
    delay: null,
    text: 'Play',
  });

  useInterval(() => {
    setData((prevData) => ({
      value: getData(prevData.year + 1),
      year: prevData.year + 1,
    }));

    if (data.year >= MAX_YEAR) {
      setRun({
        delay: null,
        text: 'Play',
      });
    }
  }, run.delay);

  /* BtnContainerDOM */
  const BtnContainerDOM = (() => {
    const play = () => {
      setRun({
        delay: 100,
        text: 'Pause',
      });
    };
    const pause = () => {
      setRun({
        delay: null,
        text: 'Play',
      });
    };
    const onPlayClick = () => {
      if (data.year >= MAX_YEAR) {
        setData({
          value: getData(INIT_YEAR),
          year: INIT_YEAR,
        });
        play();
      } else run.delay ? pause() : play();
    };
    const onResetClick = () => {
      setData({
        value: getData(INIT_YEAR),
        year: INIT_YEAR,
      });
      pause();
    };

    return (
      <BtnContainer>
        <PlayBtn onClick={onPlayClick} type={run.text}>
          {run.text}
        </PlayBtn>
        <ResetBtn onClick={onResetClick}>Reset</ResetBtn>
      </BtnContainer>
    );
  })();

  /* YearTextDOM */
  const YearTextDOM = (() => (
    <text
      className="year-label"
      x={width - 40}
      y={height - 20}
      fontSize="30px"
      textAnchor="middle"
    >
      {data.year}
    </text>
  ))();

  /* LabelDOM */
  const LabelDOM = (() => (
    <>
      <text
        className="x-axis-label"
        x={width / 2}
        y={height + 50}
        fontSize="20px"
        textAnchor="middle"
      >
        GDP Per Capita ($)
      </text>
      <text
        className="y-axis-label"
        x={-(height / 2)}
        y={-60}
        fontSize="20px"
        textAnchor="middle"
        transform="rotate(-90)"
      >
        Life Expectancy (Years)
      </text>
    </>
  ))();

  /* LegendDOM */
  const LegendDOM = (() => (
    <g transform={`translate(${width - 20}, ${height - 145})`}>
      {continents.map((continent, i) => (
        <g transform={`translate(${0}, ${i * 20})`} key={i}>
          <rect width="10" height="10" fill={color(continent)}></rect>
          <text
            x="-10"
            y="10"
            textAnchor="end"
            style={{ textTransform: 'capitalize' }}
          >
            {continent}
          </text>
        </g>
      ))}
    </g>
  ))();

  /* Axis */
  const xAxisRef = useRef();
  const yAxisRef = useRef();

  useEffect(() => {
    // x-axis
    const xAxisCall = d3
      .axisBottom(x)
      .tickFormat(d3.format('0'))
      .tickValues([400, 4000, 40000]);
    d3.select(xAxisRef.current).call(xAxisCall);
    // y-axis
    const yAxisCall = d3.axisLeft(y);
    d3.select(yAxisRef.current).call(yAxisCall);
  }, [x, xAxisRef, y, yAxisRef]);
  const AxisDOM = (() => (
    <g>
      <g
        ref={xAxisRef}
        className="x-axis"
        transform={`translate(0, ${height})`}
      ></g>
      <g ref={yAxisRef} className="y-axis"></g>
    </g>
  ))();

  return (
    <div className="scatter-plot">
      {BtnContainerDOM}
      <SVG
        width={width + margin.left + margin.right}
        height={height + margin.top + margin.bottom}
      >
        <g ref={gRef} transform={`translate(${margin.left}, ${margin.top})`}>
          {YearTextDOM}
          {LabelDOM}
          {LegendDOM}
          {AxisDOM}
        </g>
      </SVG>
    </div>
  );
};

export default ScatterPlot;
