// src/components/tabs/TabTraCuu.jsx
// Luồng: Chọn điểm đi / điểm đến / ngày → hiển thị lịch bay theo style Việt Jett
// → "Xem chi tiết" mở modal, "Mua ngay" điều hướng sang TabMuaVe với dữ liệu đã chọn
import { useState, useEffect, useRef } from 'react';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

  .ttc-root {
    font-family: 'Plus Jakarta Sans', sans-serif;
    --teal:       #2aabab;
    --teal-dark:  #1e8888;
    --teal-dim:   rgba(42,171,171,0.10);
    --teal-mid:   rgba(42,171,171,0.22);
    --bg:         #f0fafa;
    --card:       #ffffff;
    --ink:        #1a2a2a;
    --muted:      #5a7a7a;
    --border:     #c8e8e8;
    --success:    #17a07a;
    --warn:       #e89b20;
  }

  /* ── Form ─────────────────────────────────────── */
  .ttc-form { padding: 4px 0 16px; }
  .ttc-form-row {
    display: flex; align-items: flex-end;
    gap: 10px; flex-wrap: wrap; margin-bottom: 10px;
  }
  .ttc-field {
    display: flex; flex-direction: column; gap: 5px;
    flex: 1; min-width: 150px;
  }
  .ttc-field label {
    font-size: 11px; font-weight: 700;
    letter-spacing: 1px; text-transform: uppercase;
    color: var(--muted);
  }
  .ttc-input {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px; font-weight: 600; color: var(--ink);
    padding: 10px 14px;
    border: 1.5px solid var(--border);
    border-radius: 9px; background: var(--card);
    outline: none; transition: border-color .15s;
    width: 100%; box-sizing: border-box;
  }
  .ttc-input:focus { border-color: var(--teal); }
  .ttc-input::placeholder { color: #aac8c8; font-weight: 400; }

  .ttc-swap-btn {
    font-size: 18px; color: var(--teal);
    background: var(--teal-dim);
    border: 1.5px solid var(--border);
    border-radius: 9px;
    width: 38px; height: 38px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background .15s;
    flex-shrink: 0; align-self: flex-end;
    margin-bottom: 1px;
  }
  .ttc-swap-btn:hover { background: var(--teal-mid); }

  .ttc-btn-search {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px; font-weight: 700;
    padding: 11px 28px;
    background: var(--teal); color: #fff;
    border: none; border-radius: 9px;
    cursor: pointer; white-space: nowrap;
    transition: background .15s, transform .1s;
    align-self: flex-end;
  }
  .ttc-btn-search:hover { background: var(--teal-dark); }
  .ttc-btn-search:active { transform: scale(.97); }
  .ttc-btn-search:disabled { opacity: .5; cursor: not-allowed; }

  /* ── Loading ──────────────────────────────────── */
  .ttc-loading {
    display: flex; align-items: center; gap: 10px;
    padding: 20px 0; color: var(--muted);
    font-size: 13px; font-weight: 600;
  }
  .ttc-spinner {
    width: 18px; height: 18px;
    border: 2px solid var(--teal-dim);
    border-top-color: var(--teal);
    border-radius: 50%;
    animation: ttc-spin .7s linear infinite;
  }
  @keyframes ttc-spin { to { transform: rotate(360deg); } }

  /* ── Error ────────────────────────────────────── */
  .ttc-error {
    padding: 12px 16px;
    background: rgba(224,82,82,0.08);
    border: 1px solid rgba(224,82,82,0.25);
    border-radius: 9px; color: #e05252;
    font-size: 13px; font-weight: 600;
    margin-top: 8px;
  }

  /* ── Results area ─────────────────────────────── */
  .ttc-results { margin-top: 20px; animation: ttc-fadeup .3s ease; }
  @keyframes ttc-fadeup {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .ttc-results__header { margin-bottom: 16px; }
  .ttc-results__title {
    font-size: 22px; font-weight: 700; color: var(--ink);
    margin-bottom: 6px;
  }
  .ttc-results__sub { font-size: 13px; color: var(--muted); }

  /* Route pills */
  .ttc-route-pills {
    display: flex; gap: 8px; flex-wrap: wrap;
    margin-bottom: 14px;
  }
  .ttc-route-pill {
    font-size: 13px; font-weight: 600;
    padding: 6px 14px; border-radius: 100px;
    cursor: pointer; border: 1.5px solid transparent;
    transition: all .15s;
    color: var(--muted); background: transparent;
    border-color: var(--border);
  }
  .ttc-route-pill.active {
    background: var(--teal-dim);
    border-color: var(--teal);
    color: var(--teal);
  }

  /* Sort tabs */
  .ttc-sort-row {
    display: flex; align-items: center;
    gap: 0; margin-bottom: 12px;
    border-bottom: 1px solid var(--border);
    flex-wrap: wrap;
  }
  .ttc-sort-label {
    font-size: 12px; color: var(--muted);
    font-weight: 600; padding: 8px 12px 8px 0;
    white-space: nowrap;
  }
  .ttc-sort-tab {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 12px; font-weight: 600;
    padding: 10px 16px;
    background: transparent; border: none;
    color: var(--muted); cursor: pointer;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px; transition: all .15s;
    white-space: nowrap;
  }
  .ttc-sort-tab.active {
    color: var(--teal); border-bottom-color: var(--teal);
  }

  /* Week nav */
  .ttc-week-nav {
    display: flex; justify-content: space-between;
    align-items: center; margin-bottom: 12px;
  }
  .ttc-week-btn {
    font-size: 12px; font-weight: 600; color: var(--teal);
    background: none; border: none; cursor: pointer;
    padding: 4px 8px; border-radius: 6px;
    transition: background .15s;
    display: flex; align-items: center; gap: 4px;
  }
  .ttc-week-btn:hover { background: var(--teal-dim); }
  .ttc-week-btn:disabled { opacity: .3; cursor: not-allowed; }

  /* Table */
  .ttc-table {
    background: var(--card);
    border: 1.5px solid var(--border);
    border-radius: 14px;
    overflow: hidden;
  }
  .ttc-table__head {
    display: grid;
    background: var(--teal);
    color: #fff;
    padding: 12px 20px;
    font-size: 12px; font-weight: 700;
    letter-spacing: .5px;
    grid-template-columns: 200px 1fr 200px 60px repeat(7, 44px);
    align-items: center; gap: 4px;
  }
  .ttc-table__head-month {
    grid-column: 4 / -1;
    text-align: center;
    font-size: 13px; font-weight: 700;
    padding-bottom: 4px;
    border-bottom: 1px solid rgba(255,255,255,0.2);
  }
  .ttc-table__head-row {
    display: contents;
  }
  .ttc-th { padding: 4px 6px; }
  .ttc-th--center { text-align: center; }
  .ttc-th--date {
    width: 44px; text-align: center;
    font-size: 13px; font-weight: 700;
  }
  .ttc-th--date.today {
    background: rgba(255,255,255,0.2);
    border-radius: 6px;
  }
  .ttc-th--dow { font-size: 10px; font-weight: 500; }

  .ttc-table__flight {
    border-bottom: 1px solid var(--border);
    transition: background .15s;
  }
  .ttc-table__flight:last-child { border-bottom: none; }
  .ttc-table__flight:hover { background: var(--teal-dim); }

  .ttc-flight-row {
    display: grid;
    grid-template-columns: 200px 1fr 200px 60px repeat(7, 44px);
    padding: 16px 20px;
    align-items: center; gap: 4px;
  }
  .ttc-flight-sub { font-size: 11px; color: var(--muted); margin-bottom: 3px; }
  .ttc-flight-time { font-size: 20px; font-weight: 700; color: var(--ink); }
  .ttc-flight-code { font-size: 13px; font-weight: 700; color: var(--ink); }
  .ttc-flight-terminal { font-size: 11px; color: var(--muted); }

  .ttc-flight-middle {
    display: flex; align-items: center; gap: 8px;
    padding: 0 8px;
  }
  .ttc-flight-line {
    flex: 1; height: 1px;
    background: var(--border);
    position: relative;
  }
  .ttc-flight-direct-pill {
    font-size: 10px; font-weight: 700;
    padding: 3px 8px; border-radius: 100px;
    border: 1px solid var(--border);
    color: var(--muted); white-space: nowrap;
  }

  .ttc-flight-airline {
    display: flex; align-items: center; gap: 8px;
    font-size: 12px; color: var(--muted);
  }
  .ttc-flight-airline-logo { font-size: 18px; }
  .ttc-flight-nofly {
    text-align: center; font-size: 18px;
    color: var(--border);
  }
  .ttc-flight-fly {
    text-align: center; font-size: 16px;
    color: var(--teal); cursor: pointer;
    transition: transform .15s;
  }
  .ttc-flight-fly:hover { transform: scale(1.2); }
  .ttc-flight-fly.today-col { color: var(--teal-dark); font-size: 18px; }

  /* Action buttons in flight row */
  .ttc-flight-actions {
    display: flex; flex-direction: column; gap: 6px;
    grid-column: span 0;
  }

  /* We put actions after table — per-row modal trigger below */

  /* Flight detail expansion */
  .ttc-flight-detail {
    background: #f8fdfd;
    border-top: 1px dashed var(--border);
    padding: 14px 20px;
    display: flex; gap: 12px; flex-wrap: wrap;
    align-items: center; justify-content: space-between;
    animation: ttc-fadeup .2s ease;
  }
  .ttc-flight-detail__info {
    display: flex; gap: 24px; flex-wrap: wrap;
  }
  .ttc-detail-kv { min-width: 100px; }
  .ttc-detail-kv__k {
    font-size: 10px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 1px;
    color: var(--muted); margin-bottom: 3px;
  }
  .ttc-detail-kv__v {
    font-size: 13px; font-weight: 700; color: var(--ink);
  }
  .ttc-flight-detail__btns {
    display: flex; gap: 8px; flex-wrap: wrap;
  }
  .ttc-btn-detail {
    font-size: 13px; font-weight: 600;
    padding: 9px 18px;
    border: 1.5px solid var(--border);
    background: transparent; color: var(--muted);
    cursor: pointer; border-radius: 8px;
    transition: all .15s; white-space: nowrap;
  }
  .ttc-btn-detail:hover { border-color: var(--teal); color: var(--teal); }
  .ttc-btn-buy {
    font-size: 13px; font-weight: 700;
    padding: 9px 18px;
    background: var(--teal); color: #fff;
    border: none; cursor: pointer; border-radius: 8px;
    transition: background .15s; white-space: nowrap;
  }
  .ttc-btn-buy:hover { background: var(--teal-dark); }

  /* ── Detail Modal ─────────────────────────────── */
  .ttc-modal-overlay {
    position: fixed; inset: 0; z-index: 999;
    background: rgba(26,42,42,0.5);
    backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .ttc-modal {
    background: #fff;
    border-radius: 16px;
    width: 100%; max-width: 540px;
    max-height: 90vh; overflow-y: auto;
    box-shadow: 0 24px 64px rgba(42,171,171,0.18);
    border: 1.5px solid rgba(42,171,171,0.2);
    animation: ttc-fadeup .25s ease;
  }
  .ttc-modal__topbar {
    height: 3px;
    background: linear-gradient(90deg, #2aabab, #4ecfcf, #2aabab);
    background-size: 200% 100%;
    animation: ttc-shimmer 2.5s linear infinite;
    border-radius: 16px 16px 0 0;
  }
  @keyframes ttc-shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  .ttc-modal__header {
    padding: 20px 24px 14px;
    display: flex; align-items: flex-start;
    justify-content: space-between;
    border-bottom: 1px solid rgba(42,171,171,0.12);
    position: sticky; top: 0;
    background: #fff; z-index: 2;
  }
  .ttc-modal__eyebrow {
    font-size: 10px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase;
    color: var(--teal); margin-bottom: 4px;
  }
  .ttc-modal__title {
    font-size: 20px; font-weight: 700; color: var(--ink);
  }
  .ttc-modal__sub { font-size: 12px; color: var(--muted); margin-top: 2px; }
  .ttc-modal__close {
    background: none; border: none;
    font-size: 16px; color: var(--muted);
    cursor: pointer; padding: 4px 6px; border-radius: 6px;
    transition: background .15s;
  }
  .ttc-modal__close:hover { background: var(--teal-dim); color: var(--teal); }

  .ttc-modal__timeline {
    display: flex; align-items: center;
    padding: 20px 24px;
    background: var(--teal-dim); gap: 12px;
  }
  .ttc-modal__tl-point { min-width: 80px; }
  .ttc-modal__tl-point--right { text-align: right; min-width: 80px; }
  .ttc-modal__tl-time {
    font-size: 30px; font-weight: 700; color: var(--ink);
  }
  .ttc-modal__tl-code {
    font-size: 15px; font-weight: 700; color: var(--teal);
  }
  .ttc-modal__tl-city { font-size: 11px; color: var(--muted); }
  .ttc-modal__tl-mid { flex: 1; text-align: center; }
  .ttc-modal__tl-dur { font-size: 11px; color: var(--muted); margin-bottom: 4px; }
  .ttc-modal__tl-line {
    height: 1px; background: var(--teal);
    position: relative; margin: 6px 0;
  }
  .ttc-modal__tl-plane {
    position: absolute; right: -1px; top: -8px;
    font-size: 14px; color: var(--teal);
  }
  .ttc-modal__tl-direct {
    font-size: 10px; font-weight: 700;
    color: var(--teal); letter-spacing: .5px;
  }

  .ttc-modal__section {
    padding: 14px 24px;
    border-bottom: 1px solid rgba(42,171,171,0.08);
  }
  .ttc-modal__sec-title {
    font-size: 10px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase;
    color: var(--teal); margin-bottom: 10px;
  }
  .ttc-modal__grid2 {
    display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
  }
  .ttc-modal__kv__k { font-size: 10px; color: var(--muted); margin-bottom: 2px; }
  .ttc-modal__kv__v { font-size: 13px; font-weight: 700; color: var(--ink); }

  .ttc-modal__footer {
    padding: 14px 24px 18px;
    display: flex; align-items: center;
    justify-content: space-between;
    position: sticky; bottom: 0;
    background: #fff;
    border-top: 1px solid rgba(42,171,171,0.12);
    flex-wrap: wrap; gap: 12px; z-index: 2;
  }
  .ttc-modal__price-block {}
  .ttc-modal__price {
    font-size: 24px; font-weight: 700; color: var(--teal);
  }
  .ttc-modal__price-note { font-size: 11px; color: var(--muted); }
  .ttc-modal__buy-btn {
    font-size: 14px; font-weight: 700;
    padding: 11px 24px;
    background: var(--teal); color: #fff;
    border: none; cursor: pointer; border-radius: 9px;
    transition: background .15s;
  }
  .ttc-modal__buy-btn:hover { background: var(--teal-dark); }

  @media (max-width: 700px) {
    .ttc-table__head,
    .ttc-flight-row {
      grid-template-columns: 1fr 1fr;
    }
    .ttc-th--date, .ttc-flight-nofly, .ttc-flight-fly { display: none; }
    .ttc-flight-middle { padding: 0; }
  }

  /* ── MiniCalendar ─────────────────────────────── */
  .mc-wrap {
    position: relative;
    flex: 1; min-width: 150px; max-width: 200px;
  }
  .mc-trigger {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px; font-weight: 600; color: var(--ink);
    padding: 10px 14px 10px 38px;
    border: 1.5px solid var(--border);
    border-radius: 9px; background: var(--card);
    outline: none; cursor: pointer;
    transition: border-color .15s;
    width: 100%; box-sizing: border-box;
    text-align: left; white-space: nowrap;
    display: flex; align-items: center;
    position: relative;
  }
  .mc-trigger:hover, .mc-trigger:focus { border-color: var(--teal); }
  .mc-trigger.open { border-color: var(--teal); box-shadow: 0 0 0 3px rgba(42,171,171,0.12); }
  .mc-trigger-icon {
    position: absolute; left: 12px; top: 50%;
    transform: translateY(-50%);
    font-size: 15px; pointer-events: none;
  }
  .mc-trigger-label { flex: 1; }
  .mc-trigger-caret {
    font-size: 10px; color: var(--muted);
    margin-left: 6px; transition: transform .2s;
  }
  .mc-trigger.open .mc-trigger-caret { transform: rotate(180deg); }

  .mc-dropdown {
    position: absolute; top: calc(100% + 6px); left: 0;
    z-index: 100;
    background: var(--card);
    border: 1.5px solid var(--border);
    border-radius: 14px;
    box-shadow: 0 12px 40px rgba(42,171,171,0.18);
    padding: 16px;
    width: 280px;
    animation: mc-pop .18s ease;
  }
  @keyframes mc-pop {
    from { opacity: 0; transform: translateY(-8px) scale(.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  .mc-nav {
    display: flex; align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  .mc-nav-btn {
    width: 28px; height: 28px;
    border: 1.5px solid var(--border);
    border-radius: 7px; background: transparent;
    color: var(--teal); font-size: 13px;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: background .15s;
  }
  .mc-nav-btn:hover { background: var(--teal-dim); }
  .mc-nav-label {
    font-size: 14px; font-weight: 700; color: var(--ink);
  }

  .mc-dow-row {
    display: grid; grid-template-columns: repeat(7, 1fr);
    gap: 2px; margin-bottom: 6px;
  }
  .mc-dow {
    text-align: center;
    font-size: 10px; font-weight: 700;
    color: var(--muted); padding: 4px 0;
    letter-spacing: .5px;
  }

  .mc-grid {
    display: grid; grid-template-columns: repeat(7, 1fr);
    gap: 2px;
  }
  .mc-cell {
    aspect-ratio: 1;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 600;
    border-radius: 7px; cursor: pointer;
    color: var(--ink);
    transition: background .12s, color .12s;
    border: 1.5px solid transparent;
  }
  .mc-cell:hover:not(.mc-cell--empty):not(.mc-cell--past) {
    background: var(--teal-dim);
    border-color: var(--teal-mid);
    color: var(--teal);
  }
  .mc-cell--empty { cursor: default; }
  .mc-cell--past { color: #b8d8d8; cursor: not-allowed; }
  .mc-cell--today {
    color: var(--teal); font-weight: 700;
    border-color: var(--teal-mid);
  }
  .mc-cell--selected {
    background: var(--teal) !important;
    color: #fff !important;
    border-color: var(--teal) !important;
    box-shadow: 0 2px 8px rgba(42,171,171,0.35);
  }

  .mc-footer {
    margin-top: 12px; padding-top: 10px;
    border-top: 1px solid var(--border);
    display: flex; justify-content: flex-end; gap: 8px;
  }
  .mc-today-btn {
    font-size: 11px; font-weight: 600; color: var(--teal);
    background: var(--teal-dim); border: none;
    padding: 5px 12px; border-radius: 6px;
    cursor: pointer; transition: background .15s;
  }
  .mc-today-btn:hover { background: var(--teal-mid); }
  .mc-close-btn {
    font-size: 11px; font-weight: 600; color: var(--muted);
    background: transparent; border: 1px solid var(--border);
    padding: 5px 12px; border-radius: 6px;
    cursor: pointer; transition: all .15s;
  }
  .mc-close-btn:hover { border-color: var(--teal); color: var(--teal); }
`;

// ── MiniCalendar component ────────────────────────────────────────────────────
const MONTHS_VI = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
                   'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
const DOWS_VI   = ['CN','T2','T3','T4','T5','T6','T7'];

function MiniCalendar({ value, onChange, onClose }) {
  const todayObj = new Date();
  todayObj.setHours(0,0,0,0);
  const init = value ? new Date(value + 'T00:00:00') : todayObj;
  const [yr, setYr] = useState(init.getFullYear());
  const [mo, setMo] = useState(init.getMonth());

  const firstDay    = new Date(yr, mo, 1).getDay();
  const daysInMonth = new Date(yr, mo + 1, 0).getDate();
  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const pad = cells.length % 7 ? 7 - (cells.length % 7) : 0;
  for (let i = 0; i < pad; i++) cells.push(null);

  function prev() { mo === 0 ? (setYr(y => y - 1), setMo(11)) : setMo(m => m - 1); }
  function next() { mo === 11 ? (setYr(y => y + 1), setMo(0)) : setMo(m => m + 1); }

  function pickDate(day) {
    if (!day) return;
    const d = new Date(yr, mo, day);
    d.setHours(0,0,0,0);
    if (d < todayObj) return; // past
    const iso = `${yr}-${String(mo+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    onChange(iso);
    onClose();
  }

  function goToday() {
    const iso = todayObj.toISOString().slice(0, 10);
    onChange(iso);
    onClose();
  }

  const selDate = value ? new Date(value + 'T00:00:00') : null;

  function cellClass(day) {
    if (!day) return 'mc-cell mc-cell--empty';
    const d = new Date(yr, mo, day);
    d.setHours(0,0,0,0);
    if (d < todayObj) return 'mc-cell mc-cell--past';
    const isToday    = d.getTime() === todayObj.getTime();
    const isSelected = selDate && d.getTime() === selDate.getTime();
    if (isSelected) return 'mc-cell mc-cell--selected';
    if (isToday)    return 'mc-cell mc-cell--today';
    return 'mc-cell';
  }

  return (
    <div className="mc-dropdown" onClick={e => e.stopPropagation()}>
      <div className="mc-nav">
        <button className="mc-nav-btn" onClick={prev}>‹</button>
        <span className="mc-nav-label">{MONTHS_VI[mo]} {yr}</span>
        <button className="mc-nav-btn" onClick={next}>›</button>
      </div>
      <div className="mc-dow-row">
        {DOWS_VI.map(d => <div className="mc-dow" key={d}>{d}</div>)}
      </div>
      <div className="mc-grid">
        {cells.map((day, i) => (
          <div
            key={i}
            className={cellClass(day)}
            onClick={() => pickDate(day)}
          >
            {day || ''}
          </div>
        ))}
      </div>
      <div className="mc-footer">
        <button className="mc-close-btn" onClick={onClose}>Đóng</button>
        <button className="mc-today-btn" onClick={goToday}>Hôm nay</button>
      </div>
    </div>
  );
}

// ── DatePicker wrapper ────────────────────────────────────────────────────────
function DatePickerField({ label, value, onChange }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  // Format display: DD/MM/YYYY
  function fmtDisplay(iso) {
    if (!iso) return 'Chọn ngày';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  function handleTriggerClick() { setOpen(o => !o); }

  return (
    <div className="mc-wrap" style={{ maxWidth: 200 }} ref={wrapRef}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 5 }}>
        {label}
      </div>
      <button
        className={`mc-trigger${open ? ' open' : ''}`}
        onClick={handleTriggerClick}
        type="button"
      >
        <span className="mc-trigger-icon">📅</span>
        <span className="mc-trigger-label">{fmtDisplay(value)}</span>
        <span className="mc-trigger-caret">▾</span>
      </button>
      {open && (
        <MiniCalendar
          value={value}
          onChange={v => { onChange(v); }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

// ── Mock data ──────────────────────────────────────────────────────────────────
const AIRPORTS = [
  'Tp. Hồ Chí Minh (SGN)',
  'Hà Nội (HAN)',
  'Đà Nẵng (DAD)',
  'Phú Quốc (PQC)',
  'Đà Lạt (DLI)',
  'Nha Trang (CXR)',
  'Huế (HUI)',
  'Cần Thơ (VCA)',
];

const MOCK_ROUTES = {
  'SGN-DAD': [
    {
      id: 'f1', depTime: '08:05', arrTime: '09:20', duration: '1g 15p',
      depCode: 'SGN', depTerminal: 'Nhà ga 3',
      arrCode: 'DAD', arrTerminal: 'Nhà ga 1',
      airline: 'Vietnam Airlines', logo: '🌸', flightNo: 'VN 134',
      aircraft: 'Airbus A321', price: 890000, class: 'Phổ thông',
      baggage: '7kg xách tay', checkin: '23kg (có phí)',
      refund: 'Phí 30% trước 24h',
      weeklyAvail: [false, false, false, true, true, true, true],
    },
    {
      id: 'f2', depTime: '10:45', arrTime: '12:00', duration: '1g 15p',
      depCode: 'SGN', depTerminal: 'Nhà ga 1',
      arrCode: 'DAD', arrTerminal: 'Nhà ga 1',
      airline: 'VietJet Air', logo: '🔴', flightNo: 'VJ 578',
      aircraft: 'Airbus A320', price: 650000, class: 'Phổ thông',
      baggage: '7kg xách tay', checkin: 'Không có',
      refund: 'Không hoàn',
      weeklyAvail: [true, true, false, true, true, false, true],
    },
    {
      id: 'f3', depTime: '14:30', arrTime: '15:45', duration: '1g 15p',
      depCode: 'SGN', depTerminal: 'Nhà ga 3',
      arrCode: 'DAD', arrTerminal: 'Nhà ga 1',
      airline: 'Bamboo Airways', logo: '🎋', flightNo: 'QH 410',
      aircraft: 'Boeing 737', price: 780000, class: 'Phổ thông',
      baggage: '10kg xách tay', checkin: '20kg',
      refund: 'Phí 25% trước 48h',
      weeklyAvail: [false, true, true, false, true, true, true],
    },
  ],
  'HAN-SGN': [
    {
      id: 'f4', depTime: '07:00', arrTime: '09:10', duration: '2g 10p',
      depCode: 'HAN', depTerminal: 'Nhà ga 2',
      arrCode: 'SGN', arrTerminal: 'Nhà ga 1',
      airline: 'Vietnam Airlines', logo: '🌸', flightNo: 'VN 201',
      aircraft: 'Airbus A321', price: 1250000, class: 'Phổ thông',
      baggage: '7kg xách tay', checkin: '23kg (có phí)',
      refund: 'Phí 30% trước 24h',
      weeklyAvail: [true, true, true, true, true, true, true],
    },
    {
      id: 'f5', depTime: '09:30', arrTime: '11:45', duration: '2g 15p',
      depCode: 'HAN', depTerminal: 'Nhà ga 2',
      arrCode: 'SGN', arrTerminal: 'Nhà ga 1',
      airline: 'VietJet Air', logo: '🔴', flightNo: 'VJ 134',
      aircraft: 'Airbus A320', price: 890000, class: 'Phổ thông',
      baggage: '7kg xách tay', checkin: 'Không có',
      refund: 'Không hoàn',
      weeklyAvail: [true, false, true, true, false, true, true],
    },
  ],
};

function getRouteKey(from, to) {
  const f = from.match(/\((\w+)\)/)?.[1] || from.slice(0, 3).toUpperCase();
  const t = to.match(/\((\w+)\)/)?.[1] || to.slice(0, 3).toUpperCase();
  return `${f}-${t}`;
}

function fmtPrice(n) { return n.toLocaleString('vi-VN') + '₫'; }

// Week days from today
function getWeekDays(baseDate) {
  const days = [];
  const base = new Date(baseDate);
  const dowVi = ['CN', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7'];
  for (let i = 0; i < 7; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    days.push({
      date: d.getDate(),
      dow: dowVi[d.getDay()],
      full: d.toLocaleDateString('vi-VN'),
      isToday: i === 0,
    });
  }
  return days;
}

// ── Detail Modal ──────────────────────────────────────────────────────────────
function FlightDetailModal({ flight, date, onClose, onBuy }) {
  return (
    <div className="ttc-modal-overlay" onClick={onClose}>
      <div className="ttc-modal" onClick={e => e.stopPropagation()}>
        <div className="ttc-modal__topbar" />
        <div className="ttc-modal__header">
          <div>
            <div className="ttc-modal__eyebrow">Chi tiết chuyến bay</div>
            <div className="ttc-modal__title">{flight.airline}</div>
            <div className="ttc-modal__sub">{flight.flightNo} · {flight.aircraft} · {date}</div>
          </div>
          <button className="ttc-modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="ttc-modal__timeline">
          <div className="ttc-modal__tl-point">
            <div className="ttc-modal__tl-time">{flight.depTime}</div>
            <div className="ttc-modal__tl-code">{flight.depCode}</div>
            <div className="ttc-modal__tl-city">{flight.depTerminal}</div>
          </div>
          <div className="ttc-modal__tl-mid">
            <div className="ttc-modal__tl-dur">{flight.duration}</div>
            <div className="ttc-modal__tl-line">
              <span className="ttc-modal__tl-plane">✈</span>
            </div>
            <div className="ttc-modal__tl-direct">Bay thẳng</div>
          </div>
          <div className="ttc-modal__tl-point ttc-modal__tl-point--right">
            <div className="ttc-modal__tl-time">{flight.arrTime}</div>
            <div className="ttc-modal__tl-code">{flight.arrCode}</div>
            <div className="ttc-modal__tl-city">{flight.arrTerminal}</div>
          </div>
        </div>

        <div className="ttc-modal__section">
          <div className="ttc-modal__sec-title">Thông tin chuyến bay</div>
          <div className="ttc-modal__grid2">
            {[
              ['Số hiệu', flight.flightNo],
              ['Tàu bay', flight.aircraft],
              ['Hạng ghế', flight.class],
              ['Thời gian bay', flight.duration],
              ['Hành lý xách tay', flight.baggage],
              ['Hành lý ký gửi', flight.checkin],
              ['Hoàn vé', flight.refund],
            ].map(([k, v]) => (
              <div key={k}>
                <div className="ttc-modal__kv__k">{k}</div>
                <div className="ttc-modal__kv__v">{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="ttc-modal__footer">
          <div className="ttc-modal__price-block">
            <div className="ttc-modal__price">{fmtPrice(flight.price)}</div>
            <div className="ttc-modal__price-note">Giá mỗi người · đã bao gồm thuế</div>
          </div>
          <button className="ttc-modal__buy-btn" onClick={() => { onBuy(flight); onClose(); }}>
            Mua ngay →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function TabTraCuu({ onSelectFlight }) {
  const [from, setFrom]       = useState('Tp. Hồ Chí Minh (SGN)');
  const [to, setTo]           = useState('');
  const [date, setDate]       = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [results, setResults] = useState(null);
  const [sortBy, setSortBy]   = useState('dep');
  const [expandedId, setExpandedId] = useState(null);
  const [modalFlight, setModalFlight] = useState(null);
  const [weekOffset, setWeekOffset]   = useState(0);

  // base date for week display
  const baseDate = new Date(date);
  baseDate.setDate(baseDate.getDate() + weekOffset * 7);
  const weekDays = getWeekDays(baseDate);

  function swap() { const tmp = from; setFrom(to); setTo(tmp); }

  function handleSearch() {
    if (!to) { setError('Vui lòng chọn điểm đến!'); return; }
    setError(''); setResults(null); setLoading(true); setExpandedId(null);
    setTimeout(() => {
      setLoading(false);
      const key = getRouteKey(from, to);
      const data = MOCK_ROUTES[key] || MOCK_ROUTES['SGN-DAD']; // fallback to sample
      setResults({ flights: data, from, to, date });
    }, 900);
  }

  function handleKeyDown(e) { if (e.key === 'Enter') handleSearch(); }

  function sorted(flights) {
    return [...flights].sort((a, b) => {
      if (sortBy === 'dep') return a.depTime.localeCompare(b.depTime);
      if (sortBy === 'arr') return a.arrTime.localeCompare(b.arrTime);
      if (sortBy === 'dur') return a.duration.localeCompare(b.duration);
      return 0;
    });
  }

  function handleBuy(flight) {
    if (onSelectFlight) {
      onSelectFlight({
        flight,
        searchData: {
          from: results.from,
          to: results.to,
          date: results.date,
          passengers: '1',
        },
      });
    }
  }

  const displayedDate = weekDays[0]?.full || date;

  return (
    <>
      <style>{css}</style>
      <div className="ttc-root">

        {/* Detail modal */}
        {modalFlight && (
          <FlightDetailModal
            flight={modalFlight}
            date={displayedDate}
            onClose={() => setModalFlight(null)}
            onBuy={handleBuy}
          />
        )}

        {/* Form */}
        <div className="ttc-form">
          <div className="ttc-form-row">
            <div className="ttc-field">
              <label>Điểm đi</label>
              <input
                className="ttc-input"
                list="ttc-airports-from"
                value={from}
                onChange={e => { setFrom(e.target.value); setError(''); }}
                placeholder="Chọn điểm khởi hành"
                onKeyDown={handleKeyDown}
              />
              <datalist id="ttc-airports-from">
                {AIRPORTS.map(a => <option key={a} value={a} />)}
              </datalist>
            </div>

            <button className="ttc-swap-btn" onClick={swap} title="Đổi chiều">⇄</button>

            <div className="ttc-field">
              <label>Điểm đến</label>
              <input
                className="ttc-input"
                list="ttc-airports-to"
                value={to}
                onChange={e => { setTo(e.target.value); setError(''); }}
                placeholder="Chọn điểm đến"
                onKeyDown={handleKeyDown}
              />
              <datalist id="ttc-airports-to">
                {AIRPORTS.filter(a => a !== from).map(a => <option key={a} value={a} />)}
              </datalist>
            </div>

            <DatePickerField
              label="Ngày đi"
              value={date}
              onChange={v => { setDate(v); setWeekOffset(0); }}
            />

            <button className="ttc-btn-search" onClick={handleSearch} disabled={loading}>
              {loading ? 'Đang tìm...' : 'Tìm kiếm'}
            </button>
          </div>
        </div>

        {error && <div className="ttc-error">⚠ {error}</div>}

        {loading && (
          <div className="ttc-loading">
            <div className="ttc-spinner" />
            Đang tra cứu lịch bay...
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="ttc-results">
            <div className="ttc-results__header">
              <div className="ttc-results__title">Tra cứu lịch bay</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>Chặng bay</div>

              {/* Route pills */}
              <div className="ttc-route-pills">
                <button className="ttc-route-pill active">
                  {getRouteKey(results.from, results.to).replace('-', ' → ')} →&nbsp;
                  {results.from.match(/\((\w+)\)/)?.[1]} đến {results.to.match(/\((\w+)\)/)?.[1]}
                </button>
              </div>
            </div>

            {/* Sort */}
            <div className="ttc-sort-row">
              <span className="ttc-sort-label">Sắp xếp theo</span>
              {[
                ['dep', 'Thời gian khởi hành'],
                ['arr', 'Thời gian đến'],
                ['dur', 'Thời gian bay'],
              ].map(([v, l]) => (
                <button
                  key={v}
                  className={`ttc-sort-tab${sortBy === v ? ' active' : ''}`}
                  onClick={() => setSortBy(v)}
                >{l}</button>
              ))}

              {/* week navigation pushed right */}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  className="ttc-week-btn"
                  disabled={weekOffset === 0}
                  onClick={() => setWeekOffset(w => w - 1)}
                >← Tuần trước</button>
                <button
                  className="ttc-week-btn"
                  onClick={() => setWeekOffset(w => w + 1)}
                >Tuần sau →</button>
              </div>
            </div>

            {/* Table */}
            <div className="ttc-table">
              {/* Header */}
              <div>
                <div className="ttc-table__head">
                  <div className="ttc-th">Thời gian khởi hành</div>
                  <div className="ttc-th" />
                  <div className="ttc-th">Thời gian đến</div>
                  <div className="ttc-th ttc-th--center">Hãng</div>
                  {/* Month label spans all 7 days */}
                  <div className="ttc-th--date" style={{ gridColumn: 'span 7', textAlign: 'center', fontSize: 13 }}>
                    Tháng {baseDate.getMonth() + 1}
                  </div>
                </div>
                {/* Sub-header row for day numbers */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '200px 1fr 200px 60px repeat(7, 44px)',
                  background: 'var(--teal)',
                  padding: '0 20px 10px',
                  gap: 4,
                }}>
                  <div /><div /><div /><div />
                  {weekDays.map((d, i) => (
                    <div
                      key={i}
                      style={{
                        textAlign: 'center', color: '#fff',
                        background: d.isToday ? 'rgba(255,255,255,0.2)' : 'transparent',
                        borderRadius: 6, padding: '4px 2px',
                      }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{d.date}</div>
                      <div style={{ fontSize: 10, opacity: .8 }}>{d.dow}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Flight rows */}
              {sorted(results.flights).map(f => (
                <div className="ttc-table__flight" key={f.id}>
                  <div className="ttc-flight-row"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setExpandedId(expandedId === f.id ? null : f.id)}
                  >
                    {/* Dep */}
                    <div>
                      <div className="ttc-flight-sub">Thời gian bay: {f.duration}</div>
                      <div className="ttc-flight-time">{f.depTime}</div>
                      <div className="ttc-flight-code">{f.depCode}</div>
                      <div className="ttc-flight-terminal">{f.depTerminal}</div>
                    </div>

                    {/* Middle */}
                    <div className="ttc-flight-middle">
                      <div className="ttc-flight-line" />
                      <div className="ttc-flight-direct-pill">Bay thẳng</div>
                      <div className="ttc-flight-line" />
                    </div>

                    {/* Arr */}
                    <div>
                      <div className="ttc-flight-sub">&nbsp;</div>
                      <div className="ttc-flight-time">{f.arrTime}</div>
                      <div className="ttc-flight-code">{f.arrCode}</div>
                      <div className="ttc-flight-terminal">{f.arrTerminal}</div>
                    </div>

                    {/* Airline */}
                    <div className="ttc-flight-airline">
                      <span className="ttc-flight-airline-logo">{f.logo}</span>
                      <span style={{ fontSize: 10 }}>{f.flightNo}</span>
                    </div>

                    {/* Weekly availability */}
                    {weekDays.map((d, i) => (
                      <div
                        key={i}
                        className={f.weeklyAvail[i]
                          ? `ttc-flight-fly${d.isToday ? ' today-col' : ''}`
                          : 'ttc-flight-nofly'}
                        onClick={e => {
                          if (f.weeklyAvail[i]) {
                            e.stopPropagation();
                            setModalFlight(f);
                          }
                        }}
                        title={f.weeklyAvail[i] ? `Có chuyến bay ngày ${d.full}` : 'Không có chuyến bay'}
                      >
                        {f.weeklyAvail[i] ? '✈' : '–'}
                      </div>
                    ))}
                  </div>

                  {/* Expanded detail row */}
                  {expandedId === f.id && (
                    <div className="ttc-flight-detail">
                      <div className="ttc-flight-detail__info">
                        {[
                          ['Tàu bay', f.aircraft],
                          ['Hạng vé', f.class],
                          ['Hành lý xách tay', f.baggage],
                          ['Ký gửi', f.checkin],
                          ['Hoàn vé', f.refund],
                          ['Giá từ', fmtPrice(f.price) + '/người'],
                        ].map(([k, v]) => (
                          <div className="ttc-detail-kv" key={k}>
                            <div className="ttc-detail-kv__k">{k}</div>
                            <div className="ttc-detail-kv__v">{v}</div>
                          </div>
                        ))}
                      </div>
                      <div className="ttc-flight-detail__btns">
                        <button
                          className="ttc-btn-detail"
                          onClick={() => setModalFlight(f)}
                        >Xem chi tiết</button>
                        <button
                          className="ttc-btn-buy"
                          onClick={() => handleBuy(f)}
                        >Mua ngay →</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12, textAlign: 'right' }}>
              * Giá đã bao gồm thuế và phí. Click vào hàng để xem thêm chi tiết.
            </div>
          </div>
        )}
      </div>
    </>
  );
}