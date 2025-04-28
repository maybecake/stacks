import React, { useState, useEffect } from "react";
import * as Slider from "@radix-ui/react-slider";
import "./time-learner.css";

// Define the three locations with their time zones (offset in hours from UTC)
const cities = [
  { name: "UTC", timezone: 0 },
  { name: "San Francisco", timezone: -7 },
  { name: "Honolulu", timezone: -10 },
  { name: "Toronto", timezone: -4 },
  { name: "Beijing", timezone: 8 },
];

export default function TimeLearner() {
  // Define time sections
  const timeSections = [
    { name: "night", label: "Night", range: [0, 6] },
    { name: "morning", label: "Morning", range: [6, 12] },
    { name: "afternoon", label: "Afternoon", range: [12, 18] },
    { name: "evening", label: "Evening", range: [18, 24] },
  ];

  // State to track the UTC time (in hours)
  const [utcTime, setUtcTime] = useState<number>(12); // Start with noon UTC

  // State to track local times for each city
  const [localTimes, setLocalTimes] = useState<number[]>([]);

  // State to track day differences for each city
  const [dayDifferences, setDayDifferences] = useState<number[]>([]);

  // Reference date for today (midnight UTC)
  const referenceDate = new Date();
  referenceDate.setUTCHours(0, 0, 0, 0);

  // State to track dragging state for each city
  const [draggingStates, setDraggingStates] = useState<
    {
      isDragging: boolean;
      startValue: number;
      currentValue: number;
    }[]
  >(cities.map(() => ({ isDragging: false, startValue: 0, currentValue: 0 })));

  // Update local times and day differences whenever UTC time changes
  useEffect(() => {
    const newLocalTimes = [];
    const newDayDifferences = [];

    for (const city of cities) {
      // Calculate local time
      const localHour = (utcTime + city.timezone + 24) % 24;
      newLocalTimes.push(localHour);

      // Calculate day difference
      // Create date objects for UTC and local time
      const utcDate = new Date(referenceDate);
      utcDate.setUTCHours(utcTime);

      const localDate = new Date(referenceDate);
      // Need to adjust for timezone when setting hours to get the correct day
      localDate.setUTCHours(utcTime + city.timezone);

      // Calculate day difference
      const utcDay = utcDate.getUTCDate();
      const localDay = localDate.getUTCDate();

      let dayDiff = 0;
      if (localDay > utcDay) {
        dayDiff = 1; // Next day
      } else if (localDay < utcDay) {
        dayDiff = -1; // Previous day
      }

      newDayDifferences.push(dayDiff);
    }

    setLocalTimes(newLocalTimes);
    setDayDifferences(newDayDifferences);
  }, [utcTime]);

  // Function to format time as 12-hour with AM/PM
  const formatTime = (hours: number) => {
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:00 ${period}`;
  };

  // Function to get day difference text
  const getDayDifferenceText = (diff: number) => {
    if (diff === 0) return "";
    if (diff === 1) return "+1 day";
    if (diff === -1) return "-1 day";
    return `${diff > 0 ? "+" : ""}${diff} days`;
  };

  // Function to determine if it's day or night
  const isDaytime = (hours: number) => {
    return hours >= 6 && hours < 18;
  };

  // Function to get the active time section
  const getActiveSection = (hours: number) => {
    for (const section of timeSections) {
      if (hours >= section.range[0] && hours < section.range[1]) {
        return section.name;
      }
    }
    return "night"; // Default
  };

  // Function to calculate time difference between cities
  const getTimeDifferences = (cityIndex: number) => {
    const currentCityTime =
      localTimes[cityIndex] !== undefined
        ? localTimes[cityIndex]
        : (utcTime + cities[cityIndex].timezone + 24) % 24;

    type TimeDiff = {
      cityName: string;
      isAhead: boolean;
      hours: number;
    };

    return cities
      .map((city, index) => {
        if (index === cityIndex) return null; // Skip current city

        const otherCityTime =
          localTimes[index] !== undefined
            ? localTimes[index]
            : (utcTime + city.timezone + 24) % 24;

        // Calculate difference considering day wrap-around
        let diff = otherCityTime - currentCityTime;
        if (diff > 12) diff -= 24;
        if (diff < -12) diff += 24;

        const isAhead = diff > 0;
        const diffHours = Math.abs(diff);

        return {
          cityName: city.name,
          isAhead,
          hours: diffHours,
        } as TimeDiff;
      })
      .filter((diff): diff is TimeDiff => diff !== null); // Type guard to ensure non-null values
  };

  // Handle slider change for any city
  const handleSliderChange = (cityIndex: number, newLocalTime: number) => {
    // Update dragging state
    setDraggingStates((prev) => {
      const newStates = [...prev];
      newStates[cityIndex] = {
        ...newStates[cityIndex],
        currentValue: newLocalTime,
      };
      return newStates;
    });

    // Convert the new local time back to UTC
    const newUtcTime = (newLocalTime - cities[cityIndex].timezone + 24) % 24;
    setUtcTime(newUtcTime);
  };

  // Handle drag start
  const handleDragStart = (cityIndex: number, startValue: number) => {
    setDraggingStates((prev) => {
      const newStates = [...prev];
      newStates[cityIndex] = {
        isDragging: true,
        startValue,
        currentValue: startValue,
      };
      return newStates;
    });
  };

  // Handle drag end
  const handleDragEnd = (cityIndex: number) => {
    setDraggingStates((prev) => {
      const newStates = [...prev];
      newStates[cityIndex] = {
        ...newStates[cityIndex],
        isDragging: false,
      };
      return newStates;
    });
  };

  // Calculate hour difference for drag indicator
  const getHourDifference = (startValue: number, currentValue: number) => {
    let diff = currentValue - startValue;

    // Handle wrap-around cases
    if (diff > 12) diff = diff - 24;
    if (diff < -12) diff = diff + 24;

    return diff;
  };

  return (
    <div className="time-learner">
      <div className="time-learner__container">
        <h1 className="time-learner__title">Time Zone Explorer</h1>

        <div className="time-learner__grid">
          <div className="time-learner__grid-header">
            <div className="time-learner__header-cell">Location</div>
            <div className="time-learner__header-cell">Local Time</div>
          </div>

          {cities.map((city, index) => {
            const localTime =
              localTimes[index] !== undefined
                ? localTimes[index]
                : (utcTime + city.timezone + 24) % 24;
            const dayDiff = dayDifferences[index] || 0;
            const daytime = isDaytime(localTime);
            const activeSection = getActiveSection(localTime);
            const timeDifferences = getTimeDifferences(index);

            const { isDragging, startValue, currentValue } =
              draggingStates[index];
            const hourDiff = getHourDifference(startValue, currentValue);
            const isDiffPositive = hourDiff > 0;
            const diffText =
              hourDiff !== 0
                ? `${isDiffPositive ? "+" : ""}${hourDiff} hour${
                    Math.abs(hourDiff) !== 1 ? "s" : ""
                  }`
                : "";

            return (
              <div key={city.name} className="time-learner__grid-row">
                <div className="time-learner__city-cell">
                  <span className="time-learner__city-name">{city.name}</span>
                  <div className="time-learner__time-differences">
                    {timeDifferences.map((diff, i) => (
                      <span
                        key={i}
                        className={`time-learner__time-difference ${
                          diff.isAhead
                            ? "time-learner__time-difference--ahead"
                            : "time-learner__time-difference--behind"
                        }`}
                      >
                        {diff.cityName} is {diff.hours}{" "}
                        {diff.hours === 1 ? "hour" : "hours"}{" "}
                        {diff.isAhead ? "ahead" : "behind"}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="time-learner__time-cell">
                  <div className="time-learner__time-display">
                    <span className="time-learner__time">
                      {formatTime(localTime)}
                    </span>
                    <span
                      className={`time-learner__time-badge ${
                        daytime
                          ? "time-learner__time-badge--day"
                          : "time-learner__time-badge--night"
                      }`}
                    >
                      {daytime ? "Day" : "Night"}
                    </span>
                    {dayDiff !== 0 && (
                      <span
                        className={`time-learner__day-indicator ${
                          dayDiff > 0
                            ? "time-learner__day-indicator--next"
                            : "time-learner__day-indicator--prev"
                        }`}
                      >
                        {getDayDifferenceText(dayDiff)}
                      </span>
                    )}
                  </div>

                  <div className="time-learner__slider-container">
                    <div className="time-learner__slider-label">
                      <span className="time-learner__slider-label-text">
                        12 AM
                      </span>
                    </div>
                    <div className="time-learner__slider-wrapper">
                      <Slider.Root
                        className="slider-root"
                        value={[localTime]}
                        min={0}
                        max={23}
                        step={1}
                        onValueChange={(value: number[]) =>
                          handleSliderChange(index, value[0])
                        }
                        onValueCommit={() => handleDragEnd(index)}
                        onPointerDown={() => handleDragStart(index, localTime)}
                      >
                        <Slider.Track className="slider-track">
                          <Slider.Range className="slider-range" />
                        </Slider.Track>
                        <Slider.Thumb
                          className="slider-thumb"
                          aria-label="Time slider"
                        >
                          <div
                            className={`time-learner__drag-indicator ${
                              isDragging && hourDiff !== 0
                                ? "time-learner__drag-indicator--visible"
                                : ""
                            } ${
                              hourDiff > 0
                                ? "time-learner__drag-indicator--positive"
                                : hourDiff < 0
                                ? "time-learner__drag-indicator--negative"
                                : ""
                            }`}
                          >
                            {diffText}
                          </div>
                        </Slider.Thumb>
                      </Slider.Root>

                      <div className="time-section-indicators">
                        {timeSections.map((section) => {
                          const isActive = activeSection === section.name;
                          const sectionWidth =
                            ((section.range[1] - section.range[0]) / 24) * 100;
                          return (
                            <div
                              key={section.name}
                              className={`time-section time-section--${
                                section.name
                              } ${isActive ? "time-section--active" : ""}`}
                              style={{ width: `${sectionWidth}%` }}
                            >
                              <span className="time-section__label">
                                {section.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="time-learner__slider-label">
                      <span className="time-learner__slider-label-text">
                        11 PM
                      </span>
                    </div>
                  </div>

                  <div className="time-learner__time-markers">
                    <span className="time-learner__time-marker">6 AM</span>
                    <span className="time-learner__time-marker">12 PM</span>
                    <span className="time-learner__time-marker">6 PM</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
