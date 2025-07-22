export function formatDate(dateString) {
  const d = new Date(dateString);
  const year = d.getFullYear();
  const month = d.toLocaleString('default', { month: 'long' });
  const day = d.getDate();
  return `${day} ${month}, ${year}`;
} 