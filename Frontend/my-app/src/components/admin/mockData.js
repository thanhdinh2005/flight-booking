/* ─── Mock Data ─── */
export const INIT_CUSTOMERS = [
  { id: 'KH001', name: 'Nguyễn Văn An',    email: 'an@mail.com',   phone: '+84 901 234 567', status: 'active',    tickets: 5,  joined: '2024-01-15' },
  { id: 'KH002', name: 'Trần Thị Bảo',     email: 'bao@mail.com',  phone: '+84 912 345 678', status: 'active',    tickets: 12, joined: '2023-11-02' },
  { id: 'KH003', name: 'Lê Minh Châu',     email: 'chau@mail.com', phone: '+84 923 456 789', status: 'suspended', tickets: 3,  joined: '2024-03-20' },
  { id: 'KH004', name: 'Phạm Quốc Dũng',   email: 'dung@mail.com', phone: '+84 934 567 890', status: 'active',    tickets: 8,  joined: '2023-08-14' },
  { id: 'KH005', name: 'Hoàng Thu Hà',     email: 'ha@mail.com',   phone: '+84 945 678 901', status: 'inactive',  tickets: 1,  joined: '2024-05-01' },
]

export const INIT_FLIGHTS = [
  { id: 'VN201', from: 'HAN', to: 'SGN', dep: '06:00', arr: '08:10', date: '2026-03-15', seats: 180, sold: 142, price: 1250000, status: 'scheduled' },
  { id: 'VN305', from: 'SGN', to: 'DAD', dep: '09:30', arr: '10:45', date: '2026-03-15', seats: 120, sold: 98,  price: 890000,  status: 'boarding'  },
  { id: 'VN412', from: 'HAN', to: 'DAD', dep: '13:00', arr: '14:30', date: '2026-03-16', seats: 180, sold: 67,  price: 1050000, status: 'scheduled' },
  { id: 'VN508', from: 'SGN', to: 'HAN', dep: '17:45', arr: '19:55', date: '2026-03-16', seats: 180, sold: 180, price: 1350000, status: 'full'      },
  { id: 'VN615', from: 'DAD', to: 'HAN', dep: '20:00', arr: '21:25', date: '2026-03-17', seats: 120, sold: 0,   price: 950000,  status: 'scheduled' },
]

export const INIT_TICKETS = [
  { id: 'TK-88001', customer: 'Nguyễn Văn An',  flight: 'VN201', seat: '12A', class: 'Economy',  price: 1250000, status: 'confirmed', issued: '2026-03-10' },
  { id: 'TK-88002', customer: 'Trần Thị Bảo',   flight: 'VN305', seat: '5C',  class: 'Business', price: 2400000, status: 'confirmed', issued: '2026-03-09' },
  { id: 'TK-88003', customer: 'Lê Minh Châu',   flight: 'VN201', seat: '28F', class: 'Economy',  price: 1250000, status: 'refunded',  issued: '2026-03-08' },
  { id: 'TK-88004', customer: 'Phạm Quốc Dũng', flight: 'VN412', seat: '15B', class: 'Economy',  price: 1050000, status: 'confirmed', issued: '2026-03-11' },
  { id: 'TK-88005', customer: 'Hoàng Thu Hà',   flight: 'VN508', seat: '3A',  class: 'Business', price: 3200000, status: 'cancelled', issued: '2026-03-07' },
]

export const INIT_LOGS = [
  { id: 1, user: 'admin@whisper.vn', action: 'Tạo chuyến bay VN615',       target: 'Flight VN615',  time: '2026-03-11 14:32:01', ip: '192.168.1.10',  type: 'create' },
  { id: 2, user: 'KH002',            action: 'Đặt vé TK-88002',            target: 'Ticket TK-88002',time:'2026-03-09 10:15:44', ip: '113.22.45.67',  type: 'book'   },
  { id: 3, user: 'KH003',            action: 'Yêu cầu hoàn vé TK-88003',  target: 'Ticket TK-88003',time:'2026-03-08 16:22:30', ip: '113.44.66.88',  type: 'refund' },
  { id: 4, user: 'admin@whisper.vn', action: 'Xóa khách hàng KH006',      target: 'Customer KH006', time: '2026-03-11 11:05:12', ip: '192.168.1.10',  type: 'delete' },
  { id: 5, user: 'KH005',            action: 'Hủy vé TK-88005',           target: 'Ticket TK-88005',time:'2026-03-07 09:44:55', ip: '171.33.22.11',  type: 'cancel' },
  { id: 6, user: 'admin@whisper.vn', action: 'Đổi chỗ vé TK-88001',      target: 'Ticket TK-88001',time:'2026-03-10 13:18:40', ip: '192.168.1.10',  type: 'update' },
]

export const TOP_ROUTES = [
  { route: 'HAN → SGN', pct: 94, rev: 1240000000 },
  { route: 'SGN → HAN', pct: 88, rev: 1080000000 },
  { route: 'HAN → DAD', pct: 72, rev: 760000000  },
  { route: 'SGN → DAD', pct: 65, rev: 540000000  },
]
