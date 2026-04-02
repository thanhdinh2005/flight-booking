/**
 * Test file to validate flight data transformation from API response
 * Remove or comment out after testing
 */

// Sample API response from the user
const sampleApiResponse = {
  success: true,
  message: "Tìm kiếm chuyến bay thành công.",
  data: {
    outbound: {
      status: "SUGGESTED",
      message: "Hãng hiện không có lịch bay vào ngày 2026-04-02. Bạn có thể tham khảo các ngày lân cận sau:",
      target_date: "2026-04-02",
      data: [
        {
          date: "2026-04-03",
          label: "03/04",
          is_target: false,
          flights: [
            {
              id: 21,
              flight_number: "VNCQ6C",
              std: "06:00",
              sta: "07:20",
              aircraft: "Boeing 787-9",
              seats: [
                {
                  class: "ECONOMY",
                  price: 800000,
                  available: 250
                },
                {
                  class: "BUSINESS",
                  price: 800000,
                  available: 28
                }
              ]
            },
            {
              id: 27,
              flight_number: "VNSH3R",
              std: "16:00",
              sta: "17:20",
              aircraft: "Airbus A321",
              seats: [
                {
                  class: "ECONOMY",
                  price: 800000,
                  available: 150
                },
                {
                  class: "BUSINESS",
                  price: 800000,
                  available: 16
                }
              ]
            }
          ]
        },
        {
          date: "2026-04-04",
          label: "04/04",
          is_target: false,
          flights: [
            {
              id: 28,
              flight_number: "VNSH3R",
              std: "16:00",
              sta: "17:20",
              aircraft: "Airbus A321",
              seats: [
                {
                  class: "ECONOMY",
                  price: 800000,
                  available: 150
                },
                {
                  class: "BUSINESS",
                  price: 800000,
                  available: 16
                }
              ]
            }
          ]
        }
      ]
    },
    return: null
  },
  meta: null
};

// Transformation functions (copied from FlightResults.jsx)
function normalizeFlightItem(f) {
  let prices = f.prices;
  if (!prices && f.seats && Array.isArray(f.seats)) {
    prices = {};
    f.seats.forEach((seat) => {
      if (seat.class && seat.price) {
        prices[seat.class] = seat.price;
      }
    });
  }

  if (!prices || Object.keys(prices).length === 0) {
    const basePrice = f.price || 0;
    prices = {
      ECONOMY:  basePrice,
      BUSINESS: basePrice * 3,
    };
  }

  return {
    ...f,
    airline:    f.airline    || "Vietnam Airlines",
    flightNo:   f.flightNo   || f.flight_number,
    dep:        f.dep        || f.std || f.dep_time,
    arr:        f.arr        || f.sta || f.arr_time,
    depAirport: f.depAirport || f.origin_name || f.origin || "Nội Bài",
    arrAirport: f.arrAirport || f.destination_name || f.destination || "Tân Sơn Nhất",
    depCode:    f.depCode    || f.origin || "HAN",
    arrCode:    f.arrCode    || f.destination || "SGN",
    duration:   f.duration   || "2g00p",
    aircraft:   f.aircraft   || "Airbus A321",
    prices,
    seats:      f.seats,
  };
}

function normalizeSection(section, fallback = []) {
  if (!section || typeof section !== "object") {
    const flights = (fallback || []).map(normalizeFlightItem);
    return {
      status: flights.length ? "FOUND_TARGET" : "EMPTY",
      message: "",
      targetDate: "",
      days: flights.length ? [{ date: "", label: "", isTarget: true, flights }] : [],
      allFlights: flights,
    };
  }

  if (section.data && Array.isArray(section.data)) {
    const days = section.data.map((dayData) => ({
      date:      dayData.date || "",
      label:     dayData.label || "",
      isTarget:  dayData.is_target || false,
      flights:   (dayData.flights || []).map(normalizeFlightItem),
    }));

    return {
      status:     section.status || (days.length ? "FOUND_TARGET" : "SUGGESTED"),
      message:    section.message || "",
      targetDate: section.target_date || section.targetDate || "",
      days,
      allFlights: days.flatMap((day) => day.flights),
    };
  }

  if (section.days && Array.isArray(section.days)) {
    const days = section.days.map((day) => ({
      ...day,
      flights: (day.flights || []).map(normalizeFlightItem),
    }));

    return {
      status:     section.status || (days.length ? "FOUND_TARGET" : "SUGGESTED"),
      message:    section.message || "",
      targetDate: section.targetDate || "",
      days,
      allFlights: days.flatMap((day) => day.flights),
    };
  }

  const flights = (fallback || []).map(normalizeFlightItem);
  return {
    status:     flights.length ? "FOUND_TARGET" : "EMPTY",
    message:    "",
    targetDate: "",
    days:       flights.length ? [{ date: "", label: "", isTarget: true, flights }] : [],
    allFlights: flights,
  };
}

// Test the transformation
console.log('=== TESTING FLIGHT DATA TRANSFORMATION ===\n');
console.log('Raw API Response:', JSON.stringify(sampleApiResponse.data.outbound, null, 2));

const transformedData = normalizeSection(sampleApiResponse.data.outbound);

console.log('\n\nTransformed Data Structure:', JSON.stringify(transformedData, null, 2));

console.log('\n\n=== SUMMARY ===');
console.log(`✓ Status: ${transformedData.status}`);
console.log(`✓ Message: ${transformedData.message}`);
console.log(`✓ Target Date: ${transformedData.targetDate}`);
console.log(`✓ Number of days: ${transformedData.days.length}`);
console.log(`✓ Total flights: ${transformedData.allFlights.length}`);

transformedData.days.forEach((day, idx) => {
  console.log(`\nDay ${idx + 1}: ${day.label} (${day.date})`);
  console.log(`  - Is Target: ${day.isTarget}`);
  console.log(`  - Flights: ${day.flights.length}`);
  
  day.flights.forEach((flight, fIdx) => {
    console.log(`\n  Flight ${fIdx + 1}:`);
    console.log(`    Flight No: ${flight.flightNo}`);
    console.log(`    Time: ${flight.dep} → ${flight.arr}`);
    console.log(`    Aircraft: ${flight.aircraft}`);
    console.log(`    Prices: Economy=${flight.prices.ECONOMY}, Business=${flight.prices.BUSINESS}`);
    console.log(`    Available Seats: ${JSON.stringify(flight.seats.map(s => `${s.class}=${s.available}`))}`);
  });
});
