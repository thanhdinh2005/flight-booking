// src/services/flightAPI.js
const BASE_URL = 'https://backend.test/api';

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
  const depDate = new Date(flight.std);
  const arrDate = new Date(flight.sta);
  
  const dep_time = depDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const arr_time = arrDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  return {
    id:               flight.id,
    flight_number:    flight.flight_number,
    flightNo:         flight.flight_number,           // alias cho FlightResults
    airline:          flight.airline?.name || 'Vietnam Airlines',
    code:             flight.airline?.iata || 'VN',
    origin:           flight.origin.code,
    origin_name:      flight.origin.name,
    origin_city:      flight.origin.city,
    destination:      flight.destination.code,
    destination_name: flight.destination.name,
    destination_city: flight.destination.city,
    // Cả 2 tên field để tương thích FlightResults (dep/arr) và PassengerForm (dep_time/arr_time)
    dep:              dep_time,
    arr:              arr_time,
    dep_time:         dep_time,
    arr_time:         arr_time,
    dep_date:         depDate.toLocaleDateString('vi-VN'),
    arr_date:         arrDate.toLocaleDateString('vi-VN'),
    depCode:          flight.origin.code,
    arrCode:          flight.destination.code,
    depAirport:       flight.origin.name,
    arrAirport:       flight.destination.name,
    duration:         calculateDuration(depDate, arrDate),
    price:            flight.price ?? generatePrice(flight.origin.code, flight.destination.code),
    aircraft:         flight.aircraft?.model || 'Airbus A321',
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