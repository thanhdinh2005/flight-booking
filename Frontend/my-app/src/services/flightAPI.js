// src/services/flightAPI.js
const BASE_URL = 'https://backend.test/api';

function parseDateTime(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  const raw = String(value).trim();
  if (!raw) return null;

  if (/^\d{2}:\d{2}$/.test(raw)) {
    return new Date(`1970-01-01T${raw}:00`);
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatTimeValue(value) {
  if (!value) return '--:--';
  if (/^\d{2}:\d{2}$/.test(String(value).trim())) return String(value).trim();

  const date = parseDateTime(value);
  return date
    ? date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    : String(value);
}

function formatDateValue(value) {
  const date = parseDateTime(value);
  return date ? date.toLocaleDateString('vi-VN') : '';
}

function buildPrices(seats, fallbackPrice = 0) {
  const prices = {};

  if (Array.isArray(seats)) {
    seats.forEach((seat) => {
      if (seat?.class) {
        prices[seat.class] = Number(seat.price ?? 0);
      }
    });
  }

  const basePrice = Number(
    prices.ECONOMY
    ?? prices.BUSINESS
    ?? fallbackPrice
    ?? 0
  );

  return {
    ECONOMY: Number(prices.ECONOMY ?? basePrice),
    BUSINESS: Number(prices.BUSINESS ?? (basePrice > 0 ? basePrice * 3 : 0)),
  };
}

/**
 * Search flights API
 * @param {Object} params
 * @param {string} params.origin - Origin airport code (e.g., 'DAD')
 * @param {string} params.destination - Destination airport code (e.g., 'HAN')
 * @param {string} params.departure_date - Departure date (YYYY-MM-DD)
 * @param {string} params.return_date - Return date (optional, YYYY-MM-DD)
 * @param {number} params.adults - Number of adults (default: 1)
 * @returns {Promise<Object>} Flight search results with outbound and return flights
 */
export async function searchFlights({
  origin,
  destination,
  departure_date,
  return_date,
  adults = 1,
}) {
  const searchParams = new URLSearchParams();
  searchParams.append('origin', origin);
  searchParams.append('destination', destination);
  searchParams.append('departure_date', departure_date);
  searchParams.append('adults', adults.toString());
  
  if (return_date) {
    searchParams.append('return_date', return_date);
  }

  const url = `${BASE_URL}/flights/search?${searchParams.toString()}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return await response.json();
}

/**
 * Search airports API
 * @param {string} query - Search query (airport code, city, or name)
 * @returns {Promise<Array>} List of matching airports
 */
export async function searchAirports(query) {
  if (!query || query.length < 1) return [];
  
  const url = `${BASE_URL}/airports/search?q=${encodeURIComponent(query)}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.data || [];
}

/**
 * Get all airports
 * @returns {Promise<Array>} List of all airports
 */
export async function getAllAirports() {
  const url = `${BASE_URL}/airports`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.data || [];
}

/**
 * Format flight data for display
 * @param {Object} flight - Raw flight data from API
 * @returns {Object} Formatted flight data
 */
export function formatFlight(flight) {
  const depDate = parseDateTime(flight.std);
  const arrDate = parseDateTime(flight.sta);
  const dep_time = formatTimeValue(flight.std);
  const arr_time = formatTimeValue(flight.sta);
  const originCode = flight.origin?.code || flight.origin || '';
  const destinationCode = flight.destination?.code || flight.destination || '';
  const fallbackPrice = flight.price ?? flight.seats?.[0]?.price ?? generatePrice(originCode, destinationCode);
  const prices = buildPrices(flight.seats, fallbackPrice);

  return {
    id:               flight.id,
    flight_number:    flight.flight_number,
    flightNo:         flight.flight_number,           // alias cho FlightResults
    airline:          flight.airline?.name || 'Vietnam Airlines',
    code:             flight.airline?.iata || 'VN',
    origin:           originCode,
    origin_name:      flight.origin?.name || originCode,
    origin_city:      flight.origin?.city || flight.origin?.name || originCode,
    destination:      destinationCode,
    destination_name: flight.destination?.name || destinationCode,
    destination_city: flight.destination?.city || flight.destination?.name || destinationCode,
    // Cả 2 tên field để tương thích FlightResults (dep/arr) và PassengerForm (dep_time/arr_time)
    dep:              dep_time,
    arr:              arr_time,
    dep_time:         dep_time,
    arr_time:         arr_time,
    dep_date:         formatDateValue(flight.std) || flight.date || '',
    arr_date:         formatDateValue(flight.sta) || flight.date || '',
    depCode:          originCode,
    arrCode:          destinationCode,
    depAirport:       flight.origin?.name || originCode,
    arrAirport:       flight.destination?.name || destinationCode,
    duration:         calculateDuration(depDate, arrDate),
    price:            Number(prices.ECONOMY || fallbackPrice || 0),
    prices,
    aircraft:         flight.aircraft?.model || flight.aircraft || 'Airbus A321',
    class:            flight.seat_class || 'Phổ thông',
    status:           flight.status,
    registration:     flight.aircraft?.registration,
    baggage:          flight.baggage     || '1 xách tay 7kg',
    checkin:          flight.checkin_bag || 'Xem thêm khi đặt vé',
    meal:             flight.meal        || 'Không',
    wifi:             flight.wifi        || 'Không',
    refund:           flight.refund_policy  || 'Vui lòng kiểm tra với hãng',
    exchange:         flight.change_policy  || 'Vui lòng kiểm tra với hãng',
    logoColor:        '#1a3c6e',
    logoText:         '#fff',
  };
}

/**
 * Calculate flight duration
 */
function calculateDuration(dep, arr) {
  if (!(dep instanceof Date) || Number.isNaN(dep.getTime()) || !(arr instanceof Date) || Number.isNaN(arr.getTime())) {
    return 'Chưa xác định';
  }

  const diff = arr - dep;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

/**
 * Generate price based on route (mock pricing logic)
 */
function generatePrice(origin, destination) {
  const basePrices = {
    'HAN-SGN': 1200000,
    'SGN-HAN': 1200000,
    'HAN-DAD': 800000,
    'DAD-HAN': 800000,
    'SGN-DAD': 600000,
    'DAD-SGN': 600000,
    'HAN-CXR': 1000000,
    'CXR-HAN': 1000000,
  };
  
  const key = `${origin}-${destination}`;
  const basePrice = basePrices[key] || 900000;
  const variance = Math.floor(Math.random() * 200000) - 100000;
  return basePrice + variance;
}

/**
 * Filter flights by criteria
 * @param {Array} flights - List of flights
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered flights
 */
export function filterFlights(flights, filters) {
  if (!filters || Object.keys(filters).length === 0) return flights;
  
  return flights.filter(flight => {
    // Nếu đã format (có field price trực tiếp) thì dùng luôn, không format lại
    const f = typeof flight.dep === 'string' ? flight : formatFlight(flight);
    
    if (filters.minPrice !== undefined && f.price < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && f.price > filters.maxPrice) return false;
    
    if (filters.depTimeRange) {
      const hour = parseInt((f.dep || f.dep_time || '0').split(':')[0]);
      const [min, max] = filters.depTimeRange;
      if (hour < min || hour > max) return false;
    }
    
    if (filters.airlines?.length > 0) {
      if (!filters.airlines.includes(f.airline)) return false;
    }
    
    if (filters.aircraftTypes?.length > 0) {
      const hasMatch = filters.aircraftTypes.some(type => 
        (f.aircraft || '').toLowerCase().includes(type.toLowerCase())
      );
      if (!hasMatch) return false;
    }
    
    return true;
  });
}

/**
 * Sort flights by criteria
 * @param {Array} flights - List of flights
 * @param {string} sortBy - Sort criteria: 'price' | 'duration' | 'departure' | 'arrival'
 * @param {string} order - Sort order: 'asc' | 'desc'
 * @returns {Array} Sorted flights
 */
export function sortFlights(flights, sortBy = 'price', order = 'asc') {
  const sorted = flights.map(f => typeof f.dep === 'string' ? f : formatFlight(f));
  
  sorted.sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'price':
        comparison = a.price - b.price;
        break;
      case 'duration': {
        const parse = d => {
          const parts = String(d || '0h 0m').match(/(\d+)h\s*(\d+)/);
          return parts ? parseInt(parts[1]) * 60 + parseInt(parts[2]) : 0;
        };
        comparison = parse(a.duration) - parse(b.duration);
        break;
      }
      case 'departure':
        comparison = (a.dep || a.dep_time || '').localeCompare(b.dep || b.dep_time || '');
        break;
      case 'arrival':
        comparison = (a.arr || a.arr_time || '').localeCompare(b.arr || b.arr_time || '');
        break;
      default:
        comparison = 0;
    }
    return order === 'desc' ? -comparison : comparison;
  });
  
  return sorted;
}

export function normalizeSearchSection(section) {
  if (!section) {
    return {
      status: 'EMPTY',
      message: '',
      targetDate: '',
      days: [],
      allFlights: [],
    };
  }

  // Handle already-normalized format (already processed by this function)
  if (section.days && Array.isArray(section.days) && section.status && section.targetDate !== undefined) {
    console.log('[normalizeSearchSection] Section already normalized, returning as-is');
    return section;
  }

  // Handle old format (flat array of flights)
  if (Array.isArray(section)) {
    const flights = section.map(f => typeof f.dep === 'string' ? f : formatFlight(f));
    return {
      status: flights.length > 0 ? 'FOUND_TARGET' : 'EMPTY',
      message: '',
      targetDate: '',
      days: flights.length > 0 ? [{ date: '', label: '', isTarget: true, flights }] : [],
      allFlights: flights,
    };
  }

  /**
   * NEW FORMAT HANDLING (from updated API)
   * 
   * Input format:
   * {
   *   status: "FOUND_TARGET",
   *   message: "Tìm thấy chuyến bay vào ngày bạn chọn.",
   *   target_date: "2026-04-02",
   *   data: [
   *     {
   *       date: "2026-04-02",
   *       label: "02/04",
   *       is_target: true,
   *       flights: [
   *         {
   *           id: 20,
   *           flight_number: "VNCQ6C",
   *           std: "06:00",
   *           sta: "07:20",
   *           aircraft: "Boeing 787-9",
   *           seats: [
   *             { class: "BUSINESS", price: 800000, available: 28 },
   *             { class: "ECONOMY", price: 800000, available: 247 }
   *           ]
   *         }
   *       ]
   *     },
   *     // ... more dates
   *   ]
   * }
   * 
   * Output format suitable for display:
   * {
   *   status: "FOUND_TARGET",
   *   message: "...",
   *   targetDate: "2026-04-02",
   *   days: [
   *     {
   *       date: "2026-04-02",
   *       label: "02/04",
   *       isTarget: true,         // Converted from is_target
   *       flights: [
   *         {
   *           // All flight fields formatted and prices extracted
   *           prices: {
   *             ECONOMY: 800000,   // Extracted from seats array
   *             BUSINESS: 800000   // Extracted from seats array
   *           },
   *           isTargetDate: true,
   *           displayDateLabel: "02/04"
   *         }
   *       ]
   *     }
   *   ],
   *   allFlights: [...]  // Flattened array of all flights across all dates
   * }
   */
  const days = (section.data || []).map((day) => ({
    date: day.date || '',
    label: day.label || day.date || '',
    isTarget: Boolean(day.is_target),
    flights: (day.flights || []).map((flight) => {
      const formatted = formatFlight(flight);
      return {
        ...formatted,
        date: day.date || formatted.date || '',
        displayDateLabel: day.label || '',
        isTargetDate: Boolean(day.is_target),  // Mark as recommendation
      };
    }),
  }));

  return {
    status: section.status || (days.length > 0 ? 'FOUND_TARGET' : 'EMPTY'),
    message: section.message || '',
    targetDate: section.target_date || '',
    days,
    allFlights: days.flatMap((day) => day.flights),
  };
}

export function filterSearchSection(section, filters = {}, sortBy = 'price', order = 'asc') {
  const normalized = normalizeSearchSection(section);
  const days = normalized.days
    .map((day) => ({
      ...day,
      flights: sortFlights(filterFlights(day.flights, filters), sortBy, order),
    }))
    .filter((day) => day.flights.length > 0);

  return {
    ...normalized,
    days,
    allFlights: days.flatMap((day) => day.flights),
  };
}
