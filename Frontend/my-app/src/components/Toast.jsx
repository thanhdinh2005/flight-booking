// src/components/Toast.jsx
import '../styles/Toast.css';

/**
 * Toast – floating notification at bottom-right.
 * Props:
 *   message  {string}  – text to display
 *   visible  {boolean} – whether visible
 */
export default function Toast({ message, visible }) {
  return (
    <div className={`toast ${visible ? 'toast--visible' : ''}`}>
      {message}
    </div>
  );
}